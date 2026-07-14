import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError } from '@/lib/utils/errors';
import { z } from 'zod';

const confirmSchema = z.object({
  paymentId: z.string(),
  dbPaymentId: z.string(),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  contentId: z.string().optional(),
  productId: z.string().optional(),
  tierId: z.string().optional(),
  communityId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const claims = await requireAuth(req);
    const body = await req.json();
    const { dbPaymentId, txHash, contentId, productId, tierId, communityId } = confirmSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { privyId: claims.userId } });
    if (!user) throw new NotFoundError('User');

    const payment = await prisma.payment.findUnique({ where: { id: dbPaymentId } });
    if (!payment) throw new NotFoundError('Payment');
    if (payment.fromUserId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.payment.update({
      where: { id: dbPaymentId },
      data: { txHash, status: 'CONFIRMED' },
    });

    // Create Purchase record + credit creator balance immediately as settled
    if (payment.type === 'CONTENT_PURCHASE' && contentId) {
      const existing = await prisma.purchase.findFirst({
        where: { userId: user.id, contentId },
        select: { id: true },
      });
      if (!existing) {
        await prisma.$transaction([
          prisma.purchase.create({
            data: {
              userId: user.id,
              contentId,
              paymentId: dbPaymentId,
              amountUsdc: payment.grossAmountUsdc,
            },
          }),
          prisma.content.update({
            where: { id: contentId },
            data: { views: { increment: 1 } },
          }),
          prisma.creator.update({
            where: { id: payment.toCreatorId },
            data: {
              totalEarned: { increment: payment.netAmountUsdc },
              settledBalance: { increment: payment.netAmountUsdc },
            },
          }),
        ]);
      }
    } else if (payment.type === 'PRODUCT_PURCHASE' && productId) {
      const existing = await prisma.purchase.findFirst({
        where: { userId: user.id, productId },
        select: { id: true },
      });
      if (!existing) {
        await prisma.$transaction([
          prisma.purchase.create({
            data: {
              userId: user.id,
              productId,
              paymentId: dbPaymentId,
              amountUsdc: payment.grossAmountUsdc,
            },
          }),
          prisma.product.update({
            where: { id: productId },
            data: { totalSold: { increment: 1 } },
          }),
          prisma.creator.update({
            where: { id: payment.toCreatorId },
            data: {
              totalEarned: { increment: payment.netAmountUsdc },
              settledBalance: { increment: payment.netAmountUsdc },
            },
          }),
        ]);
      }
    } else if (payment.type === 'SUBSCRIPTION_INITIAL' || payment.type === 'SUBSCRIPTION_RENEWAL') {
      await prisma.$transaction(async (tx) => {
        await tx.creator.update({
          where: { id: payment.toCreatorId },
          data: {
            totalEarned: { increment: payment.netAmountUsdc },
            settledBalance: { increment: payment.netAmountUsdc },
          },
        });

        if (tierId) {
          const tier = await tx.subscriptionTier.findUnique({ where: { id: tierId } });
          if (!tier || tier.creatorId !== payment.toCreatorId) {
            throw new NotFoundError('Subscription tier');
          }

          const now = new Date();
          const existing = await tx.subscription.findUnique({
            where: { userId_tierId: { userId: user.id, tierId } },
            select: { currentPeriodEnd: true },
          });
          // Early renewals extend the existing access period instead of discarding unused days.
          const periodStart = existing?.currentPeriodEnd && existing.currentPeriodEnd > now
            ? existing.currentPeriodEnd
            : now;
          const periodEnd = new Date(periodStart.getTime() + tier.intervalDays * 86_400_000);

          const subscription = await tx.subscription.upsert({
            where: { userId_tierId: { userId: user.id, tierId } },
            create: {
              userId: user.id,
              creatorId: payment.toCreatorId,
              tierId,
              status: 'ACTIVE',
              txHash,
              startedAt: periodStart,
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
              renewalCount: 0,
            },
            update: {
              status: 'ACTIVE',
              txHash,
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
              renewalCount: { increment: 1 },
            },
          });

          await tx.payment.update({
            where: { id: dbPaymentId },
            data: { subscriptionId: subscription.id },
          });
        }
      });
    } else if (payment.type === 'COMMUNITY_JOIN' && communityId) {
      await prisma.$transaction([
        prisma.communityMember.create({
          data: { communityId, userId: user.id },
        }),
        prisma.community.update({
          where: { id: communityId },
          data: { communityPool: { increment: payment.grossAmountUsdc } },
        }),
        prisma.creator.update({
          where: { id: payment.toCreatorId },
          data: {
            totalEarned: { increment: payment.netAmountUsdc },
            settledBalance: { increment: payment.netAmountUsdc },
          },
        }),
      ]);
    }

    return Response.json({ status: 'confirmed', txHash });
  } catch (err) {
    return toApiError(err);
  }
}
