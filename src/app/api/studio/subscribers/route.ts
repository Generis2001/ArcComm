import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError } from '@/lib/utils/errors';

export async function GET(req: NextRequest) {
  try {
    const claims = await requireAuth(req);
    const user = await prisma.user.findUnique({
      where: { privyId: claims.userId },
      include: { creator: true },
    });
    if (!user?.creator) throw new NotFoundError('Creator profile');

    const subscriptions = await prisma.subscription.findMany({
      where: { creatorId: user.creator.id, status: 'ACTIVE' },
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
