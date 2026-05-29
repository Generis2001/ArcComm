import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError } from '@/lib/utils/errors';

interface RouteContext {
  params: Promise<{ handle: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { handle } = await params;

    const creator = await prisma.creator.findUnique({
      where: { handle },
      include: {
        user: { select: { avatarUrl: true } },
        subscriptionTiers: {
          where: { isActive: true },
          orderBy: { priceUsdc: 'asc' },
        },
      },
    });

    if (!creator || !creator.isActive) throw new NotFoundError('Creator');

    return Response.json({
      id: creator.id,
      handle: creator.handle,
      displayName: creator.displayName,
      bio: creator.bio,
      bannerUrl: creator.bannerUrl,
      avatarUrl: creator.user.avatarUrl,
      isVerified: creator.isVerified,
      totalEarned: creator.totalEarned.toString(),
      subscriptionTiers: creator.subscriptionTiers.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        priceUsdc: t.priceUsdc.toString(),
        intervalDays: t.intervalDays,
        perks: t.perks,
        maxSubscribers: t.maxSubscribers,
        isActive: t.isActive,
      })),
    });
  } catch (err) {
    return toApiError(err);
  }
}
