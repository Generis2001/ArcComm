import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError, ForbiddenError } from '@/lib/utils/errors';
import { requireAuth } from '@/lib/privy/server';
import { z } from 'zod';

const createPostSchema = z.object({
  body: z.string().min(1).max(5000),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(['image', 'file']).optional(),
});

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

    const community = await prisma.community.findUnique({ where: { id }, select: { id: true, creatorId: true } });
    if (!community) throw new NotFoundError('Community');

    const isMember = userId
      ? await prisma.communityMember.findUnique({
          where: { communityId_userId: { communityId: id, userId } },
        }).then(Boolean)
      : false;

    const isCreator = userId
      ? await prisma.creator.findFirst({ where: { id: community.creatorId, userId } }).then(Boolean)
      : false;

    if (!isMember && !isCreator) {
      return Response.json({ posts: [], locked: true });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');

    const posts = await prisma.communityPost.findMany({
      where: { communityId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        creator: { select: { handle: true, displayName: true, user: { select: { avatarUrl: true } } } },
        _count: { select: { likes: true, comments: true } },
        likes: userId ? { where: { userId }, select: { id: true } } : false,
      },
    });

    return Response.json({
      posts: posts.map((p) => ({
        id: p.id,
        body: p.body,
        mediaUrl: p.mediaUrl,
        mediaType: p.mediaType,
        createdAt: p.createdAt,
        creator: p.creator,
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        likedByMe: userId ? (p.likes as { id: string }[]).length > 0 : false,
      })),
      locked: false,
    });
  } catch (err) {
    return toApiError(err);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const claims = await requireAuth(req);
    const user = await prisma.user.findUnique({ where: { privyId: claims.userId }, include: { creator: true } });
    if (!user) throw new ForbiddenError();

    const community = await prisma.community.findUnique({ where: { id }, select: { creatorId: true } });
    if (!community) throw new NotFoundError('Community');
    if (!user.creator || user.creator.id !== community.creatorId) {
      throw new ForbiddenError('Only the community creator can post');
    }

    const body = await req.json();
    const data = createPostSchema.parse(body);

    const post = await prisma.communityPost.create({
      data: {
        communityId: id,
        creatorId: user.creator.id,
        body: data.body,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
      },
      include: {
        creator: { select: { handle: true, displayName: true, user: { select: { avatarUrl: true } } } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return Response.json({
      id: post.id,
      body: post.body,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      createdAt: post.createdAt,
      creator: post.creator,
      likeCount: 0,
      commentCount: 0,
      likedByMe: false,
    }, { status: 201 });
  } catch (err) {
    return toApiError(err);
  }
}
