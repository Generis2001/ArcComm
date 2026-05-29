import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError } from '@/lib/utils/errors';
import { requireAuth } from '@/lib/privy/server';
import { formatUsdc } from '@/lib/payments/usdc';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    let userId: string | null = null;
    try {
      const claims = await requireAuth(req);
      const user = await prisma.user.findUnique({ where: { privyId: claims.userId }, select: { id: true } });
      userId = user?.id ?? null;
    } catch {
      // unauthenticated
    }

    const community = await prisma.community.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            handle: true,
            displayName: true,
            user: { select: { avatarUrl: true, walletAddress: true } },
          },
        },
        _count: { select: { members: true } },
        members: userId ? { where: { userId }, select: { id: true } } : false,
      },
    });

    if (!community || !community.isActive) throw new NotFoundError('Community');

    const isMember = userId ? (community.members as { id: string }[]).length > 0 : false;
    const isCreator = userId
      ? await prisma.creator.findFirst({ where: { id: community.creatorId, userId } }).then(Boolean)
      : false;

    return Response.json({
      id: community.id,
      name: community.name,
      description: community.description,
      entryFeeUsdc: community.entryFeeUsdc.toString(),
      entryFeeFormatted: formatUsdc(community.entryFeeUsdc),
      revenueSplitPct: community.revenueSplitPct,
      memberCount: community._count.members,
      isMember,
      isCreator,
      creator: community.creator,
      createdAt: community.createdAt,
    });
  } catch (err) {
    return toApiError(err);
  }
}
