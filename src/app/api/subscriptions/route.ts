import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError } from '@/lib/utils/errors';

const GRACE_PERIOD_HOURS = 48;

export async function GET(req: NextRequest) {
  try {
    const claims = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get('creatorId');

    const user = await prisma.user.findUnique({ where: { privyId: claims.userId } });
    if (!user) throw new NotFoundError('User');

    const now = new Date();
    const graceDeadline = new Date(now.getTime() - GRACE_PERIOD_HOURS * 60 * 60 * 1000);

    // Eagerly expire subs that the nightly cron may not have reached yet.
    // This guarantees status is accurate on every page load regardless of cron timing.
    await prisma.$transaction([
      // ACTIVE/PAST_DUE past grace period → EXPIRED
      prisma.subscription.updateMany({
        where: {
          userId: user.id,
          status: { in: ['ACTIVE', 'PAST_DUE'] },
          currentPeriodEnd: { lt: graceDeadline },
        },
        data: { status: 'EXPIRED' },
      }),
      // ACTIVE past period end but within grace → PAST_DUE
      prisma.subscription.updateMany({
        where: {
          userId: user.id,
          status: 'ACTIVE',
          currentPeriodEnd: { lt: now, gte: graceDeadline },
        },
        data: { status: 'PAST_DUE' },
      }),
    ]);

    // Return all statuses (including EXPIRED) so the dashboard can show them
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: user.id,
        ...(creatorId ? { creatorId } : {}),
        status: { in: ['ACTIVE', 'PAST_DUE', 'EXPIRED'] },
      },
      include: {
        tier: { select: { id: true, name: true, priceUsdc: true, intervalDays: true, perks: true } },
        creator: { select: { id: true, handle: true, displayName: true, user: { select: { avatarUrl: true } } } },
      },
      orderBy: { startedAt: 'desc' },
    });

    return Response.json(
      subscriptions.map((s) => ({
        id: s.id,
        status: s.status,
        currentPeriodStart: s.currentPeriodStart.toISOString(),
        currentPeriodEnd: s.currentPeriodEnd.toISOString(),
        renewalCount: s.renewalCount,
        tier: { ...s.tier, priceUsdc: s.tier.priceUsdc.toString() },
        creator: {
          id: s.creator.id,
          handle: s.creator.handle,
          displayName: s.creator.displayName,
          avatarUrl: s.creator.user.avatarUrl,
        },
      })),
    );
  } catch (err) {
    return toApiError(err);
  }
}
