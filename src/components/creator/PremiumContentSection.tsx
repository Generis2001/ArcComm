'use client';

import { useQuery } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { Lock, Music, Sparkles } from 'lucide-react';
import { SubscribeButton } from '@/components/payments/SubscribeButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { ContentItem, SubscriptionTierPublic } from '@/types/creator';

interface PremiumContentSectionProps {
  creatorId: string;
  creatorHandle: string;
  content: ContentItem[];
  tiers: SubscriptionTierPublic[];
}

interface PremiumAccess {
  completedPeriods: number;
  requiredPeriods: number;
  hasActiveSubscription: boolean;
  isEligible: boolean;
}

export function PremiumContentSection({
  creatorId,
  creatorHandle,
  content,
  tiers,
}: PremiumContentSectionProps) {
  const { getAccessToken, authenticated, ready } = usePrivy();
  const { data: access, isLoading } = useQuery({
    queryKey: ['premium-access', creatorId],
    enabled: ready && authenticated,
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch(`/api/creators/${creatorHandle}/premium-access`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to check premium access');
      return res.json() as Promise<PremiumAccess>;
    },
  });

  const isEligible = access?.isEligible ?? false;
  const completedPeriods = access?.completedPeriods ?? 0;
  const requiredPeriods = access?.requiredPeriods ?? 3;
  const cheapestTier = tiers[0];

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-300" />
        <h2 className="text-lg font-semibold">Premium</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {content.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-0.5">
                  <p className="truncate font-medium">{item.title}</p>
                  {item.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>
                <Badge className="shrink-0 bg-amber-400/15 text-amber-300 hover:bg-amber-400/15">Premium</Badge>
              </div>

              {isEligible ? (
                <PremiumMediaPreview item={item} />
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-amber-400/25 bg-amber-400/[0.04] text-center">
                  <div className="space-y-2 px-5">
                    <Lock className="mx-auto h-5 w-5 text-amber-300" />
                    <p className="text-xs text-muted-foreground">Unlock after three paid 30-day access periods.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!isEligible && (
        <Card className="border-amber-400/20 bg-amber-400/[0.04]">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isLoading ? 'Checking premium access...' : `${completedPeriods} of ${requiredPeriods} paid 30-day periods`}
              </p>
              <p className="text-sm text-muted-foreground">
                {access?.hasActiveSubscription
                  ? 'Keep your subscription active until you reach the three-period requirement.'
                  : 'Start or renew a 30-day subscription to continue toward premium access.'}
              </p>
            </div>
            {!access?.hasActiveSubscription && cheapestTier && (
              <div className="w-full shrink-0 sm:w-52">
                <SubscribeButton creatorId={creatorId} tier={cheapestTier} size="sm" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function PremiumMediaPreview({ item }: { item: ContentItem }) {
  if (!item.mediaUrl) return null;
  if (item.type === 'VIDEO') {
    return <video src={item.mediaUrl} controls className="max-h-64 w-full rounded-lg bg-black" preload="metadata" />;
  }
  if (item.type === 'AUDIO') {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
        <Music className="h-4 w-4 shrink-0 text-amber-300" />
        <audio src={item.mediaUrl} controls className="h-8 w-full" preload="metadata" />
      </div>
    );
  }
  if (item.type === 'IMAGE_GALLERY') {
    return (
      <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.mediaUrl} alt={item.title} className="h-full w-full object-cover" />
      </div>
    );
  }
  if (item.type === 'FILE') {
    return <p className="text-sm text-muted-foreground">Premium file ready to open.</p>;
  }
  return null;
}
