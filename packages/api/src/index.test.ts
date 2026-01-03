/**
 * Test helper: Build Fastify app instance for testing
 */

import Fastify from 'fastify';
import { healthRoutes } from './routes/health.js';
import { webhooksRoutes } from './routes/webhooks.js';
import { notificationRoutes } from './routes/notifications.js';

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

