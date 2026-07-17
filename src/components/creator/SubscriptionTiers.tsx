'use client';

import { CheckCircle2 } from 'lucide-react';
import { SubscribeButton } from '@/components/payments/SubscribeButton';
import { formatUsdc } from '@/lib/payments/usdc';
import type { CreatorProfile, SubscriptionTierPublic } from '@/types/creator';

interface SubscriptionTiersProps {
  creator: CreatorProfile;
}

export function SubscriptionTiers({ creator }: SubscriptionTiersProps) {
  const activeTiers = creator.subscriptionTiers.filter((t) => t.isActive);

  if (activeTiers.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Support {creator.displayName}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeTiers.map((tier) => (
          <TierCard key={tier.id} tier={tier} creatorId={creator.id} />
        ))}
      </div>
    </section>
  );
}

function TierCard({ tier, creatorId }: { tier: SubscriptionTierPublic; creatorId: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="space-y-1">
        <h3 className="font-semibold">{tier.name}</h3>
        <p className="text-2xl font-bold">
          {formatUsdc(BigInt(tier.priceUsdc))}
          <span className="text-sm font-normal text-muted-foreground ml-1">
            / {tier.intervalDays}d
          </span>
        </p>
        {tier.description && (
          <p className="text-sm text-muted-foreground">{tier.description}</p>
        )}
      </div>

      {tier.perks.length > 0 && (
        <ul className="space-y-1.5 flex-1">
          {tier.perks.map((perk) => (
            <li key={perk} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-cohora-400 shrink-0 mt-0.5" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>
      )}

      <SubscribeButton creatorId={creatorId} tier={tier} />
    </div>
  );
}
