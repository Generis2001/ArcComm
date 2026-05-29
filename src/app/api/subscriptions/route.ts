import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError } from '@/lib/utils/errors';

export async function GET(req: NextRequest) {
  try {
    const claims = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const creatorId = searchParams.get('creatorId');

    const user = await prisma.user.findUnique({ where: { privyId: claims.userId } });
    if (!user) throw new NotFoundError('User');

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: user.id,
        ...(creatorId ? { creatorId } : {}),
        status: { in: ['ACTIVE', 'PAST_DUE'] },
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
