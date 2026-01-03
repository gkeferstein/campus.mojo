import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { validateEnvironment } from './env-validation.js';

function withCleanEnv<T>(fn: () => T): T {
  const original = { ...process.env };
  try {
    return fn();
  } finally {
    // Remove keys that were added during the test
    for (const key of Object.keys(process.env)) {
      if (!(key in original)) delete process.env[key];
    }
    // Restore original keys (including ones that were deleted/changed)
    for (const [key, value] of Object.entries(original)) {
      process.env[key] = value;
    }
  }
}

describe('validateEnvironment', () => {
  it('wirft, wenn required env vars fehlen', () => {
    withCleanEnv(() => {
      delete process.env.CLERK_SECRET_KEY;
      delete process.env.DATABASE_URL;
      delete process.env.WEBHOOK_SECRET;

      assert.throws(() => validateEnvironment(), /Missing required environment variables/);
      assert.throws(() => validateEnvironment(), /CLERK_SECRET_KEY/);
      assert.throws(() => validateEnvironment(), /DATABASE_URL/);
      assert.throws(() => validateEnvironment(), /WEBHOOK_SECRET/);
    });
  });

  it('wirft, wenn DATABASE_URL kein postgresql:// ist', () => {
    withCleanEnv(() => {
      process.env.CLERK_SECRET_KEY = 'clerk';
      process.env.DATABASE_URL = 'mysql://localhost:3306/db';
      process.env.WEBHOOK_SECRET = 'whsec';

      assert.throws(
        () => validateEnvironment(),
        (err) =>
          err instanceof Error &&
          err.message === 'DATABASE_URL must be a valid PostgreSQL connection string'
      );
    });
  });

  it('fordert in production zusätzlich CORS_ORIGIN', () => {
    withCleanEnv(() => {
      process.env.NODE_ENV = 'production';
      process.env.CLERK_SECRET_KEY = 'clerk';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/db';
      process.env.WEBHOOK_SECRET = 'whsec';
      delete process.env.CORS_ORIGIN;

      assert.throws(
        () => validateEnvironment(),
        /Missing required production environment variables: CORS_ORIGIN/
      );
    });
  });

  it('läuft durch, wenn alle Variablen korrekt gesetzt sind', () => {
    withCleanEnv(() => {
      process.env.NODE_ENV = 'development';
      process.env.CLERK_SECRET_KEY = 'clerk';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/db';
      process.env.WEBHOOK_SECRET = 'whsec';

      assert.doesNotThrow(() => validateEnvironment());
    });
  });
});

