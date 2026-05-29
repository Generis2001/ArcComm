import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError } from '@/lib/utils/errors';
import { unitsToUsdc } from '@/lib/payments/usdc';

export async function GET(req: NextRequest) {
  try {
    const claims = await requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { privyId: claims.userId },
      include: { creator: true },
    });

    if (!user?.creator) throw new NotFoundError('Creator profile');

    const creator = user.creator;

    // Sum paid-out amounts to subtract from totalEarned
    const [inFlight, paidOut] = await Promise.all([
      prisma.payout.aggregate({
        where: { creatorId: creator.id, status: { in: ['REQUESTED', 'PROCESSING'] } },
        _sum: { amountUsdc: true },
      }),
      prisma.payout.aggregate({
        where: { creatorId: creator.id, status: 'CONFIRMED' },
        _sum: { amountUsdc: true },
      }),
    ]);

    const inFlightAmount = inFlight._sum.amountUsdc ?? 0n;
    const paidOutAmount = paidOut._sum.amountUsdc ?? 0n;
    const available = creator.totalEarned - paidOutAmount - inFlightAmount;

    return Response.json({
      totalEarned: unitsToUsdc(creator.totalEarned),
      availableToWithdraw: unitsToUsdc(available < 0n ? 0n : available),
    });
  } catch (err) {
    return toApiError(err);
  }
}
