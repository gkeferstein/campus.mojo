import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { getCourses, getCourseBySlug, type Course, type Module, type Lesson } from '../lib/directus.js';
import { logger } from '../lib/logger.js';

interface CourseWithProgress extends Course {
  enrolled: boolean;
  progress: number;
  hasAccess: boolean;
}

interface ModuleWithProgress extends Module {
  lessons: LessonWithProgress[];
}

interface LessonWithProgress extends Lesson {
  completed: boolean;
}

export async function coursesRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /courses - List all courses with progress
  fastify.get('/courses', {
    preHandler: [optionalAuth],
  }, async (request, reply) => {
    const tenantId = request.user?.tenantId || undefined;
    
    // Get courses from Directus (graceful fallback if Directus not configured)
    let courses: Course[] = [];
    try {
      courses = await getCourses(tenantId);
    } catch (error) {
      logger.warn({ err: error }, 'Directus not available or courses collection not configured');
      // Return empty array - courses need to be set up in Directus CMS
    }

    if (!request.user) {
      // Unauthenticated: return courses without progress
      const result: CourseWithProgress[] = courses.map(course => ({
        ...course,
        enrolled: false,
        progress: 0,
        hasAccess: false,
      }));
      return reply.send(result);
    }

    // Get user's enrollments and entitlements
    const [enrollments, entitlements] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: request.user.id },
      }),
      prisma.entitlement.findMany({
        where: {
          userId: request.user.id,
          revokedAt: null,
          OR: [
            { validUntil: null },
            { validUntil: { gte: new Date() } },
          ],
        },
      }),
    ]);

    const enrollmentMap = new Map(enrollments.map(e => [e.courseId, e]));
    const entitlementSet = new Set(entitlements.map(e => e.courseId));

    const result: CourseWithProgress[] = courses.map(course => {
      const enrollment = enrollmentMap.get(course.id);
      return {
        ...course,
        enrolled: !!enrollment,
        progress: enrollment?.progressPercent || 0,
        hasAccess: entitlementSet.has(course.id),
      };
    });

    return reply.send(result);
  });

  // GET /courses/:courseSlug - Get single course with full content tree
  fastify.get('/courses/:courseSlug', {
    preHandler: [authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['courseSlug'],
        properties: {
          courseSlug: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
          },
        },
      },
    },
  }, async (request, reply) => {
    const { courseSlug } = request.params as { courseSlug: string };

    // Get course from Directus
    const course = await getCourseBySlug(courseSlug);

    if (!course) {
      return reply.status(404).send({ error: 'Course not found' });
    }

    // Check entitlement
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId: request.user!.id,
        courseId: course.id,
        revokedAt: null,
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } },
        ],
      },
    });

    if (!entitlement) {
      return reply.status(403).send({ error: 'No access to this course' });
    }

    // Get or create enrollment
    let enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: request.user!.id,
          courseId: course.id,
        },
      },
    });

    if (!enrollment) {
      enrollment = await prisma.enrollment.create({
        data: {
          userId: request.user!.id,
          courseId: course.id,
        },
      });
    } else {
      // Update last accessed
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { lastAccessedAt: new Date() },
      });
    }

    // Get lesson progress
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        userId: request.user!.id,
        courseId: course.id,
      },
    });

    const progressMap = new Map(lessonProgress.map(lp => [lp.lessonId, lp]));

    // Enhance modules and lessons with progress
    const modulesWithProgress: ModuleWithProgress[] = (course.modules || []).map(module => ({
      ...module,
      lessons: (module.lessons || []).map(lesson => ({
        ...lesson,
        completed: progressMap.get(lesson.id)?.completed || false,
      })),
    }));

    return reply.send({
      ...course,
      modules: modulesWithProgress,
      enrolled: true,
      progress: enrollment.progressPercent,
      hasAccess: true,
    });
  });

  // POST /courses/:courseId/enroll - Enroll in a course
  fastify.post('/courses/:courseId/enroll', {
    preHandler: [authenticate],
    schema: {
      params: z.object({
        courseId: z.string().uuid(),
      }),
    },
  }, async (request, reply) => {
    const { courseId } = request.params as { courseId: string };

    // Check entitlement
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId: request.user!.id,
        courseId,
        revokedAt: null,
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } },
        ],
      },
    });

    if (!entitlement) {
      return reply.status(403).send({ error: 'No access to this course' });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: request.user!.id,
          courseId,
        },
      },
      create: {
        userId: request.user!.id,
        courseId,
      },
      update: {
        lastAccessedAt: new Date(),
      },
    });

    return reply.status(201).send(enrollment);
  });
}






