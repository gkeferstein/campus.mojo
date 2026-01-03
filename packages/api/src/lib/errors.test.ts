import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  AppError,
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  RateLimitError,
  ServiceUnavailableError,
  UnauthorizedError,
  ValidationError,
} from './errors.js';

describe('AppError & custom errors', () => {
  it('AppError setzt code/statusCode/details und ist instanceof Error', () => {
    const err = new AppError('CODE', 'Nachricht', 418, { a: 1 });

    assert.ok(err instanceof Error);
    assert.equal(err.name, 'AppError');
    assert.equal(err.code, 'CODE');
    assert.equal(err.message, 'Nachricht');
    assert.equal(err.statusCode, 418);
    assert.deepEqual(err.details, { a: 1 });
  });

  it('NotFoundError formatiert message mit und ohne id', () => {
    assert.equal(new NotFoundError('Kurs').message, 'Kurs nicht gefunden');
    assert.equal(new NotFoundError('Kurs', '123').message, 'Kurs mit ID 123 nicht gefunden');
    assert.equal(new NotFoundError('Kurs').statusCode, 404);
    assert.equal(new NotFoundError('Kurs').code, 'NOT_FOUND');
  });

  it('ValidationError trägt fields in details', () => {
    const err = new ValidationError({ email: 'invalid' });
    assert.equal(err.statusCode, 400);
    assert.equal(err.code, 'VALIDATION_ERROR');
    assert.deepEqual(err.details, { fields: { email: 'invalid' } });
  });

  it('default messages/status codes sind korrekt', () => {
    assert.equal(new UnauthorizedError().statusCode, 401);
    assert.equal(new UnauthorizedError().code, 'UNAUTHORIZED');

    assert.equal(new ForbiddenError().statusCode, 403);
    assert.equal(new ForbiddenError().code, 'FORBIDDEN');

    assert.equal(new ConflictError('x').statusCode, 409);
    assert.equal(new ConflictError('x').code, 'CONFLICT');

    assert.equal(new RateLimitError().statusCode, 429);
    assert.equal(new RateLimitError().code, 'RATE_LIMITED');

    assert.equal(new InternalError().statusCode, 500);
    assert.equal(new InternalError().code, 'INTERNAL_ERROR');

    assert.equal(new ServiceUnavailableError('Foo').statusCode, 503);
    assert.equal(new ServiceUnavailableError('Foo').code, 'SERVICE_UNAVAILABLE');
  });
});

