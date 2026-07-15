'use client';

import { useSubscriptions } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { formatUsdc } from '@/lib/payments/usdc';

const statusVariants: Record<string, 'success' | 'warning' | 'destructive' | 'outline'> = {
  ACTIVE: 'success',
  PAST_DUE: 'warning',
  CANCELLED: 'destructive',
  EXPIRED: 'destructive',
};

const statusLabel: Record<string, string> = {
  ACTIVE: 'Active',
  PAST_DUE: 'Grace period',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
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

  const active = data?.filter((s) => s.status === 'ACTIVE') ?? [];
  const pastDue = data?.filter((s) => s.status === 'PAST_DUE') ?? [];
  const expired = data?.filter((s) => s.status === 'EXPIRED') ?? [];
  const hasAny = (data?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* ── Header watermark panel ── */}
      <section
        className="arc-panel arc-watermark p-6 md:p-8"
        data-watermark="SUBS"
      >
        <div className="relative z-10 space-y-2">
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-white/[0.40]">Subscriptions</p>
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-white">
            Your creator access periods.
          </h1>
          {!hasAny ? (
            <p className="text-sm text-white/[0.56]">
              You have no active subscriptions.{' '}
              <Link href="/app/explore" className="text-white underline-offset-4 hover:underline">
                Explore creators
              </Link>
            </p>
          ) : (
            <p className="text-sm text-white/[0.56]">
              Review the subscriptions that currently unlock content and community access.
            </p>
          )}
        </div>
      </section>

      {/* ── Expired notice banner ── */}
      {expired.length > 0 && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/[0.07] px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">
                {expired.length === 1
                  ? '1 subscription has expired'
                  : `${expired.length} subscriptions have expired`}
              </p>
              <p className="text-xs leading-5 text-white/[0.54]">
                Your access to these creators has ended. Resubscribe to restore content and community access.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Grace-period notice ── */}
      {pastDue.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-5 py-4">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-400">
                {pastDue.length === 1
                  ? '1 subscription is in its grace period'
                  : `${pastDue.length} subscriptions are in their grace period`}
              </p>
              <p className="text-xs leading-5 text-white/[0.54]">
                These subscriptions have lapsed but are still within the 48-hour grace window. Resubscribe now to avoid losing access.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Subscription cards ── */}
      {hasAny && (
        <div className="grid gap-4">
          {/* Active first, then past-due, then expired */}
          {[...active, ...pastDue, ...expired].map((sub) => {
            const isExpired = sub.status === 'EXPIRED';
            const isPastDue = sub.status === 'PAST_DUE';
            const endDate = new Date(sub.currentPeriodEnd);
            const now = new Date();
            const daysAgo = Math.floor((now.getTime() - endDate.getTime()) / 86_400_000);

            return (
              <Card
                key={sub.id}
                className={
                  isExpired
                    ? 'border-destructive/30 bg-destructive/[0.04] opacity-80'
                    : isPastDue
                    ? 'border-amber-500/30 bg-amber-500/[0.04]'
                    : undefined
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-base">
                      <Link
                        href={`/app/creator/${sub.creator.handle}`}
                        className="transition-colors hover:text-arc-400"
                      >
                        {sub.creator.displayName}
                      </Link>
                    </CardTitle>
                    <Badge variant={statusVariants[sub.status]}>
                      {statusLabel[sub.status]}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      Plan:{' '}
                      <span className="text-foreground">{sub.tier.name}</span> ·{' '}
                      {formatUsdc(BigInt(sub.tier.priceUsdc))} / {sub.tier.intervalDays}d
                    </p>
                    <p>
                      {isExpired ? (
                        <span className="text-destructive">
                          Expired{' '}
                          {daysAgo === 0
                            ? 'today'
                            : daysAgo === 1
                            ? 'yesterday'
                            : `${daysAgo} days ago`}{' '}
                          ({endDate.toLocaleDateString()})
                        </span>
                      ) : isPastDue ? (
                        <span className="text-amber-400">
                          Grace period ends: {endDate.toLocaleDateString()}
                        </span>
                      ) : (
                        <>Access ends: {endDate.toLocaleDateString()}</>
                      )}
                    </p>
                  </div>

                  {/* Resubscribe CTA for expired / past-due */}
                  {(isExpired || isPastDue) && (
                    <Button
                      asChild
                      size="sm"
                      variant={isExpired ? 'destructive' : 'outline'}
                      className="gap-2"
                    >
                      <Link href={`/app/creator/${sub.creator.handle}`}>
                        <RefreshCw className="h-3.5 w-3.5" />
                        Resubscribe
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
