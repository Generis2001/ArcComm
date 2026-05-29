import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError } from '@/lib/utils/errors';
import { z } from 'zod';
import { ContentType, AccessType, ModerationStatus } from '@prisma/client';
import { usdcToUnits } from '@/lib/payments/usdc';

const NSFW_THRESHOLD = 0.6;

const createContentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  type: z.nativeEnum(ContentType).default(ContentType.ARTICLE),
  mediaUrl: z.string().url().optional().or(z.literal('')),
  isPremium: z.boolean().default(false),
  priceUsdc: z.string().optional(),
  nsfwScore: z.number().min(0).max(1).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const claims = await requireAuth(req);
    const user = await prisma.user.findUnique({
      where: { privyId: claims.userId },
      include: { creator: true },
    });
    if (!user?.creator) return Response.json([]);

    const content = await prisma.content.findMany({
      where: { creatorId: user.creator.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { _count: { select: { purchases: true } } },
    });

    return Response.json(
      content.map((c) => ({
        id: c.id,
        title: c.title,
        type: c.type,
        isPremium: !c.isFree && c.accessType === AccessType.SUBSCRIPTION,
        priceUsdc: c.priceUsdc?.toString(),
        isPublished: c.isPublished,
        moderationStatus: c.moderationStatus,
        salesCount: c._count.purchases,
        createdAt: c.createdAt,
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
    const data = createContentSchema.parse(body);

    let priceUsdcUnits: bigint | undefined;
    if (data.priceUsdc && !data.isPremium) {
      priceUsdcUnits = usdcToUnits(parseFloat(data.priceUsdc));
    }

    const accessType = data.isPremium
      ? AccessType.SUBSCRIPTION
      : priceUsdcUnits
        ? AccessType.ONE_TIME_PURCHASE
        : AccessType.FREE;

    const isFlagged = (data.nsfwScore ?? 0) > NSFW_THRESHOLD;
    const moderationStatus: ModerationStatus = isFlagged ? ModerationStatus.FLAGGED : ModerationStatus.PENDING;

    const content = await prisma.content.create({
      data: {
        creatorId: user.creator.id,
        title: data.title,
        description: data.description,
        type: data.type,
        mediaUrl: data.mediaUrl || undefined,
        isPublished: !isFlagged,
        isFree: accessType === AccessType.FREE,
        priceUsdc: priceUsdcUnits,
        accessType,
        moderationStatus,
        nsfwScore: data.nsfwScore,
        flaggedAt: isFlagged ? new Date() : undefined,
      },
      select: { id: true, title: true, type: true, isPublished: true, moderationStatus: true },
    });

    return Response.json(content, { status: 201 });
  } catch (err) {
    return toApiError(err);
  }
}
