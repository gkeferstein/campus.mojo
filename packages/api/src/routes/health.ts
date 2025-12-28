import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', async (_request, reply) => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      
      return reply.send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'campus-lms-api',
        version: '1.0.0',
      });
    } catch (error) {
      return reply.status(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      });
    }
  });

  fastify.get('/ready', async (_request, reply) => {
    return reply.send({ ready: true });
  });
}

