'use client';

import { Loader2, Lock } from 'lucide-react';
import { useCreatorSubscription } from '@/hooks/useSubscription';
import { SubscribeButton } from '@/components/payments/SubscribeButton';
import { Card, CardContent } from '@/components/ui/card';
import type { SubscriptionTierPublic } from '@/types/creator';

interface Props {
  creatorId: string;
  tiers: SubscriptionTierPublic[];
  children: React.ReactNode;
}

export function SubscriptionGate({ creatorId, tiers, children }: Props) {
  const { data: sub, isLoading } = useCreatorSubscription(creatorId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (sub?.status === 'ACTIVE') {
    return <>{children}</>;
  }

  // Show paywall — use cheapest tier (already sorted asc by price)
  const cheapest = tiers[0];

  return (
    <Card className="border-cohora-600/30 bg-cohora-600/5">
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="rounded-full bg-cohora-600/10 p-4">
          <Lock className="h-6 w-6 text-cohora-400" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Subscribe to access this creator&apos;s content</p>
          <p className="text-sm text-muted-foreground">
            Get full access to all published content and exclusive posts.
          </p>
        </div>
        {cheapest && (
          <div className="w-full max-w-xs">
            <SubscribeButton creatorId={creatorId} tier={cheapest} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
