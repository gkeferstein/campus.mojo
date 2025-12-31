import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export async function userVariablesRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /user-variables?toolSlug=xxx
  fastify.get('/user-variables', {
    preHandler: [authenticate],
    schema: {
      querystring: {
        type: 'object',
        required: ['toolSlug'],
        properties: {
          toolSlug: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
        },
      },
    },
  }, async (request, reply) => {
    const { toolSlug } = request.query as { toolSlug: string };

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
    schema: {
      body: {
        type: 'object',
        required: ['toolSlug', 'key', 'value'],
        properties: {
          toolSlug: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
          key: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
          value: {},
          lessonId: {
            type: 'string',
            format: 'uuid',
          },
          courseId: {
            type: 'string',
            format: 'uuid',
          },
        },
      },
    },
  }, async (request, reply) => {
    const body = request.body as { toolSlug: string; key: string; value: unknown; lessonId?: string; courseId?: string };

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
        value: body.value as any,
        lessonId: body.lessonId,
        courseId: body.courseId,
      },
      update: {
        value: body.value as any,
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
    schema: {
      body: {
        type: 'object',
        required: ['toolSlug', 'variables'],
        properties: {
          toolSlug: {
            type: 'string',
            minLength: 1,
            maxLength: 100,
          },
          variables: {
            type: 'object',
            additionalProperties: true,
          },
          lessonId: {
            type: 'string',
            format: 'uuid',
          },
          courseId: {
            type: 'string',
            format: 'uuid',
          },
        },
      },
    },
  }, async (request, reply) => {
    const body = request.body as { toolSlug: string; variables: Record<string, unknown>; lessonId?: string; courseId?: string };

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
            value: value as any,
            lessonId: body.lessonId,
            courseId: body.courseId,
          },
          update: {
            value: value as any,
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
