import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError } from '@/lib/utils/errors';

export async function GET(req: NextRequest) {
  try {
    const claims = await requireAuth(req);
    const user = await prisma.user.findUnique({ where: { privyId: claims.userId } });
    if (!user) return Response.json([], { status: 200 });

    const purchases = await prisma.purchase.findMany({
      where: { userId: user.id },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            type: true,
            mediaUrl: true,
            description: true,
            creator: { select: { handle: true, displayName: true } },
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            creator: { select: { handle: true, displayName: true } },
          },
        },
        payment: { select: { grossAmountUsdc: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return Response.json(
      purchases.map((p) => ({
        id: p.id,
        type: p.content ? 'CONTENT' : 'PRODUCT',
        amountUsdc: p.amountUsdc.toString(),
        createdAt: p.createdAt,
        content: p.content
          ? {
              id: p.content.id,
              title: p.content.title,
              type: p.content.type,
              mediaUrl: p.content.mediaUrl,
              description: p.content.description,
              creator: p.content.creator,
            }
          : undefined,
        product: p.product
          ? { id: p.product.id, name: p.product.name, creator: p.product.creator }
          : undefined,
      })),
    );
  } catch (err) {
    return toApiError(err);
  }
}
