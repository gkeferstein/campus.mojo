import { FastifyRequest, FastifyReply } from 'fastify';
import { createHmac, timingSafeEqual } from 'crypto';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  throw new Error('WEBHOOK_SECRET environment variable is required');
}

// Type assertion after validation
const webhookSecret: string = WEBHOOK_SECRET;

export async function verifyWebhook(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const signature = request.headers['x-webhook-signature'] as string;
  
  if (!signature) {
    return reply.status(401).send({ error: 'Missing webhook signature' });
  }

  const body = JSON.stringify(request.body);
  const expectedSignature = createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return reply.status(401).send({ error: 'Invalid webhook signature' });
  }
}







