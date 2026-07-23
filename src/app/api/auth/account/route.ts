import { NextRequest } from 'next/server';
import { privyServer, requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError } from '@/lib/utils/errors';

async function deletePrivyAccount(privyId: string) {
  try {
    await privyServer.deleteUser(privyId);
  } catch (err) {
    const status =
      typeof err === 'object' && err !== null && 'status' in err
        ? (err as { status?: unknown }).status
        : undefined;

    if (status === 404) return;

    throw new Error('Unable to delete the connected account');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const claims = await requireAuth(req);
    const user = await prisma.user.findUnique({
      where: { privyId: claims.userId },
      select: { id: true, creator: { select: { id: true } } },
    });

    if (!user) {
      return Response.json({ ok: true });
    }

    const creatorId = user.creator?.id;

    // Delete the external identity first so a removed account cannot be re-provisioned.
    await deletePrivyAccount(claims.userId);

    await prisma.$transaction(async (tx) => {
      const [payments, content, products, communities, payouts] = await Promise.all([
        tx.payment.findMany({
          where: creatorId
            ? { OR: [{ fromUserId: user.id }, { toCreatorId: creatorId }] }
            : { fromUserId: user.id },
          select: { id: true },
        }),
        creatorId
          ? tx.content.findMany({ where: { creatorId }, select: { id: true } })
          : Promise.resolve([]),
        creatorId
          ? tx.product.findMany({ where: { creatorId }, select: { id: true } })
          : Promise.resolve([]),
        creatorId
          ? tx.community.findMany({ where: { creatorId }, select: { id: true } })
          : Promise.resolve([]),
        creatorId
          ? tx.payout.findMany({ where: { creatorId }, select: { id: true } })
          : Promise.resolve([]),
      ]);

      const paymentIds = payments.map((payment) => payment.id);
      const contentIds = content.map((item) => item.id);
      const productIds = products.map((product) => product.id);
      const communityIds = communities.map((community) => community.id);
      const payoutIds = payouts.map((payout) => payout.id);
      const communityPosts = creatorId
        ? await tx.communityPost.findMany({
            where: {
              OR: [{ creatorId }, { communityId: { in: communityIds } }],
            },
            select: { id: true },
          })
        : [];
      const communityPostIds = communityPosts.map((post) => post.id);

      await tx.communityPostLike.deleteMany({
        where: {
          OR: [
            { userId: user.id },
            ...(communityPostIds.length ? [{ postId: { in: communityPostIds } }] : []),
          ],
        },
      });
      await tx.communityPostComment.deleteMany({
        where: {
          OR: [
            { authorId: user.id },
            ...(communityPostIds.length ? [{ postId: { in: communityPostIds } }] : []),
          ],
        },
      });
      await tx.communityMember.deleteMany({
        where: {
          OR: [
            { userId: user.id },
            ...(communityIds.length ? [{ communityId: { in: communityIds } }] : []),
          ],
        },
      });

      await tx.ledgerEntry.deleteMany({
        where: {
          OR: [
            { userId: user.id },
            ...(paymentIds.length ? [{ paymentId: { in: paymentIds } }] : []),
            ...(payoutIds.length ? [{ payoutId: { in: payoutIds } }] : []),
          ],
        },
      });
      await tx.purchase.deleteMany({
        where: {
          OR: [
            { userId: user.id },
            ...(paymentIds.length ? [{ paymentId: { in: paymentIds } }] : []),
            ...(contentIds.length ? [{ contentId: { in: contentIds } }] : []),
            ...(productIds.length ? [{ productId: { in: productIds } }] : []),
          ],
        },
      });
      if (paymentIds.length) {
        await tx.payment.deleteMany({ where: { id: { in: paymentIds } } });
      }

      if (creatorId) {
        await tx.subscription.deleteMany({
          where: { OR: [{ userId: user.id }, { creatorId }] },
        });
        await tx.contentAccess.deleteMany({
          where: {
            OR: [{ contentId: { in: contentIds } }, { tier: { creatorId } }],
          },
        });
        await tx.communityPost.deleteMany({
          where: { id: { in: communityPostIds } },
        });
        await tx.communityDistribution.deleteMany({
          where: { communityId: { in: communityIds } },
        });
        await tx.content.deleteMany({ where: { id: { in: contentIds } } });
        await tx.product.deleteMany({ where: { id: { in: productIds } } });
        await tx.subscriptionTier.deleteMany({ where: { creatorId } });
        await tx.community.deleteMany({ where: { id: { in: communityIds } } });
        await tx.payout.deleteMany({ where: { id: { in: payoutIds } } });
        await tx.creator.delete({ where: { id: creatorId } });
      } else {
        await tx.subscription.deleteMany({ where: { userId: user.id } });
      }

      await tx.user.delete({ where: { id: user.id } });
    });

    return Response.json({ ok: true });
  } catch (err) {
    return toApiError(err);
  }
}
