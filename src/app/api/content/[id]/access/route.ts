import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError } from '@/lib/utils/errors';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const claims = await requireAuth(req);

    const user = await prisma.user.findUnique({ where: { privyId: claims.userId } });
    if (!user) throw new NotFoundError('User');

    const content = await prisma.content.findUnique({
      where: { id },
      include: { accessRules: true },
    });

    if (!content || !content.isPublished) throw new NotFoundError('Content');

    // Free content is always accessible
    if (content.isFree || content.accessType === 'FREE') {
      return Response.json({ hasAccess: true, reason: 'free' });
    }

    // Check one-time purchase
    if (content.accessType === 'ONE_TIME_PURCHASE' || content.accessType === 'SUBSCRIPTION_OR_PURCHASE') {
      const purchased = await prisma.purchase.findFirst({
        where: { userId: user.id, contentId: content.id },
      });
      if (purchased) return Response.json({ hasAccess: true, reason: 'purchased' });
    }

    // Check subscription
    if (content.accessType === 'SUBSCRIPTION' || content.accessType === 'SUBSCRIPTION_OR_PURCHASE') {
      const tierIds = content.accessRules
        .filter((r) => r.tierId)
        .map((r) => r.tierId!);

      const hasSubscription = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          creatorId: content.creatorId,
          status: 'ACTIVE',
          currentPeriodEnd: { gt: new Date() },
          ...(tierIds.length > 0 ? { tierId: { in: tierIds } } : {}),
        },
      });

      if (hasSubscription) return Response.json({ hasAccess: true, reason: 'subscribed' });
    }

    return Response.json({ hasAccess: false, reason: 'not_subscribed' });
  } catch (err) {
    return toApiError(err);
  }
}
