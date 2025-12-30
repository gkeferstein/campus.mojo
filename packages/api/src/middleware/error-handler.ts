import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  const requestId = request.id || 'unknown';
  const requestLogger = logger.child({ requestId });

  // Custom AppError
  if (error instanceof AppError) {
    requestLogger.warn({ 
      code: error.code, 
      statusCode: error.statusCode,
      details: error.details 
    }, error.message);
    
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    requestLogger.warn({ validationErrors: error.errors }, 'Validation error');
    
    return reply.status(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validierung fehlgeschlagen',
        details: {
          fields: error.errors.reduce((acc, e) => {
            acc[e.path.join('.')] = e.message;
            return acc;
          }, {} as Record<string, string>),
        },
      },
    });
  }

  // JWT errors
  if ('code' in error && (
    error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER' ||
    error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID'
  )) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Nicht authentifiziert',
      },
    });
  }

  // Rate limit errors
  if ('statusCode' in error && error.statusCode === 429) {
    return reply.status(429).send({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Zu viele Anfragen',
      },
    });
  }

  // Unknown errors - log and return generic error
  requestLogger.error({ err: error }, 'Unhandled error');
  
  const statusCode = ('statusCode' in error && error.statusCode) || 500;
  const message = statusCode === 500 
    ? 'Ein interner Fehler ist aufgetreten'
    : ('message' in error ? error.message : 'Unknown error');

  return reply.status(statusCode).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
}







