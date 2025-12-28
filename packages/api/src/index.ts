import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';

import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { meRoutes } from './routes/me.js';
import { coursesRoutes } from './routes/courses.js';
import { lessonsRoutes } from './routes/lessons.js';
import { quizRoutes } from './routes/quiz.js';
import { userVariablesRoutes } from './routes/user-variables.js';
import { webhooksRoutes } from './routes/webhooks.js';
import { errorHandler } from './middleware/error-handler.js';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Register plugins
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') || true,
  credentials: true,
});

await fastify.register(helmet, {
  contentSecurityPolicy: false,
});

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'development-secret-change-me',
  sign: {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
});

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
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
    fastify.log.info(`🚀 Campus LMS API running on ${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

export { fastify };

