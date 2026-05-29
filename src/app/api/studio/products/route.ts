import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError } from '@/lib/utils/errors';
import { z } from 'zod';
import { ProductType } from '@prisma/client';
import { usdcToUnits } from '@/lib/payments/usdc';

const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  priceUsdc: z.string().min(1),
  fileUrl: z.string().url().optional().or(z.literal('')),
  productType: z.nativeEnum(ProductType).default(ProductType.DIGITAL_DOWNLOAD),
});

export async function GET(req: NextRequest) {
  try {
    const claims = await requireAuth(req);
    const user = await prisma.user.findUnique({
      where: { privyId: claims.userId },
      include: { creator: true },
    });
    if (!user?.creator) return Response.json([]);

    const products = await prisma.product.findMany({
      where: { creatorId: user.creator.id },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        priceUsdc: p.priceUsdc.toString(),
        isActive: p.isActive,
        totalSold: p.totalSold,
        createdAt: p.createdAt,
      })),
    );
  } catch (err) {
    return toApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const claims = await requireAuth(req);
    const user = await prisma.user.findUnique({
      where: { privyId: claims.userId },
      include: { creator: true },
    });
    if (!user?.creator) throw new NotFoundError('Creator profile');

    const body = await req.json();
    const data = createProductSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        creatorId: user.creator.id,
        name: data.name,
        description: data.description,
        priceUsdc: usdcToUnits(parseFloat(data.priceUsdc)),
        productType: data.productType,
        deliveryUrl: data.fileUrl || undefined,
        isActive: true,
      },
    });

    return Response.json(
      { ...product, priceUsdc: product.priceUsdc.toString() },
      { status: 201 },
    );
  } catch (err) {
    return toApiError(err);
  }
}
