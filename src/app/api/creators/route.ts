import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError, ForbiddenError } from '@/lib/utils/errors';
import { z } from 'zod';

const createCreatorSchema = z.object({
  handle: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Handle can only contain letters, numbers, _ and -'),
  displayName: z.string().min(1).max(80),
  bio: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const claims = await requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { privyId: claims.userId },
      include: { creator: true },
    });
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

    if (user.creator) throw new ForbiddenError('Creator profile already exists');

    const body = await req.json();
    const data = createCreatorSchema.parse(body);

    const exists = await prisma.creator.findUnique({ where: { handle: data.handle } });
    if (exists) return Response.json({ error: 'Handle already taken' }, { status: 409 });

    const creator = await prisma.creator.create({
      data: {
        userId: user.id,
        handle: data.handle.toLowerCase(),
        displayName: data.displayName,
        bio: data.bio,
      },
      select: { id: true, handle: true, displayName: true, bio: true, isVerified: true, isActive: true },
    });

    return Response.json(creator, { status: 201 });
  } catch (err) {
    return toApiError(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    const creators = await prisma.creator.findMany({
      where: {
        isActive: true,
        ...(q ? { OR: [{ handle: { contains: q } }, { displayName: { contains: q } }] } : {}),
      },
      include: {
        user: { select: { avatarUrl: true } },
        subscriptionTiers: { where: { isActive: true }, orderBy: { priceUsdc: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return Response.json(creators.map(serializeCreator));
  } catch (err) {
    return toApiError(err);
  }
}

function serializeCreator(c: {
  id: string;
  handle: string;
  displayName: string;
  bio: string | null;
  bannerUrl: string | null;
  isVerified: boolean;
  totalEarned: bigint;
  user: { avatarUrl: string | null };
  subscriptionTiers: { id: string; name: string; description: string | null; priceUsdc: bigint; intervalDays: number; perks: string[]; maxSubscribers: number | null; isActive: boolean }[];
}) {
  return {
    id: c.id,
    handle: c.handle,
    displayName: c.displayName,
    bio: c.bio,
    bannerUrl: c.bannerUrl,
    avatarUrl: c.user.avatarUrl,
    isVerified: c.isVerified,
    totalEarned: c.totalEarned.toString(),
    subscriptionTiers: c.subscriptionTiers.map((t) => ({
      ...t,
      priceUsdc: t.priceUsdc.toString(),
    })),
  };
}
