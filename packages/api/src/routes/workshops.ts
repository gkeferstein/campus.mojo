import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthUser } from '../middleware/auth.js';

// Removed AuthenticatedRequest - use (request as any).user instead

interface WorkshopQuery {
  upcoming?: string;
  type?: string;
  page?: string;
  limit?: string;
}

export async function workshopRoutes(fastify: FastifyInstance) {
  // ============================================
  // Workshops
  // ============================================

  // Get upcoming workshops
  fastify.get(
    '/workshops',
    { preHandler: authenticate },
    async (request, reply) => {
      const { upcoming = 'true', type, page = '1', limit = '10' } = request.query as WorkshopQuery;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Check user's subscription tier
      const journey = await prisma.userJourney.findUnique({
        where: { userId: (request as any).user.id },
      });

      const userTier = journey?.subscriptionTier || 'free';

      const now = new Date();
      const where = {
        ...(upcoming === 'true' && { scheduledAt: { gte: now } }),
        ...(type && { type }),
        status: { in: ['scheduled', 'live'] },
      };

      const [workshops, total] = await Promise.all([
        prisma.workshop.findMany({
          where,
          include: {
            _count: {
              select: { bookings: true },
            },
            bookings: {
              where: { userId: (request as any).user.id },
              select: { id: true, status: true },
            },
          },
          orderBy: { scheduledAt: 'asc' },
          skip,
          take: parseInt(limit),
        }),
        prisma.workshop.count({ where }),
      ]);

      return reply.send({
        workshops: workshops.map(w => ({
          id: w.id,
          title: w.title,
          description: w.description,
          type: w.type,
          scheduledAt: w.scheduledAt,
          duration: w.duration,
          timezone: w.timezone,
          hostName: w.hostName,
          hostAvatar: w.hostAvatar,
          maxParticipants: w.maxParticipants,
          currentParticipants: w._count.bookings,
          spotsLeft: w.maxParticipants - w._count.bookings,
          status: w.status,
          requiredTier: w.requiredTier,
          hasAccess: userTier === 'resilienz' || (userTier === 'lebensenergie' && w.requiredTier === 'lebensenergie'),
          isBooked: w.bookings.length > 0,
          bookingStatus: w.bookings[0]?.status || null,
          replayAvailable: !!w.replayUrl && w.status === 'completed',
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
        userTier,
      });
    }
  );

  // Get workshop details
  fastify.get(
    '/workshops/:workshopId',
    {
      preHandler: authenticate,
      schema: {
        params: {
          type: 'object',
          required: ['workshopId'],
          properties: {
            workshopId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { workshopId } = request.params as { workshopId: string };

      const journey = await prisma.userJourney.findUnique({
        where: { userId: (request as any).user.id },
      });

      const userTier = journey?.subscriptionTier || 'free';

      const workshop = await prisma.workshop.findUnique({
        where: { id: workshopId },
        include: {
          _count: {
            select: { bookings: true },
          },
          bookings: {
            where: { userId: (request as any).user.id },
            select: { id: true, status: true },
          },
        },
      });

      if (!workshop) {
        return reply.status(404).send({ error: 'Workshop not found' });
      }

      const isBooked = workshop.bookings.length > 0 && workshop.bookings[0]?.status === 'confirmed';
      const hasAccess = userTier === 'resilienz' || (userTier === 'lebensenergie' && workshop.requiredTier === 'lebensenergie');

      return reply.send({
        workshop: {
          id: workshop.id,
          title: workshop.title,
          description: workshop.description,
          type: workshop.type,
          scheduledAt: workshop.scheduledAt,
          duration: workshop.duration,
          timezone: workshop.timezone,
          hostName: workshop.hostName,
          hostAvatar: workshop.hostAvatar,
          maxParticipants: workshop.maxParticipants,
          currentParticipants: workshop._count.bookings,
          spotsLeft: workshop.maxParticipants - workshop._count.bookings,
          status: workshop.status,
          requiredTier: workshop.requiredTier,
          hasAccess,
          isBooked,
          bookingStatus: workshop.bookings[0]?.status || null,
          // Only show meeting URL if booked and workshop is upcoming/live
          meetingUrl: isBooked && hasAccess && ['scheduled', 'live'].includes(workshop.status) 
            ? workshop.meetingUrl 
            : null,
          // Show replay if available
          replayUrl: hasAccess && workshop.status === 'completed' ? workshop.replayUrl : null,
          replayAvailable: !!workshop.replayUrl && workshop.status === 'completed',
        },
        userTier,
      });
    }
  );

  // Book a workshop
  fastify.post(
    '/workshops/:workshopId/book',
    {
      preHandler: authenticate,
      schema: {
        params: {
          type: 'object',
          required: ['workshopId'],
          properties: {
            workshopId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { workshopId } = request.params as { workshopId: string };

      // Check subscription tier
      const journey = await prisma.userJourney.findUnique({
        where: { userId: (request as any).user.id },
      });

      const userTier = journey?.subscriptionTier || 'free';

      const workshop = await prisma.workshop.findUnique({
        where: { id: workshopId },
        include: {
          _count: { select: { bookings: true } },
        },
      });

      if (!workshop) {
        return reply.status(404).send({ error: 'Workshop not found' });
      }

      // Check access
      const hasAccess = userTier === 'resilienz' || (userTier === 'lebensenergie' && workshop.requiredTier === 'lebensenergie');
      
      if (!hasAccess) {
        return reply.status(403).send({ 
          error: 'You need a RESILIENZ subscription to access this workshop',
          requiredTier: workshop.requiredTier,
        });
      }

      // Check if already booked
      const existingBooking = await prisma.workshopBooking.findUnique({
        where: { workshopId_userId: { workshopId, userId: (request as any).user.id } },
      });

      if (existingBooking) {
        if (existingBooking.status === 'confirmed') {
          return reply.status(400).send({ error: 'You are already booked for this workshop' });
        }
        // Re-activate cancelled booking
        await prisma.workshopBooking.update({
          where: { id: existingBooking.id },
          data: { status: 'confirmed' },
        });
        return reply.send({ 
          success: true, 
          message: 'Booking confirmed',
          meetingUrl: workshop.meetingUrl,
        });
      }

      // Check capacity
      if (workshop._count.bookings >= workshop.maxParticipants) {
        return reply.status(400).send({ error: 'Workshop is fully booked' });
      }

      // Check if workshop is in the future
      if (workshop.scheduledAt < new Date()) {
        return reply.status(400).send({ error: 'Cannot book past workshops' });
      }

      // Create booking
      await prisma.workshopBooking.create({
        data: {
          workshopId,
          userId: (request as any).user.id,
          status: 'confirmed',
        },
      });

      // Award badge for first workshop
      const bookingCount = await prisma.workshopBooking.count({
        where: { userId: (request as any).user.id, status: 'confirmed' },
      });

      if (bookingCount === 1) {
        await prisma.userBadge.upsert({
          where: { userId_badgeSlug: { userId: (request as any).user.id, badgeSlug: 'first-workshop' } },
          create: { userId: (request as any).user.id, badgeSlug: 'first-workshop' },
          update: {},
        });
      }

      return reply.status(201).send({ 
        success: true, 
        message: 'Workshop booked successfully',
        meetingUrl: workshop.meetingUrl,
      });
    }
  );

  // Cancel workshop booking
  fastify.delete(
    '/workshops/:workshopId/book',
    {
      preHandler: authenticate,
      schema: {
        params: {
          type: 'object',
          required: ['workshopId'],
          properties: {
            workshopId: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { workshopId } = request.params as { workshopId: string };

      const booking = await prisma.workshopBooking.findUnique({
        where: { workshopId_userId: { workshopId, userId: (request as any).user.id } },
        include: { workshop: true },
      });

      if (!booking) {
        return reply.status(404).send({ error: 'Booking not found' });
      }

      // Check if cancellation is allowed (e.g., 24h before)
      const hoursUntilWorkshop = (booking.workshop.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);
      
      if (hoursUntilWorkshop < 24) {
        return reply.status(400).send({ 
          error: 'Cancellation must be at least 24 hours before the workshop',
        });
      }

      await prisma.workshopBooking.update({
        where: { id: booking.id },
        data: { status: 'cancelled' },
      });

      return reply.send({ success: true, message: 'Booking cancelled' });
    }
  );

  // Get my workshop bookings
  fastify.get(
    '/workshops/my-bookings',
    { preHandler: authenticate },
    async (request, reply) => {
      const bookings = await prisma.workshopBooking.findMany({
        where: { 
          userId: (request as any).user.id,
          status: { in: ['confirmed', 'attended'] },
        },
        include: {
          workshop: true,
        },
        orderBy: { workshop: { scheduledAt: 'asc' } },
      });

      const now = new Date();

      return reply.send({
        upcoming: bookings
          .filter(b => b.workshop.scheduledAt > now)
          .map(b => ({
            id: b.id,
            workshopId: b.workshop.id,
            title: b.workshop.title,
            type: b.workshop.type,
            scheduledAt: b.workshop.scheduledAt,
            duration: b.workshop.duration,
            hostName: b.workshop.hostName,
            meetingUrl: b.workshop.meetingUrl,
            status: b.status,
          })),
        past: bookings
          .filter(b => b.workshop.scheduledAt <= now)
          .map(b => ({
            id: b.id,
            workshopId: b.workshop.id,
            title: b.workshop.title,
            type: b.workshop.type,
            scheduledAt: b.workshop.scheduledAt,
            duration: b.workshop.duration,
            hostName: b.workshop.hostName,
            replayUrl: b.workshop.replayUrl,
            status: b.status,
          })),
      });
    }
  );

  // ============================================
  // Workshop Calendar
  // ============================================

  // Get workshops for calendar view (month)
  fastify.get(
    '/workshops/calendar',
    { preHandler: authenticate },
    async (request, reply) => {
      const { month, year } = request.query as { month?: string; year?: string };
      
      const now = new Date();
      const targetMonth = parseInt(month || String(now.getMonth() + 1));
      const targetYear = parseInt(year || String(now.getFullYear()));

      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

      const journey = await prisma.userJourney.findUnique({
        where: { userId: (request as any).user.id },
      });
      const userTier = journey?.subscriptionTier || 'free';

      const workshops = await prisma.workshop.findMany({
        where: {
          scheduledAt: {
            gte: startDate,
            lte: endDate,
          },
          status: { in: ['scheduled', 'live', 'completed'] },
        },
        include: {
          bookings: {
            where: { userId: (request as any).user.id },
            select: { status: true },
          },
          _count: { select: { bookings: true } },
        },
        orderBy: { scheduledAt: 'asc' },
      });

      // Group by date
      const calendarData: Record<string, typeof workshops> = {};
      
      for (const workshop of workshops) {
        const dateKey = workshop.scheduledAt.toISOString().split('T')[0];
        if (!dateKey) continue;
        
        if (!calendarData[dateKey]) {
          calendarData[dateKey] = [];
        }
        // TypeScript knows dateKey is defined here due to continue above
        calendarData[dateKey]!.push(workshop);
      }

      return reply.send({
        month: targetMonth,
        year: targetYear,
        workshops: Object.entries(calendarData).map(([date, items]) => ({
          date,
          workshops: items.map(w => {
            const timePart = w.scheduledAt.toISOString().split('T')[1];
            return {
              id: w.id,
              title: w.title,
              type: w.type,
              time: timePart ? timePart.substring(0, 5) : '00:00',
              duration: w.duration,
              hostName: w.hostName,
              spotsLeft: w.maxParticipants - w._count.bookings,
              isBooked: w.bookings.some(b => b.status === 'confirmed'),
              hasAccess: userTier === 'resilienz' || (userTier === 'lebensenergie' && w.requiredTier === 'lebensenergie'),
              status: w.status,
            };
          }),
        })),
        userTier,
      });
    }
  );
}

