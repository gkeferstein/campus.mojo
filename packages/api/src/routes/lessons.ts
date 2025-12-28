import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { getLessonBySlug, getLessonById } from '../lib/directus.js';

const completeSchema = z.object({
  timeSpentSeconds: z.number().int().min(0).optional(),
});

export async function lessonsRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /lessons/:lessonSlug - Get lesson content
  fastify.get('/lessons/:lessonSlug', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { lessonSlug } = request.params as { lessonSlug: string };

    // Get lesson from Directus
    const lesson = await getLessonBySlug(lessonSlug);

    if (!lesson) {
      return reply.status(404).send({ error: 'Lesson not found' });
    }

    // Get the module to find the course
    const moduleData = lesson.module_id as unknown as { course_id: string };
    const courseId = typeof moduleData === 'object' ? moduleData.course_id : lesson.module_id;

    // Check entitlement
    const entitlement = await prisma.entitlement.findFirst({
      where: {
        userId: request.user!.id,
        courseId: courseId,
        revokedAt: null,
        OR: [
          { validUntil: null },
          { validUntil: { gte: new Date() } },
        ],
      },
    });

    if (!entitlement) {
      return reply.status(403).send({ error: 'No access to this lesson' });
    }

    // Get progress
    const progress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: request.user!.id,
          lessonId: lesson.id,
        },
      },
    });

    return reply.send({
      ...lesson,
      completed: progress?.completed || false,
      timeSpentSeconds: progress?.timeSpentSeconds || 0,
      completedAt: progress?.completedAt,
    });
  });

  // POST /lessons/:lessonId/complete - Mark lesson as complete
  fastify.post('/lessons/:lessonId/complete', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    const body = completeSchema.parse(request.body || {});

    // Get the lesson to find the course
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: request.user!.id,
          lessonId,
        },
      },
    });

    // If we don't have progress yet, we need to get the course ID from Directus
    let courseId = existingProgress?.courseId;

    if (!courseId) {
      // Fetch lesson from Directus to get course_id
      const lesson = await getLessonById(lessonId);
      if (!lesson) {
        return reply.status(404).send({ error: 'Lesson not found' });
      }
      courseId = lesson.course_id;
      if (!courseId) {
        return reply.status(400).send({ 
          error: 'Could not determine course for this lesson',
        });
      }
    }

    // Update or create progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: request.user!.id,
          lessonId,
        },
      },
      create: {
        userId: request.user!.id,
        lessonId,
        courseId,
        completed: true,
        completedAt: new Date(),
        timeSpentSeconds: body.timeSpentSeconds || 0,
      },
      update: {
        completed: true,
        completedAt: new Date(),
        timeSpentSeconds: body.timeSpentSeconds 
          ? { increment: body.timeSpentSeconds }
          : undefined,
      },
    });

    // Recalculate course progress
    await updateCourseProgress(request.user!.id, courseId);

    return reply.send(progress);
  });

  // POST /lessons/:lessonId/progress - Update time spent (without completing)
  fastify.post('/lessons/:lessonId/progress', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { lessonId } = request.params as { lessonId: string };
    const body = z.object({
      timeSpentSeconds: z.number().int().min(0),
      courseId: z.string().uuid(),
    }).parse(request.body);

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: request.user!.id,
          lessonId,
        },
      },
      create: {
        userId: request.user!.id,
        lessonId,
        courseId: body.courseId,
        timeSpentSeconds: body.timeSpentSeconds,
      },
      update: {
        timeSpentSeconds: { increment: body.timeSpentSeconds },
      },
    });

    return reply.send(progress);
  });
}

async function updateCourseProgress(userId: string, courseId: string): Promise<void> {
  // Count total and completed lessons for this course
  const [totalLessons, completedLessons] = await Promise.all([
    prisma.lessonProgress.count({
      where: { userId, courseId },
    }),
    prisma.lessonProgress.count({
      where: { userId, courseId, completed: true },
    }),
  ]);

  const progressPercent = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) 
    : 0;

  await prisma.enrollment.update({
    where: {
      userId_courseId: { userId, courseId },
    },
    data: {
      progressPercent,
      completedAt: progressPercent === 100 ? new Date() : null,
    },
  });
}
