import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError, ForbiddenError } from '@/lib/utils/errors';
import { requireAuth } from '@/lib/privy/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> },
) {
  try {
    const { id, postId } = await params;
    const claims = await requireAuth(req);
    const user = await prisma.user.findUnique({ where: { privyId: claims.userId }, select: { id: true } });
    if (!user) throw new ForbiddenError();

    const community = await prisma.community.findUnique({ where: { id }, select: { creatorId: true } });
    if (!community) throw new NotFoundError('Community');

    const isMember = await prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: id, userId: user.id } },
    });
    const isCreator = await prisma.creator.findFirst({ where: { id: community.creatorId, userId: user.id } });
    if (!isMember && !isCreator) throw new ForbiddenError('Must be a member to like posts');

    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundError('Post');

    const existing = await prisma.communityPostLike.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
    });

    if (existing) {
      await prisma.communityPostLike.delete({ where: { id: existing.id } });
      return Response.json({ liked: false });
    } else {
      await prisma.communityPostLike.create({ data: { postId, userId: user.id } });
      return Response.json({ liked: true });
    }
  } catch (err) {
    return toApiError(err);
  }
}
