import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError } from '@/lib/utils/errors';

const GRACE_PERIOD_HOURS = 48;

export async function GET(req: NextRequest) {
  try {
    const claims = await requireAuth(req);
    const user = await prisma.user.findUnique({
      where: { privyId: claims.userId },
      include: { creator: true },
    });
    if (!user?.creator) throw new NotFoundError('Creator profile');

    const now = new Date();
    const graceDeadline = new Date(now.getTime() - GRACE_PERIOD_HOURS * 60 * 60 * 1000);

    // Eagerly expire any subscriptions to this creator that the nightly cron
    // may not have processed yet, so the studio always shows accurate statuses.
    await prisma.$transaction([
      prisma.subscription.updateMany({
        where: {
          creatorId: user.creator.id,
          status: { in: ['ACTIVE', 'PAST_DUE'] },
          currentPeriodEnd: { lt: graceDeadline },
        },
        data: { status: 'EXPIRED' },
      }),
      prisma.subscription.updateMany({
        where: {
          creatorId: user.creator.id,
          status: 'ACTIVE',
          currentPeriodEnd: { lt: now, gte: graceDeadline },
        },
        data: { status: 'PAST_DUE' },
      }),
    ]);

    // Return ACTIVE and PAST_DUE (grace) only — expired are no longer subscribers
    const subscriptions = await prisma.subscription.findMany({
      where: {
        creatorId: user.creator.id,
        status: { in: ['ACTIVE', 'PAST_DUE'] },
      },
      include: {
        tier: { select: { name: true, priceUsdc: true } },
        user: { select: { walletAddress: true, username: true, avatarUrl: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: 100,
    });

    return Response.json(
      subscriptions.map((s) => ({
        id: s.id,
        status: s.status,
        currentPeriodEnd: s.currentPeriodEnd,
        tier: { name: s.tier.name, priceUsdc: s.tier.priceUsdc.toString() },
        user: { walletAddress: s.user.walletAddress, username: s.user.username },
      })),
    );
  } catch (err) {
    return toApiError(err);
  }
}
