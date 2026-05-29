'use client';

import { useState } from 'react';
import { EarningsCard } from '@/components/studio/EarningsCard';
import { WithdrawModal } from '@/components/studio/WithdrawModal';
import { useQuery } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import type { BalanceSummary } from '@/types/payment';

export default function EarningsPage() {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const { getAccessToken, user } = usePrivy();

  const { data: balance } = useQuery({
    queryKey: ['creator-balance'],
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch('/api/creators/me/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load balance');
      return res.json() as Promise<BalanceSummary>;
    },
  });

  return (
    <div className="space-y-6">
      <EarningsCard onWithdraw={() => setWithdrawOpen(true)} />

      <WithdrawModal
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        maxAmount={balance?.availableToWithdraw ?? '0.00'}
        defaultAddress={user?.wallet?.address ?? ''}
      />
    </div>
  );
}
