import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { getPremiumAccess } from '@/lib/access/premium';
import { toApiError, NotFoundError } from '@/lib/utils/errors';

interface RouteContext {
  params: Promise<{ handle: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const claims = await requireAuth(req);
    const { handle } = await params;

    const [user, creator] = await Promise.all([
      prisma.user.findUnique({ where: { privyId: claims.userId }, select: { id: true } }),
      prisma.creator.findUnique({ where: { handle }, select: { id: true, isActive: true } }),
    ]);
    if (!user) throw new NotFoundError('User');
    if (!creator || !creator.isActive) throw new NotFoundError('Creator');

    return Response.json(await getPremiumAccess(user.id, creator.id));
  } catch (err) {
    return toApiError(err);
  }
}
