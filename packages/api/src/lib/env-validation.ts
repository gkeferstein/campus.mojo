/**
 * Environment variable validation
 * Ensures all required secrets are set before starting the application
 */

export function validateEnvironment(): void {
  const requiredEnvVars = [
    'CLERK_SECRET_KEY',
    'DATABASE_URL',
    'WEBHOOK_SECRET',
  ];

  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please set these variables before starting the application.'
    );
  }

  // Validate DATABASE_URL format
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl && !databaseUrl.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  // Production-specific validations
  if (process.env.NODE_ENV === 'production') {
    const productionRequired = ['CORS_ORIGIN'];
    const missingProd: string[] = [];

    for (const envVar of productionRequired) {
      if (!process.env[envVar]) {
        missingProd.push(envVar);
      }
    }

    if (missingProd.length > 0) {
      throw new Error(
        `Missing required production environment variables: ${missingProd.join(', ')}`
      );
    }
  }
}

