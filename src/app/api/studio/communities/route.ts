import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError, ForbiddenError } from '@/lib/utils/errors';
import { requireAuth } from '@/lib/privy/server';
import { usdcToUnits, formatUsdc } from '@/lib/payments/usdc';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  entryFeeUsdc: z.string().regex(/^\d+(\.\d{1,6})?$/),
  revenueSplitPct: z.number().int().min(0).max(100),
});

export async function GET(req: NextRequest) {
  try {
    const claims = await requireAuth(req);
    const user = await prisma.user.findUnique({ where: { privyId: claims.userId }, include: { creator: true } });
    if (!user?.creator) throw new NotFoundError('Creator profile');

    const communities = await prisma.community.findMany({
      where: { creatorId: user.creator.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { members: true } } },
    });

    return Response.json(communities.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      entryFeeUsdc: c.entryFeeUsdc.toString(),
      entryFeeFormatted: formatUsdc(c.entryFeeUsdc),
      revenueSplitPct: c.revenueSplitPct,
      communityPool: c.communityPool.toString(),
      communityPoolFormatted: formatUsdc(c.communityPool),
      memberCount: c._count.members,
      isActive: c.isActive,
      lastDistributedAt: c.lastDistributedAt,
      createdAt: c.createdAt,
    })));
  } catch (err) {
    return toApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const claims = await requireAuth(req);
    const user = await prisma.user.findUnique({ where: { privyId: claims.userId }, include: { creator: true } });
    if (!user?.creator) throw new NotFoundError('Creator profile');

    const body = await req.json();
    const data = createSchema.parse(body);

    const entryFeeUnits = usdcToUnits(data.entryFeeUsdc);

    const community = await prisma.community.create({
      data: {
        creatorId: user.creator.id,
        name: data.name,
        description: data.description,
        entryFeeUsdc: entryFeeUnits,
        revenueSplitPct: data.revenueSplitPct,
      },
      select: { id: true, name: true, entryFeeUsdc: true, revenueSplitPct: true, createdAt: true },
    });

    return Response.json({
      ...community,
      entryFeeUsdc: community.entryFeeUsdc.toString(),
    }, { status: 201 });
  } catch (err) {
    return toApiError(err);
  }
}
