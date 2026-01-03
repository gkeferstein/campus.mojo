/**
 * Test helper: Build Fastify app instance for testing
 */

import Fastify from 'fastify';
import { healthRoutes } from './routes/health.ts';
import { webhooksRoutes } from './routes/webhooks.ts';
import { notificationRoutes } from './routes/notifications.ts';

export async function buildApp() {
  const app = Fastify({
    logger: false, // Disable logging in tests
  });

  // Register routes needed for tests
  await app.register(healthRoutes);
  await app.register(webhooksRoutes);
  await app.register(notificationRoutes);

  return app;
}

