import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  request.log.error(error);

  // Zod validation errors
  if (error instanceof ZodError) {
    reply.status(400).send({
      error: 'Validation Error',
      details: error.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // JWT errors
  if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER' ||
      error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
    reply.status(401).send({ error: 'Unauthorized' });
    return;
  }

  // Rate limit errors
  if (error.statusCode === 429) {
    reply.status(429).send({ error: 'Too many requests' });
    return;
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 
    ? 'Internal Server Error' 
    : error.message;

  reply.status(statusCode).send({ error: message });
}

