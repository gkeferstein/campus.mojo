import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';

export interface AuthUser {
  id: string;
  email: string;
  tenantId: string | null;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; email: string; tenantId?: string };
    user: AuthUser;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const payload = await request.jwtVerify<{ sub: string; email: string; tenantId?: string }>();
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, tenantId: true },
    });

    if (!user) {
      return reply.status(401).send({ error: 'User not found' });
    }

    request.user = {
      id: user.id,
      email: user.email,
      tenantId: user.tenantId,
    };
  } catch (err) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}

export async function optionalAuth(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  try {
    const payload = await request.jwtVerify<{ sub: string; email: string; tenantId?: string }>();
    
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, tenantId: true },
    });

    if (user) {
      request.user = {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
      };
    }
  } catch {
    // Token is optional, so we don't throw an error
  }
}

