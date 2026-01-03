import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthUser } from '../middleware/auth.js';

// Extend FastifyRequest with user
interface AuthenticatedRequest extends FastifyRequest {
  user: AuthUser;
}

// Feature access based on journey state
const FEATURE_ACCESS = {
  onboarding_start: {
    dashboard: true,
    modules: 'first' as const, // Only first module
    community: 'none' as const,
    tracker: 'basic' as const,
    workshops: false,
    circles: false,
    mentoring: false,
  },
  onboarding_checkin: {
    dashboard: true,
    modules: 'first' as const,
    community: 'read' as const,
    tracker: 'basic' as const,
    workshops: false,
    circles: false,
    mentoring: false,
  },
  onboarding_first_module: {
    dashboard: true,
    modules: 'basis' as const, // 3 modules
    community: 'read' as const,
    tracker: 'basic' as const,
    workshops: false,
    circles: false,
    mentoring: false,
  },
  trial_active: {
    dashboard: true,
    modules: 'all' as const,
    community: 'read_write' as const,
    tracker: 'advanced' as const,
    workshops: false,
    circles: false,
    mentoring: false,
  },
  lebensenergie_active: {
    dashboard: true,
    modules: 'all' as const,
    community: 'full' as const,
    tracker: 'advanced' as const,
    workshops: false,
    circles: false,
    mentoring: false,
  },
  resilienz_active: {
    dashboard: true,
    modules: 'all' as const,
    community: 'full' as const,
    tracker: 'advanced' as const,
    workshops: true,
    circles: true,
    mentoring: true,
  },
};

// Level requirements
const LEVEL_REQUIREMENTS = [
  { level: 1, checkIns: 0, modulesCompleted: 0 },
  { level: 2, checkIns: 3, modulesCompleted: 1 },
  { level: 3, checkIns: 7, modulesCompleted: 3 },
  { level: 4, checkIns: 14, modulesCompleted: 5 },
  { level: 5, checkIns: 21, modulesCompleted: 8 },
  { level: 6, checkIns: 30, modulesCompleted: 12 },
  { level: 7, checkIns: 45, modulesCompleted: 16 },
  { level: 8, checkIns: 60, modulesCompleted: 20 },
  { level: 9, checkIns: 90, modulesCompleted: 25 },
  { level: 10, checkIns: 120, modulesCompleted: 30 },
];

export async function journeyRoutes(fastify: FastifyInstance) {
  // Get user's journey state
  fastify.get(
    '/journey',
    { preHandler: authenticate },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const userId = request.user!.id;

      // Get or create journey
      let journey = await prisma.userJourney.findUnique({
        where: { userId },
      });

      if (!journey) {
        journey = await prisma.userJourney.create({
          data: {
            userId,
            state: 'onboarding_start',
          },
        });
      }

      // Get badges
      const badges = await prisma.userBadge.findMany({
        where: { userId },
        orderBy: { earnedAt: 'desc' },
      });

      // Get recent check-ins for trend
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentCheckIns = await prisma.checkIn.findMany({
        where: {
          userId,
          checkedInAt: { gte: thirtyDaysAgo },
        },
        orderBy: { checkedInAt: 'desc' },
      });

      // Calculate trend
      let trend = 0;
      if (recentCheckIns.length >= 7) {
        const lastWeekAvg = recentCheckIns.slice(0, 7).reduce((sum, c) => sum + c.lebensenergieScore, 0) / 7;
        const previousWeekAvg = recentCheckIns.slice(7, 14).reduce((sum, c) => sum + c.lebensenergieScore, 0) / Math.min(7, recentCheckIns.slice(7, 14).length || 1);
        trend = lastWeekAvg - previousWeekAvg;
      }

      // Calculate streak
      const streak = await calculateStreak(userId);

      // Get feature access based on state
      const featureAccess = FEATURE_ACCESS[journey.state as keyof typeof FEATURE_ACCESS] || FEATURE_ACCESS.onboarding_start;

      // Get next level requirements
      const currentLevelIndex = LEVEL_REQUIREMENTS.findIndex(l => l.level === journey!.currentLevel);
      const nextLevel = currentLevelIndex < LEVEL_REQUIREMENTS.length - 1 
        ? LEVEL_REQUIREMENTS[currentLevelIndex + 1] 
        : null;

      // Calculate progress to next level
      let levelProgress = 100;
      if (nextLevel) {
        const checkInProgress = Math.min(100, (journey.checkInsCompleted / nextLevel.checkIns) * 100);
        const moduleProgress = Math.min(100, (journey.modulesCompleted / nextLevel.modulesCompleted) * 100);
        levelProgress = (checkInProgress + moduleProgress) / 2;
      }

      // Trial status
      const isTrialActive = journey.trialStartedAt && journey.trialEndsAt && new Date() < journey.trialEndsAt;
      const trialDaysLeft = journey.trialEndsAt 
        ? Math.max(0, Math.ceil((new Date(journey.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;

      return reply.send({
        journey: {
          state: journey.state,
          currentLevel: journey.currentLevel,
          checkInsCompleted: journey.checkInsCompleted,
          modulesCompleted: journey.modulesCompleted,
          daysActive: journey.daysActive,
          streak,
          trend: Math.round(trend * 10) / 10,
          subscriptionTier: journey.subscriptionTier,
          isTrialActive,
          trialDaysLeft,
        },
        featureAccess,
        nextLevel: nextLevel ? {
          level: nextLevel.level,
          checkInsRequired: nextLevel.checkIns,
          modulesRequired: nextLevel.modulesCompleted,
          progress: Math.round(levelProgress),
        } : null,
        badges: badges.map(b => ({
          slug: b.badgeSlug,
          earnedAt: b.earnedAt,
        })),
        stats: {
          totalCheckIns: journey.checkInsCompleted,
          avgScore: recentCheckIns.length > 0 
            ? Math.round(recentCheckIns.reduce((sum, c) => sum + c.lebensenergieScore, 0) / recentCheckIns.length * 10) / 10
            : 0,
        },
      });
    }
  );

  // Start trial
  fastify.post(
    '/journey/trial/start',
    { preHandler: authenticate },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const userId = request.user!.id;

      let journey = await prisma.userJourney.findUnique({
        where: { userId },
      });

      if (!journey) {
        journey = await prisma.userJourney.create({
          data: {
            userId,
            state: 'onboarding_start',
          },
        });
      }

      // Check if already on trial or subscribed
      if (journey.trialStartedAt) {
        return reply.status(400).send({ error: 'Du hast bereits ein Trial gestartet' });
      }

      if (journey.subscriptionTier) {
        return reply.status(400).send({ error: 'Du hast bereits ein aktives Abo' });
      }

      const trialStartedAt = new Date();
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 7-day trial

      journey = await prisma.userJourney.update({
        where: { userId },
        data: {
          state: 'trial_active',
          trialStartedAt,
          trialEndsAt,
        },
      });

      return reply.send({
        message: 'Trial gestartet!',
        trialStartedAt: journey.trialStartedAt,
        trialEndsAt: journey.trialEndsAt,
        daysLeft: 7,
      });
    }
  );

  // Get badges
  fastify.get(
    '/journey/badges',
    { preHandler: authenticate },
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const userId = request.user!.id;

      const badges = await prisma.userBadge.findMany({
        where: { userId },
        orderBy: { earnedAt: 'desc' },
      });

      // All possible badges
      const allBadges = [
        { slug: 'first-checkin', name: 'Erster Check-in', description: 'Du hast deinen ersten Check-in gemacht!' },
        { slug: '3-day-streak', name: '3-Tage Streak', description: '3 Tage in Folge eingecheckt!' },
        { slug: '7-day-streak', name: '7-Tage Streak', description: 'Eine ganze Woche Streak!' },
        { slug: '30-day-streak', name: '30-Tage Streak', description: 'Ein ganzer Monat! Unglaublich!' },
        { slug: 'level-5', name: 'Level 5', description: 'Du hast Level 5 erreicht!' },
        { slug: 'level-10', name: 'Level 10', description: 'Du hast Level 10 erreicht!' },
        { slug: 'high-energy', name: 'Energiebündel', description: 'LEBENSENERGIE-Score über 9!' },
        { slug: 'consistent', name: 'Konstant', description: '7 Tage mit Score über 6!' },
      ];

      const earnedSlugs = new Set(badges.map(b => b.badgeSlug));

      return reply.send({
        earned: badges.map(b => ({
          ...allBadges.find(ab => ab.slug === b.badgeSlug),
          earnedAt: b.earnedAt,
        })),
        available: allBadges.filter(b => !earnedSlugs.has(b.slug)),
        total: allBadges.length,
        earnedCount: badges.length,
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

  const lastCheckIn = new Date(checkIns[0].checkedInAt);
  lastCheckIn.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 1) return 0;

  let expectedDate = new Date(lastCheckIn);
  const seenDates = new Set<string>();

  for (const checkIn of checkIns) {
    const checkInDate = new Date(checkIn.checkedInAt);
    checkInDate.setHours(0, 0, 0, 0);
    const dateStr = checkInDate.toISOString().split('T')[0];

    if (seenDates.has(dateStr)) continue; // Skip duplicates
    seenDates.add(dateStr);

    if (checkInDate.getTime() === expectedDate.getTime()) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

