import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError, ForbiddenError } from '@/lib/utils/errors';
import { z } from 'zod';

const patchSchema = z.object({
  isPublished: z.boolean().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  priceUsdc: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const claims = await requireAuth(req);
    const { id } = await params;
    const body = await req.json();
    const data = patchSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { privyId: claims.userId },
      include: { creator: true },
    });
    if (!user?.creator) throw new NotFoundError('Creator profile');

    const content = await prisma.content.findUnique({ where: { id } });
    if (!content) throw new NotFoundError('Content');
    if (content.creatorId !== user.creator.id) throw new ForbiddenError();

    if (data.isPublished && content.moderationStatus !== 'APPROVED') {
      throw new ForbiddenError('Content cannot be published until it passes moderation.');
    }

    const updated = await prisma.content.update({
      where: { id },
      data: {
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });

    return Response.json({ id: updated.id, isPublished: updated.isPublished });
  } catch (err) {
    return toApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const claims = await requireAuth(req);
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { privyId: claims.userId },
      include: { creator: true },
    });
    if (!user?.creator) throw new NotFoundError('Creator profile');

    const content = await prisma.content.findUnique({ where: { id } });
    if (!content) throw new NotFoundError('Content');
    if (content.creatorId !== user.creator.id) throw new ForbiddenError();

    await prisma.content.delete({ where: { id } });

    return new Response(null, { status: 204 });
  } catch (err) {
    return toApiError(err);
  }
}
