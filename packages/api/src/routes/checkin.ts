import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthUser } from '../middleware/auth.js';

// Extend FastifyRequest with user
interface AuthenticatedRequest extends FastifyRequest {
  user: AuthUser;
}

// Types for Check-in
interface CreateCheckInBody {
  energyLevel: number;
  sleepQuality: number;
  moodLevel: number;
  energyGivers: string[];
  energyDrainers: string[];
  notes?: string;
}

interface CheckInResponse {
  id: string;
  energyLevel: number;
  sleepQuality: number;
  moodLevel: number;
  energyGivers: string[];
  energyDrainers: string[];
  lebensenergieScore: number;
  notes: string | null;
  checkedInAt: Date;
}

// Badge definitions
const BADGE_DEFINITIONS = {
  'first-checkin': { name: 'Erster Check-in', description: 'Du hast deinen ersten Check-in gemacht!' },
  '3-day-streak': { name: '3-Tage Streak', description: '3 Tage in Folge eingecheckt!' },
  '7-day-streak': { name: '7-Tage Streak', description: 'Eine ganze Woche Streak!' },
  '30-day-streak': { name: '30-Tage Streak', description: 'Ein ganzer Monat! Unglaublich!' },
  'level-5': { name: 'Level 5', description: 'Du hast Level 5 erreicht!' },
  'level-10': { name: 'Level 10', description: 'Du hast Level 10 erreicht!' },
  'high-energy': { name: 'Energiebündel', description: 'LEBENSENERGIE-Score über 9!' },
  'consistent': { name: 'Konstant', description: '7 Tage mit Score über 6!' },
};

export async function checkInRoutes(fastify: FastifyInstance) {
  // Create a new check-in
  fastify.post(
    '/checkin',
    {
      preHandler: authenticate,
      schema: {
        body: {
          type: 'object',
          required: ['energyLevel', 'sleepQuality', 'moodLevel', 'energyGivers', 'energyDrainers'],
          properties: {
            energyLevel: { type: 'number', minimum: 1, maximum: 10 },
            sleepQuality: { type: 'number', minimum: 1, maximum: 10 },
            moodLevel: { type: 'number', minimum: 1, maximum: 10 },
            energyGivers: { type: 'array', items: { type: 'string' } },
            energyDrainers: { type: 'array', items: { type: 'string' } },
            notes: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const body = request.body as CreateCheckInBody;
      const { energyLevel, sleepQuality, moodLevel, energyGivers, energyDrainers, notes } = body;
      const userId = (request as any).user.id;

      // Validate input
      if (energyLevel < 1 || energyLevel > 10 || sleepQuality < 1 || sleepQuality > 10 || moodLevel < 1 || moodLevel > 10) {
        return reply.status(400).send({ error: 'Score values must be between 1 and 10' });
      }

      // Calculate LEBENSENERGIE score (average of the 3)
      const lebensenergieScore = (energyLevel + sleepQuality + moodLevel) / 3;

      // Check if already checked in today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingCheckIn = await prisma.checkIn.findFirst({
        where: {
          userId,
          checkedInAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      if (existingCheckIn) {
        return reply.status(400).send({ 
          error: 'Du hast heute bereits eingecheckt',
          existingCheckIn: existingCheckIn 
        });
      }

      // Create the check-in
      const checkIn = await prisma.checkIn.create({
        data: {
          userId,
          energyLevel,
          sleepQuality,
          moodLevel,
          energyGivers: energyGivers || [],
          energyDrainers: energyDrainers || [],
          lebensenergieScore,
          notes,
        },
      });

      // Update user journey
      await updateUserJourney(userId);

      // Check for badges
      const newBadges = await checkAndAwardBadges(userId);

      return reply.status(201).send({
        checkIn: {
          id: checkIn.id,
          energyLevel: checkIn.energyLevel,
          sleepQuality: checkIn.sleepQuality,
          moodLevel: checkIn.moodLevel,
          energyGivers: checkIn.energyGivers as string[],
          energyDrainers: checkIn.energyDrainers as string[],
          lebensenergieScore: checkIn.lebensenergieScore,
          notes: checkIn.notes,
          checkedInAt: checkIn.checkedInAt,
        },
        newBadges,
      });
    }
  );

  // Get check-in history
  fastify.get(
    '/checkin/history',
    { preHandler: authenticate },
    async (request, reply) => {
      const userId = (request as any).user.id;
      const { days = '30' } = request.query as { days?: string };
      const daysNum = parseInt(days, 10);

      const since = new Date();
      since.setDate(since.getDate() - daysNum);
      since.setHours(0, 0, 0, 0);

      const checkIns = await prisma.checkIn.findMany({
        where: {
          userId,
          checkedInAt: {
            gte: since,
          },
        },
        orderBy: { checkedInAt: 'desc' },
      });

      // Calculate stats
      const scores = checkIns.map(c => c.lebensenergieScore);
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
      const minScore = scores.length > 0 ? Math.min(...scores) : 0;

      // Calculate streak
      const streak = await calculateStreak(userId);

      // Weekly aggregation
      const weeklyData = aggregateWeekly(checkIns);

      return reply.send({
        checkIns: checkIns.map(c => ({
          id: c.id,
          energyLevel: c.energyLevel,
          sleepQuality: c.sleepQuality,
          moodLevel: c.moodLevel,
          energyGivers: c.energyGivers,
          energyDrainers: c.energyDrainers,
          lebensenergieScore: c.lebensenergieScore,
          notes: c.notes,
          checkedInAt: c.checkedInAt,
        })),
        stats: {
          totalCheckIns: checkIns.length,
          avgScore: Math.round(avgScore * 10) / 10,
          maxScore: Math.round(maxScore * 10) / 10,
          minScore: Math.round(minScore * 10) / 10,
          streak,
        },
        weeklyData,
      });
    }
  );

  // Get today's check-in status
  fastify.get(
    '/checkin/today',
    { preHandler: authenticate },
    async (request, reply) => {
      const userId = (request as any).user.id;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const checkIn = await prisma.checkIn.findFirst({
        where: {
          userId,
          checkedInAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      const streak = await calculateStreak(userId);

      if (checkIn) {
        return reply.send({
          hasCheckedIn: true,
          checkIn: {
            id: checkIn.id,
            energyLevel: checkIn.energyLevel,
            sleepQuality: checkIn.sleepQuality,
            moodLevel: checkIn.moodLevel,
            energyGivers: checkIn.energyGivers,
            energyDrainers: checkIn.energyDrainers,
            lebensenergieScore: checkIn.lebensenergieScore,
            notes: checkIn.notes,
            checkedInAt: checkIn.checkedInAt,
          },
          streak,
        });
      }

      return reply.send({
        hasCheckedIn: false,
        checkIn: null,
        streak,
      });
    }
  );
}

// Helper: Calculate streak
async function calculateStreak(userId: string): Promise<number> {
  const checkIns = await prisma.checkIn.findMany({
    where: { userId },
    orderBy: { checkedInAt: 'desc' },
    select: { checkedInAt: true },
  });

  if (checkIns.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if checked in today or yesterday (streak continues)
  if (checkIns.length === 0) return 0;
  const lastCheckIn = new Date(checkIns[0]!.checkedInAt);
  lastCheckIn.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 1) return 0; // Streak broken

  // Count consecutive days
  let expectedDate = new Date(lastCheckIn);
  for (const checkIn of checkIns) {
    const checkInDate = new Date(checkIn.checkedInAt);
    checkInDate.setHours(0, 0, 0, 0);

    if (checkInDate.getTime() === expectedDate.getTime()) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else if (checkInDate.getTime() < expectedDate.getTime()) {
      // Missed a day, check if this is the expected previous day
      const gap = Math.floor((expectedDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      if (gap === 1) {
        streak++;
        expectedDate = new Date(checkInDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break; // Streak broken
      }
    }
  }

  return streak;
}

// Helper: Weekly aggregation
function aggregateWeekly(checkIns: { checkedInAt: Date; lebensenergieScore: number }[]) {
  const weekDays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const result: { day: string; score: number | null; date: string }[] = [];

  // Get last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dayIndex = date.getDay();
    const dayName = weekDays[dayIndex] || 'So';
    const dateStr = date.toISOString().split('T')[0];
    if (!dateStr) continue;

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayCheckIn = checkIns.find(c => {
      const cDate = new Date(c.checkedInAt);
      return cDate >= date && cDate < nextDate;
    });

    result.push({
      day: dayName,
      score: dayCheckIn ? Math.round(dayCheckIn.lebensenergieScore * 10) / 10 : null,
      date: dateStr,
    });
  }

  return result;
}

// Helper: Update user journey
async function updateUserJourney(userId: string) {
  // Get or create journey
  let journey = await prisma.userJourney.findUnique({
    where: { userId },
  });

  const totalCheckIns = await prisma.checkIn.count({ where: { userId } });
  const streak = await calculateStreak(userId);

  // Calculate days active (unique days with check-ins)
  const uniqueDays = await prisma.checkIn.groupBy({
    by: ['checkedInAt'],
    where: { userId },
  });
  const daysActive = uniqueDays.length;

  // Calculate level based on check-ins and streaks
  const level = Math.min(10, Math.floor(totalCheckIns / 5) + Math.floor(streak / 7) + 1);

  // Determine state progression
  let state = 'onboarding_start';
  if (totalCheckIns >= 1) state = 'onboarding_checkin';
  if (totalCheckIns >= 3) state = 'trial_active';

  if (!journey) {
    journey = await prisma.userJourney.create({
      data: {
        userId,
        state,
        checkInsCompleted: totalCheckIns,
        daysActive,
        currentLevel: level,
      },
    });
  } else {
    journey = await prisma.userJourney.update({
      where: { userId },
      data: {
        state: journey.subscriptionTier ? journey.state : state, // Don't override if subscribed
        checkInsCompleted: totalCheckIns,
        daysActive,
        currentLevel: level,
      },
    });
  }

  return journey;
}

// Helper: Check and award badges
async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const newBadges: string[] = [];
  const existingBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeSlug: true },
  });
  const existingSlugs = new Set(existingBadges.map(b => b.badgeSlug));

  const totalCheckIns = await prisma.checkIn.count({ where: { userId } });
  const streak = await calculateStreak(userId);

  // Get recent check-ins for score-based badges
  const recentCheckIns = await prisma.checkIn.findMany({
    where: { userId },
    orderBy: { checkedInAt: 'desc' },
    take: 7,
  });

  // First check-in
  if (totalCheckIns >= 1 && !existingSlugs.has('first-checkin')) {
    await prisma.userBadge.create({ data: { userId, badgeSlug: 'first-checkin' } });
    newBadges.push('first-checkin');
  }

  // Streak badges
  if (streak >= 3 && !existingSlugs.has('3-day-streak')) {
    await prisma.userBadge.create({ data: { userId, badgeSlug: '3-day-streak' } });
    newBadges.push('3-day-streak');
  }
  if (streak >= 7 && !existingSlugs.has('7-day-streak')) {
    await prisma.userBadge.create({ data: { userId, badgeSlug: '7-day-streak' } });
    newBadges.push('7-day-streak');
  }
  if (streak >= 30 && !existingSlugs.has('30-day-streak')) {
    await prisma.userBadge.create({ data: { userId, badgeSlug: '30-day-streak' } });
    newBadges.push('30-day-streak');
  }

  // High energy badge
  if (recentCheckIns.length > 0 && recentCheckIns[0]!.lebensenergieScore >= 9 && !existingSlugs.has('high-energy')) {
    await prisma.userBadge.create({ data: { userId, badgeSlug: 'high-energy' } });
    newBadges.push('high-energy');
  }

  // Consistent badge (7 days with score > 6)
  if (recentCheckIns.length >= 7 && recentCheckIns.every(c => c.lebensenergieScore >= 6) && !existingSlugs.has('consistent')) {
    await prisma.userBadge.create({ data: { userId, badgeSlug: 'consistent' } });
    newBadges.push('consistent');
  }

  // Level badges
  const journey = await prisma.userJourney.findUnique({ where: { userId } });
  if (journey) {
    if (journey.currentLevel >= 5 && !existingSlugs.has('level-5')) {
      await prisma.userBadge.create({ data: { userId, badgeSlug: 'level-5' } });
      newBadges.push('level-5');
    }
    if (journey.currentLevel >= 10 && !existingSlugs.has('level-10')) {
      await prisma.userBadge.create({ data: { userId, badgeSlug: 'level-10' } });
      newBadges.push('level-10');
    }
  }

  return newBadges;
}

