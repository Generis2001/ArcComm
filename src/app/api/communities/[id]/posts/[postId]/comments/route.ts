import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError, ForbiddenError } from '@/lib/utils/errors';
import { requireAuth } from '@/lib/privy/server';
import { z } from 'zod';

const commentSchema = z.object({ body: z.string().min(1).max(2000) });

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; postId: string }> },
) {
  try {
    const { postId } = await params;
    const comments = await prisma.communityPostComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { username: true, avatarUrl: true } } },
    });
    return Response.json(comments);
  } catch (err) {
    return toApiError(err);
  }
}

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
    if (!isMember && !isCreator) throw new ForbiddenError('Must be a member to comment');

    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundError('Post');

    const body = await req.json();
    const { body: text } = commentSchema.parse(body);

    const comment = await prisma.communityPostComment.create({
      data: { postId, authorId: user.id, body: text },
      include: { author: { select: { username: true, avatarUrl: true } } },
    });

    return Response.json(comment, { status: 201 });
  } catch (err) {
    return toApiError(err);
  }
}
