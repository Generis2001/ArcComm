import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError } from '@/lib/utils/errors';

export async function PATCH(req: NextRequest) {
  try {
    const claims = await requireAuth(req);
    const privyId = claims.userId;

    const user = await prisma.user.findUnique({
      where: { privyId },
      select: { id: true, creator: { select: { id: true } } },
    });

    if (!user?.creator) {
      return Response.json({ error: 'Creator profile not found' }, { status: 404 });
    }

    const { displayName, bio, bannerUrl } = await req.json();

    // bannerUrl-only update (from image upload) doesn't require displayName
    if (bannerUrl !== undefined && displayName === undefined) {
      const updated = await prisma.creator.update({
        where: { id: user.creator.id },
        data: { bannerUrl: typeof bannerUrl === 'string' ? bannerUrl : null },
        select: { id: true, bannerUrl: true },
      });
      return Response.json(updated);
    }

    if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
      return Response.json({ error: 'Display name is required' }, { status: 400 });
    }

    const updated = await prisma.creator.update({
      where: { id: user.creator.id },
      data: {
        displayName: displayName.trim().slice(0, 80),
        bio: typeof bio === 'string' ? bio.trim().slice(0, 500) || null : null,
        ...(typeof bannerUrl === 'string' ? { bannerUrl } : {}),
      },
      select: { id: true, handle: true, displayName: true, bio: true, bannerUrl: true },
    });

    return Response.json(updated);
  } catch (err) {
    return toApiError(err);
  }
}
