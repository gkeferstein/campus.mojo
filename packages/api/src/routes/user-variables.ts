import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const upsertSchema = z.object({
  toolSlug: z.string().min(1).max(100),
  key: z.string().min(1).max(100),
  value: z.any(),
  lessonId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
});

const bulkUpsertSchema = z.object({
  toolSlug: z.string().min(1).max(100),
  variables: z.record(z.string(), z.any()),
  lessonId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
});

export async function userVariablesRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /user-variables?toolSlug=xxx
  fastify.get('/user-variables', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const { toolSlug } = request.query as { toolSlug?: string };

    if (!toolSlug) {
      return reply.status(400).send({ error: 'toolSlug query parameter required' });
    }

    const variables = await prisma.userVariable.findMany({
      where: {
        userId: request.user!.id,
        toolSlug,
      },
      select: {
        key: true,
        value: true,
        updatedAt: true,
      },
    });

    const result: Record<string, unknown> = {};
    for (const v of variables) {
      result[v.key] = v.value;
    }

    return reply.send(result);
  });

  // PUT /user-variables
  fastify.put('/user-variables', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const body = upsertSchema.parse(request.body);

    const variable = await prisma.userVariable.upsert({
      where: {
        userId_toolSlug_key: {
          userId: request.user!.id,
          toolSlug: body.toolSlug,
          key: body.key,
        },
      },
      create: {
        userId: request.user!.id,
        toolSlug: body.toolSlug,
        key: body.key,
        value: body.value,
        lessonId: body.lessonId,
        courseId: body.courseId,
      },
      update: {
        value: body.value,
        lessonId: body.lessonId,
        courseId: body.courseId,
      },
    });

    return reply.send({
      key: variable.key,
      value: variable.value,
      updatedAt: variable.updatedAt,
    });
  });

  // POST /user-variables/bulk
  fastify.post('/user-variables/bulk', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const body = bulkUpsertSchema.parse(request.body);

    const results: Array<{ key: string; value: unknown }> = [];

    await prisma.$transaction(async (tx) => {
      for (const [key, value] of Object.entries(body.variables)) {
        const variable = await tx.userVariable.upsert({
          where: {
            userId_toolSlug_key: {
              userId: request.user!.id,
              toolSlug: body.toolSlug,
              key,
            },
          },
          create: {
            userId: request.user!.id,
            toolSlug: body.toolSlug,
            key,
            value,
            lessonId: body.lessonId,
            courseId: body.courseId,
          },
          update: {
            value,
            lessonId: body.lessonId,
            courseId: body.courseId,
          },
        });
        results.push({ key: variable.key, value: variable.value });
      }
    });

    return reply.send({ updated: results.length, variables: results });
  });
}
