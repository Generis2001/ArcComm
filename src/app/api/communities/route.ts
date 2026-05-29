import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { toApiError } from '@/lib/utils/errors';
import { requireAuth } from '@/lib/privy/server';
import { formatUsdc } from '@/lib/payments/usdc';

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;
    try {
      const claims = await requireAuth(req);
      const user = await prisma.user.findUnique({ where: { privyId: claims.userId }, select: { id: true } });
      userId = user?.id ?? null;
    } catch {
      // unauthenticated — isMember will be false for all
    }

    const communities = await prisma.community.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, handle: true, displayName: true, user: { select: { avatarUrl: true } } } },
        _count: { select: { members: true } },
        members: userId ? { where: { userId }, select: { id: true } } : false,
      },
    });

    const result = communities.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      entryFeeUsdc: c.entryFeeUsdc.toString(),
      entryFeeFormatted: formatUsdc(c.entryFeeUsdc),
      revenueSplitPct: c.revenueSplitPct,
      memberCount: c._count.members,
      isMember: userId ? (c.members as { id: string }[]).length > 0 : false,
      creator: c.creator,
      createdAt: c.createdAt,
    }));

    return Response.json(result);
  } catch (err) {
    return toApiError(err);
  }
}
