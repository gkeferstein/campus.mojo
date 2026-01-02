import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';

function parseEnvKeys(envFileContents: string): Set<string> {
  const keys = new Set<string>();

  for (const rawLine of envFileContents.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eqIdx = line.indexOf('=');
    if (eqIdx <= 0) continue;

    keys.add(line.slice(0, eqIdx).trim());
  }

  return keys;
}

describe('.env.example', () => {
  it('enthält die Variablen, die validateEnvironment() zwingend erwartet', async () => {
    const workspaceRoot = path.resolve(process.cwd(), '../..');
    const envExamplePath = path.join(workspaceRoot, '.env.example');
    const contents = await fs.readFile(envExamplePath, 'utf8');
    const keys = parseEnvKeys(contents);

    // required by packages/api/src/lib/env-validation.ts
    for (const requiredKey of ['CLERK_SECRET_KEY', 'DATABASE_URL', 'WEBHOOK_SECRET']) {
      assert.ok(keys.has(requiredKey), `Missing ${requiredKey} in .env.example`);
    }

    // .env.example sets NODE_ENV=production, so production-only validation applies
    assert.ok(keys.has('CORS_ORIGIN'), 'Missing CORS_ORIGIN in .env.example');
  });
});

