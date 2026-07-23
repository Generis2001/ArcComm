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

    const creatorId = user.creator.id;

    const [activeSubscribers, totalContent, totalSales] = await Promise.all([
      prisma.subscription.count({ where: { creatorId, status: 'ACTIVE' } }),
      prisma.content.count({
        where: { creatorId, isPublished: true, moderationStatus: 'APPROVED' },
      }),
      prisma.purchase.count({
        where: {
          OR: [
            { content: { creatorId } },
            { product: { creatorId } },
          ],
        },
      }),
    ]);

    return Response.json({
      totalEarned: user.creator.totalEarned.toString(),
      activeSubscribers,
      totalContent,
      totalSales,
    });
  } catch (err) {
    return toApiError(err);
  }
}
