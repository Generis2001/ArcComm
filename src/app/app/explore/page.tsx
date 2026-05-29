import { prisma } from '@/lib/db/client';
import { CreatorCard } from '@/components/creator/CreatorCard';
import type { CreatorProfile, ContentItem } from '@/types/creator';

const DEFAULT_TIER_PRICE = 500_000n; // 0.5 USDC
const DEFAULT_TIER_INTERVAL = 30;

async function ensureDefaultTier(creatorId: string): Promise<string> {
  const existing = await prisma.subscriptionTier.findFirst({
    where: { creatorId, isActive: true },
    orderBy: { priceUsdc: 'asc' },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.subscriptionTier.create({
    data: {
      creatorId,
      name: 'Supporter',
      description: 'Support this creator',
      priceUsdc: DEFAULT_TIER_PRICE,
      intervalDays: DEFAULT_TIER_INTERVAL,
      isActive: true,
    },
    select: { id: true },
  });
  return created.id;
}

async function getCreators(): Promise<CreatorProfile[]> {
  const creators = await prisma.creator.findMany({
    where: { isActive: true },
    include: {
      user: { select: { avatarUrl: true } },
      subscriptionTiers: { where: { isActive: true }, orderBy: { priceUsdc: 'asc' } },
      content: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { _count: { select: { purchases: true } } },
      },
    },
    orderBy: { totalEarned: 'desc' },
    take: 50,
  });

  return Promise.all(creators.map(async (c) => {
    const defaultTierId = await ensureDefaultTier(c.id);

    const tiers = c.subscriptionTiers.length > 0
      ? c.subscriptionTiers
      : [{ id: defaultTierId, name: 'Supporter', description: 'Support this creator', priceUsdc: DEFAULT_TIER_PRICE, intervalDays: DEFAULT_TIER_INTERVAL, isActive: true, maxSubscribers: null, perks: [] as string[] }];

    return {
      id: c.id,
      handle: c.handle,
      displayName: c.displayName,
      bio: c.bio,
      bannerUrl: c.bannerUrl,
      avatarUrl: c.user.avatarUrl,
      isVerified: c.isVerified,
      totalEarned: c.totalEarned.toString(),
      defaultTierId,
      subscriptionTiers: tiers.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        priceUsdc: t.priceUsdc.toString(),
        intervalDays: t.intervalDays,
        perks: t.perks,
        maxSubscribers: t.maxSubscribers ?? null,
        isActive: t.isActive,
      })),
      content: c.content.map((item): ContentItem => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        mediaUrl: item.mediaUrl ?? null,
        priceUsdc: item.priceUsdc?.toString() ?? null,
        accessType: item.accessType,
        isFree: item.isFree,
        views: item.views,
        salesCount: item._count.purchases,
        createdAt: item.createdAt,
      })),
    };
  }));
}

export default async function ExplorePage() {
  const creators = await getCreators();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Explore</h1>
        <p className="text-muted-foreground mt-1">Discover creators on ArcCom</p>
      </div>

      {creators.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">
          No creators yet. Be the first to publish content!
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      )}
    </div>
  );
}
