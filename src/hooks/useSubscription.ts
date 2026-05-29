'use client';

import { useQuery } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import type { SubscriptionWithTier } from '@/types/subscription';

export function useSubscriptions() {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery({
    queryKey: ['subscriptions'],
    enabled: authenticated,
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch('/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      return res.json() as Promise<SubscriptionWithTier[]>;
    },
    staleTime: 30_000,
  });
}

export function useCreatorSubscription(creatorId: string) {
  const { getAccessToken, authenticated } = usePrivy();

  return useQuery({
    queryKey: ['subscription', creatorId],
    enabled: authenticated && Boolean(creatorId),
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch(`/api/subscriptions?creatorId=${creatorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch subscription');
      const data = await res.json() as SubscriptionWithTier[];
      return data[0] ?? null;
    },
    staleTime: 30_000,
  });
}
