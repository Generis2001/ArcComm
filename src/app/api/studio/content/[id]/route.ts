import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError, ForbiddenError } from '@/lib/utils/errors';
import { z } from 'zod';

const patchSchema = z.object({
  isPublished: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const claims = await requireAuth(req);
    const { id } = await params;
    const body = await req.json();
    const { isPublished } = patchSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { privyId: claims.userId },
      include: { creator: true },
    });
    if (!user?.creator) throw new NotFoundError('Creator profile');

    const content = await prisma.content.findUnique({ where: { id } });
    if (!content) throw new NotFoundError('Content');
    if (content.creatorId !== user.creator.id) throw new ForbiddenError();

    if (isPublished && content.moderationStatus === 'FLAGGED') {
      throw new ForbiddenError('Flagged content cannot be published until reviewed by moderation.');
    }

    const updated = await prisma.content.update({
      where: { id },
      data: { isPublished },
    });

    return Response.json({ id: updated.id, isPublished: updated.isPublished });
  } catch (err) {
    return toApiError(err);
  }
}
