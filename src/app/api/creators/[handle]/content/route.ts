import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { toApiError } from '@/lib/utils/errors';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> },
) {
  try {
    const { handle } = await params;

    const creator = await prisma.creator.findUnique({
      where: { handle },
      select: { id: true, isActive: true },
    });

    if (!creator || !creator.isActive) {
      return Response.json({ error: 'Creator not found' }, { status: 404 });
    }

    const content = await prisma.content.findMany({
      where: {
        creatorId: creator.id,
        isPublished: true,
        moderationStatus: 'APPROVED',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { _count: { select: { purchases: true } } },
    });

    return Response.json(
      content.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        type: c.type,
        mediaUrl: c.mediaUrl,
        priceUsdc: c.priceUsdc?.toString() ?? null,
        accessType: c.accessType,
        isFree: c.isFree,
        views: c.views,
        salesCount: c._count.purchases,
        createdAt: c.createdAt,
      })),
    );
  } catch (err) {
    return toApiError(err);
  }
}
