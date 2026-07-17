'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PayModal } from './PayModal';
import { useCreatorSubscription } from '@/hooks/useSubscription';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { SubscriptionTierPublic } from '@/types/creator';

interface SubscribeButtonProps {
  creatorId: string;
  tier: SubscriptionTierPublic;
  size?: 'sm' | 'default';
}

export function SubscribeButton({ creatorId, tier, size = 'default' }: SubscribeButtonProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: subscription, isLoading } = useCreatorSubscription(creatorId);

  const isActive = subscription?.status === 'ACTIVE';

  if (isLoading) {
    return (
      <Button variant="cohora" size={size} disabled className="w-full">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (isActive) {
    return (
      <Button variant="outline" size={size} disabled className="w-full gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        Subscribed
      </Button>
    );
  }

  return (
    <>
      <Button variant="cohora" size={size} className="w-full" onClick={() => setOpen(true)}>
        Subscribe · {formatUsdc(BigInt(tier.priceUsdc))} / {tier.intervalDays}d
      </Button>

      <PayModal
        open={open}
        onOpenChange={setOpen}
        title={`Subscribe to ${tier.name}`}
        description={`${tier.intervalDays}-day access period · ${formatUsdc(BigInt(tier.priceUsdc))}`}
        grossAmountUsdc={BigInt(tier.priceUsdc)}
        payParams={{
          creatorId,
          tierId: tier.id,
          type: 'SUBSCRIPTION_INITIAL',
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['subscription', creatorId] });
          queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        }}
      />
    </>
  );
}

function formatUsdc(units: bigint): string {
  const whole = units / 1_000_000n;
  const fraction = ((units % 1_000_000n) * 100n) / 1_000_000n;
  return `${whole}.${fraction.toString().padStart(2, '0')} USDC`;
}
