import { prisma } from '@/lib/db/client';

export const PREMIUM_REQUIRED_PERIODS = 3;
const PREMIUM_PERIOD_DAYS = 30;

export async function getPremiumAccess(userId: string, creatorId: string) {
  const now = new Date();
  const [activeSubscription, subscriptionHistory] = await Promise.all([
    prisma.subscription.findFirst({
      where: {
        userId,
        creatorId,
        status: 'ACTIVE',
        currentPeriodEnd: { gt: now },
        tier: { is: { intervalDays: PREMIUM_PERIOD_DAYS } },
      },
      select: { id: true },
    }),
    prisma.subscription.findMany({
      where: {
        userId,
        creatorId,
        tier: { is: { intervalDays: PREMIUM_PERIOD_DAYS } },
      },
      select: { renewalCount: true },
    }),
  ]);

  const completedPeriods = subscriptionHistory.reduce(
    (total, subscription) => total + subscription.renewalCount + 1,
    0,
  );
  const hasActiveSubscription = Boolean(activeSubscription);

  return {
    completedPeriods,
    requiredPeriods: PREMIUM_REQUIRED_PERIODS,
    hasActiveSubscription,
    isEligible: hasActiveSubscription && completedPeriods >= PREMIUM_REQUIRED_PERIODS,
  };
}
