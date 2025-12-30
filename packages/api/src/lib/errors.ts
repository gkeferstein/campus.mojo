/**
 * Custom Error Classes for campus.mojo API
 * Following MOJO Coding Standards
 */

export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      'NOT_FOUND',
      id ? `${resource} mit ID ${id} nicht gefunden` : `${resource} nicht gefunden`,
      404
    );
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(fields: Record<string, string>) {
    super('VALIDATION_ERROR', 'Validierung fehlgeschlagen', 400, { fields });
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Nicht authentifiziert') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Keine Berechtigung') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('CONFLICT', message, 409, details);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Zu viele Anfragen') {
    super('RATE_LIMITED', message, 429);
    this.name = 'RateLimitError';
  }
}

export class InternalError extends AppError {
  constructor(message = 'Ein interner Fehler ist aufgetreten', details?: Record<string, unknown>) {
    super('INTERNAL_ERROR', message, 500, details);
    this.name = 'InternalError';
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service: string, message?: string) {
    super(
      'SERVICE_UNAVAILABLE',
      message || `Service ${service} ist nicht verfügbar`,
      503
    );
    this.name = 'ServiceUnavailableError';
  }
}

