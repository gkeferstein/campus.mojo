import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // Register
  fastify.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return reply.status(409).send({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(body.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        tenantId: true,
        createdAt: true,
      },
    });

    // Generate JWT
    const token = fastify.jwt.sign({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId ?? undefined,
    });

    return reply.status(201).send({
      user,
      token,
    });
  });

  // Login
  fastify.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(body.password, user.passwordHash);
    if (!validPassword) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = fastify.jwt.sign({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId ?? undefined,
    });

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantId: user.tenantId,
      },
      token,
    });
  });

  // Refresh token (simplified - in production use refresh tokens)
  fastify.post('/refresh', {
    preHandler: [async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch {
        return reply.status(401).send({ error: 'Invalid token' });
      }
    }],
  }, async (request, reply) => {
    const payload = request.user as unknown as { sub: string; email: string; tenantId?: string };
    
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, tenantId: true },
    });

    if (!user) {
      return reply.status(401).send({ error: 'User not found' });
    }

    const token = fastify.jwt.sign({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId ?? undefined,
    });

    return reply.send({ token });
  });
}

