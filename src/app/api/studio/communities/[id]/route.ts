import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError, ForbiddenError } from '@/lib/utils/errors';
import { requireAuth } from '@/lib/privy/server';
import { z } from 'zod';

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const claims = await requireAuth(req);
    const user = await prisma.user.findUnique({ where: { privyId: claims.userId }, include: { creator: true } });
    if (!user?.creator) throw new ForbiddenError();

    const community = await prisma.community.findUnique({ where: { id } });
    if (!community) throw new NotFoundError('Community');
    if (community.creatorId !== user.creator.id) throw new ForbiddenError();

    const body = await req.json();
    const data = patchSchema.parse(body);

    const updated = await prisma.community.update({
      where: { id },
      data,
      select: { id: true, name: true, description: true, isActive: true, updatedAt: true },
    });

    return Response.json(updated);
  } catch (err) {
    return toApiError(err);
  }
}
