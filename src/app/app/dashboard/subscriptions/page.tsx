'use client';

import { useSubscriptions } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatUsdc } from '@/lib/payments/usdc';

const statusVariants: Record<string, 'success' | 'warning' | 'destructive' | 'outline'> = {
  ACTIVE: 'success',
  PAST_DUE: 'warning',
  CANCELLED: 'destructive',
  EXPIRED: 'outline',
};

export default function SubscriptionsPage() {
  const { data, isLoading } = useSubscriptions();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">My Subscriptions</h1>
        <p className="text-muted-foreground">
          You have no active subscriptions.{' '}
          <Link href="/app/explore" className="text-arc-400 hover:underline">
            Explore creators
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Subscriptions</h1>

      <div className="grid gap-4">
        {data.map((sub) => (
          <Card key={sub.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  <Link
                    href={`/app/creator/${sub.creator.handle}`}
                    className="hover:text-arc-400 transition-colors"
                  >
                    {sub.creator.displayName}
                  </Link>
                </CardTitle>
                <Badge variant={statusVariants[sub.status]}>{sub.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-muted-foreground">
              <p>
                Plan: <span className="text-foreground">{sub.tier.name}</span> ·{' '}
                {formatUsdc(BigInt(sub.tier.priceUsdc))} / {sub.tier.intervalDays}d
              </p>
              <p>
                Renews: {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
