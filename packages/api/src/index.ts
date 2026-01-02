import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { randomUUID } from 'crypto';

import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { meRoutes } from './routes/me.js';
import { coursesRoutes } from './routes/courses.js';
import { lessonsRoutes } from './routes/lessons.js';
import { quizRoutes } from './routes/quiz.js';
import { userVariablesRoutes } from './routes/user-variables.js';
import { webhooksRoutes } from './routes/webhooks.js';
import { errorHandler } from './middleware/error-handler.js';
import { logger } from './lib/logger.js';
import { validateEnvironment } from './lib/env-validation.js';

// Validate environment variables before starting
try {
  validateEnvironment();
} catch (error) {
  // Use console.error here as logger might not be initialized yet
  // This is acceptable for startup errors
  console.error('Environment validation failed:', error);
  process.exit(1);
}

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Register plugins - CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').filter(Boolean) || [];
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('CORS_ORIGIN must be set in production environment');
}

// In development, allow all localhost origins
const corsOrigin = process.env.NODE_ENV === 'development' 
  ? true  // Allow all origins in development
  : allowedOrigins.length > 0 ? allowedOrigins : false;

await fastify.register(cors, {
  origin: corsOrigin,
  credentials: true,
});

await fastify.register(helmet, {
  contentSecurityPolicy: false,
});

// Request ID propagation
fastify.addHook('onRequest', async (request) => {
  request.id = (request.headers['x-request-id'] as string) || randomUUID();
});

fastify.addHook('onSend', async (request, reply) => {
  reply.header('x-request-id', request.id);
});

// Rate limiting - per user if authenticated, per IP otherwise
await fastify.register(rateLimit, {
  max: async (request) => {
    // Higher limit for authenticated users
    return (request as any).user ? 200 : 50;
  },
  timeWindow: '1 minute',
  keyGenerator: (request) => {
    // Use user ID if authenticated, otherwise IP address
    const user = (request as any).user;
    return user?.id || request.ip || 'unknown';
  },
});

// Error handler
fastify.setErrorHandler(errorHandler);

// Register routes
await fastify.register(healthRoutes);
await fastify.register(authRoutes, { prefix: '/auth' });
await fastify.register(meRoutes);
await fastify.register(coursesRoutes);
await fastify.register(lessonsRoutes);
await fastify.register(quizRoutes);
await fastify.register(userVariablesRoutes);
await fastify.register(webhooksRoutes);

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    logger.info({ port, host }, '🚀 Campus LMS API running');
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
};

start();

export { fastify };


// Trigger
// Final test
