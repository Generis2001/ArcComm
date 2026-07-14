import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/client';
import { SubscriptionTiers } from '@/components/creator/SubscriptionTiers';
import { PremiumContentSection } from '@/components/creator/PremiumContentSection';
import { BuyButton } from '@/components/payments/BuyButton';
import { BadgeCheck, FileText, ShoppingBag, TrendingUp, Download, Music, Film, Image as ImageIcon } from 'lucide-react';
import { formatUsdc } from '@/lib/payments/usdc';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CreatorProfile, ContentItem, ProductItem } from '@/types/creator';

interface PageProps {
  params: Promise<{ handle: string }>;
}

function computeNetValue(totalEarned: bigint, totalViews: number): bigint {
  const score = 1 + Math.log1p(totalViews) / 10;
  return BigInt(Math.floor(Number(totalEarned) * score));
}

async function getCreator(handle: string): Promise<(CreatorProfile & { content: ContentItem[]; products: ProductItem[] }) | null> {
  const creator = await prisma.creator.findUnique({
    where: { handle },
    include: {
      user: { select: { avatarUrl: true } },
      subscriptionTiers: {
        where: { isActive: true },
        orderBy: { priceUsdc: 'asc' },
      },
      content: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { _count: { select: { purchases: true } } },
      },
      products: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!creator || !creator.isActive) return null;

  const contentItems: ContentItem[] = creator.content.map((c) => ({
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
  }));

  const productItems: ProductItem[] = creator.products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    priceUsdc: p.priceUsdc.toString(),
    imageUrl: p.imageUrl,
    productType: p.productType,
    totalSold: p.totalSold,
    createdAt: p.createdAt,
  }));

  return {
    id: creator.id,
    handle: creator.handle,
    displayName: creator.displayName,
    bio: creator.bio,
    bannerUrl: creator.bannerUrl,
    avatarUrl: creator.user.avatarUrl,
    isVerified: creator.isVerified,
    totalEarned: creator.totalEarned.toString(),
    subscriptionTiers: creator.subscriptionTiers.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      priceUsdc: t.priceUsdc.toString(),
      intervalDays: t.intervalDays,
      perks: t.perks,
      maxSubscribers: t.maxSubscribers,
      isActive: t.isActive,
    })),
    content: contentItems,
    products: productItems,
  };
}

export default async function CreatorProfilePage({ params }: PageProps) {
  const { handle } = await params;
  const creator = await getCreator(handle);

  if (!creator) notFound();

  const totalViews = creator.content.reduce((sum, c) => sum + c.views, 0);
  const netValue = computeNetValue(BigInt(creator.totalEarned), totalViews);

  const premiumContent = creator.content.filter((c) => !c.isFree && c.accessType === 'SUBSCRIPTION');
  const purchasableContent = creator.content.filter(
    (c) => !c.isFree && c.accessType !== 'SUBSCRIPTION' && c.priceUsdc,
  );
  const freeContent = creator.content.filter((c) => c.isFree);

  return (
    <div className="space-y-8">
      {/* Banner */}
      {creator.bannerUrl ? (
        <div
          className="h-48 w-full rounded-xl bg-cover bg-center"
          style={{ backgroundImage: `url(${creator.bannerUrl})` }}
        />
      ) : (
        <div className="h-48 w-full rounded-xl bg-gradient-to-br from-arc-800 to-arc-950" />
      )}

      {/* Profile header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{creator.displayName}</h1>
            {creator.isVerified && <BadgeCheck className="h-5 w-5 text-arc-400" />}
          </div>
          <p className="text-sm text-muted-foreground">@{creator.handle}</p>
          {creator.bio && <p className="text-muted-foreground max-w-2xl">{creator.bio}</p>}
        </div>
        {netValue > 0n && (
          <div className="flex items-center gap-1.5 rounded-lg border border-arc-600/30 bg-arc-600/5 px-3 py-2 text-sm shrink-0">
            <TrendingUp className="h-4 w-4 text-arc-400" />
            <span className="text-muted-foreground">Creator Value</span>
            <span className="font-semibold text-foreground">{formatUsdc(netValue)}</span>
          </div>
        )}
      </div>

      {/* Subscription tiers */}
      <SubscriptionTiers creator={creator} />

      {/* Purchasable content */}
      {purchasableContent.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Content</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {purchasableContent.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">{item.type}</Badge>
                  </div>
                  <MediaPreview item={item} />
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">{item.salesCount} {item.salesCount === 1 ? 'sale' : 'sales'}</p>
                    <BuyButton
                      creatorId={creator.id}
                      contentId={item.id}
                      priceUsdc={BigInt(item.priceUsdc!)}
                      label={item.title}
                      type="CONTENT_PURCHASE"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Free content */}
      {freeContent.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Free Content</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {freeContent.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">{item.title}</p>
                    <Badge variant="secondary" className="text-xs">Free</Badge>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                  <MediaPreview item={item} />
                  <p className="text-xs text-muted-foreground">{item.views} views</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {premiumContent.length > 0 && (
        <PremiumContentSection
          creatorId={creator.id}
          creatorHandle={creator.handle}
          content={premiumContent}
          tiers={creator.subscriptionTiers}
        />
      )}

      {/* Products */}
      {creator.products.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Digital Store</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {creator.products.map((product) => (
              <Card key={product.id}>
                {product.imageUrl && (
                  <div
                    className="h-32 w-full rounded-t-lg bg-cover bg-center"
                    style={{ backgroundImage: `url(${product.imageUrl})` }}
                  />
                )}
                <CardContent className="p-4 space-y-2">
                  <div className="space-y-0.5">
                    <p className="font-medium">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">{product.totalSold} sold</p>
                    <BuyButton
                      creatorId={creator.id}
                      productId={product.id}
                      priceUsdc={BigInt(product.priceUsdc)}
                      label={product.name}
                      type="PRODUCT_PURCHASE"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;
  const creator = await getCreator(handle);
  return {
    title: creator ? `${creator.displayName} — ArcComm` : 'Creator not found',
  };
}

function MediaPreview({ item }: { item: ContentItem }) {
  if (!item.mediaUrl) return null;
  if (item.type === 'VIDEO') {
    return (
      <video
        src={item.mediaUrl}
        controls
        className="w-full rounded-lg max-h-64 bg-black"
        preload="metadata"
      />
    );
  }
  if (item.type === 'AUDIO') {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
        <Music className="h-4 w-4 text-arc-400 shrink-0" />
        <audio src={item.mediaUrl} controls className="w-full h-8" preload="metadata" />
      </div>
    );
  }
  if (item.type === 'IMAGE_GALLERY') {
    return (
      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
      </div>
    );
  }
  if (item.type === 'FILE') {
    return (
      <a
        href={item.mediaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-arc-400 hover:underline"
      >
        <Download className="h-4 w-4" />
        Download file
      </a>
    );
  }
  return null;
}
