import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://directus:8055';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', async (_request, reply) => {
    const checks = {
      database: { status: 'unknown' as 'ok' | 'error', error: null as string | null },
      directus: { status: 'unknown' as 'ok' | 'error', error: null as string | null },
    };

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database.status = 'ok';
    } catch (error) {
      checks.database.status = 'error';
      checks.database.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Check Directus connection
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${DIRECTUS_URL}/server/health`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        checks.directus.status = 'ok';
      } else {
        checks.directus.status = 'error';
        checks.directus.error = `HTTP ${response.status}`;
      }
    } catch (error) {
      checks.directus.status = 'error';
      checks.directus.error = error instanceof Error ? error.message : 'Unknown error';
    }

    const isHealthy = checks.database.status === 'ok';
    const statusCode = isHealthy ? 200 : 503;

    return reply.status(statusCode).send({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'campus-lms-api',
      version: '1.0.0',
      dependencies: {
        database: checks.database.status,
        directus: checks.directus.status,
      },
      ...(checks.database.error && { databaseError: checks.database.error }),
      ...(checks.directus.error && { directusError: checks.directus.error }),
    });
  });

  fastify.get('/ready', async (_request, reply) => {
    // Check if database is ready
    try {
      await prisma.$queryRaw`SELECT 1`;
      return reply.send({ ready: true });
    } catch {
      return reply.status(503).send({ ready: false });
    }
  });
}







