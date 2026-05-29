import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { toApiError } from '@/lib/utils/errors';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> },
) {
  try {
    const { handle } = await params;

    const creator = await prisma.creator.findUnique({
      where: { handle },
      select: { id: true, isActive: true },
    });

    if (!creator || !creator.isActive) {
      return Response.json({ error: 'Creator not found' }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { creatorId: creator.id, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        priceUsdc: p.priceUsdc.toString(),
        imageUrl: p.imageUrl,
        productType: p.productType,
        totalSold: p.totalSold,
        createdAt: p.createdAt,
      })),
    );
  } catch (err) {
    return toApiError(err);
  }
}
