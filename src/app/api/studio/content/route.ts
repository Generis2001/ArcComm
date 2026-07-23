import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError, ForbiddenError, NotFoundError } from '@/lib/utils/errors';
import { z } from 'zod';
import { ContentType, AccessType, ModerationStatus } from '@prisma/client';
import { usdcToUnits } from '@/lib/payments/usdc';
import { head } from '@vercel/blob';
import {
  MIN_VIDEO_FRAMES,
  NSFW_THRESHOLD,
  requiresVisualModeration,
} from '@/lib/nsfw/policy';
import { PROHIBITED_CONTENT_MESSAGE } from '@/lib/uploads/errors';

const createContentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  type: z.nativeEnum(ContentType).default(ContentType.ARTICLE),
  mediaUrl: z.string().url().optional().or(z.literal('')),
  isPremium: z.boolean().default(false),
  priceUsdc: z.string().optional(),
  nsfwScore: z.number().min(0).max(1).optional(),
  moderationFrameCount: z.number().int().min(1).max(20).optional(),
});

const CONTENT_TYPES: Record<Exclude<ContentType, 'ARTICLE'>, readonly string[]> = {
  VIDEO: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac'],
  IMAGE_GALLERY: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  FILE: [
    'application/pdf',
    'application/zip',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
  ],
};

async function verifyUploadedMedia(type: ContentType, mediaUrl?: string): Promise<void> {
  if (type === ContentType.ARTICLE) return;
  if (!mediaUrl) throw new ForbiddenError('A media file is required for this content type.');

  let blob;
  try {
    blob = await head(mediaUrl);
  } catch {
    throw new ForbiddenError('The uploaded media could not be verified. Please re-upload the file.');
  }

  if (
    !blob.pathname.startsWith('content/') ||
    !CONTENT_TYPES[type].includes(blob.contentType)
  ) {
    throw new ForbiddenError('The uploaded file does not match the selected content type.');
  }
}

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
        isPublished: c.isPublished && c.moderationStatus === ModerationStatus.APPROVED,
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
    await verifyUploadedMedia(data.type, data.mediaUrl || undefined);
    const needsModeration = requiresVisualModeration(data.type);

    if (needsModeration) {
      const minimumFrames = data.type === ContentType.VIDEO ? MIN_VIDEO_FRAMES : 1;
      const nsfwScore = data.nsfwScore;
      const moderationFrameCount = data.moderationFrameCount;
      const hasModerationEvidence =
        nsfwScore !== undefined &&
        moderationFrameCount !== undefined &&
        moderationFrameCount >= minimumFrames;

      if (!hasModerationEvidence) {
        throw new ForbiddenError(
          'Required media moderation could not be verified. Please re-upload the file.',
        );
      }
      if (nsfwScore >= NSFW_THRESHOLD) {
        throw new ForbiddenError(PROHIBITED_CONTENT_MESSAGE);
      }
    }

    let priceUsdcUnits: bigint | undefined;
    if (data.priceUsdc && !data.isPremium) {
      priceUsdcUnits = usdcToUnits(parseFloat(data.priceUsdc));
    }

    const accessType = data.isPremium
      ? AccessType.SUBSCRIPTION
      : priceUsdcUnits
        ? AccessType.ONE_TIME_PURCHASE
        : AccessType.FREE;

    const content = await prisma.content.create({
      data: {
        creatorId: user.creator.id,
        title: data.title,
        description: data.description,
        type: data.type,
        mediaUrl: data.mediaUrl || undefined,
        isPublished: true,
        isFree: accessType === AccessType.FREE,
        priceUsdc: priceUsdcUnits,
        accessType,
        moderationStatus: ModerationStatus.APPROVED,
        nsfwScore: data.nsfwScore,
      },
      select: { id: true, title: true, type: true, isPublished: true, moderationStatus: true },
    });

    return Response.json(content, { status: 201 });
  } catch (err) {
    return toApiError(err);
  }
}
