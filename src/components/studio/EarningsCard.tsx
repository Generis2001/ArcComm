'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Wallet, ArrowDownToLine } from 'lucide-react';
import type { BalanceSummary } from '@/types/payment';

interface EarningsCardProps {
  onWithdraw: () => void;
}

export function EarningsCard({ onWithdraw }: EarningsCardProps) {
  const { getAccessToken } = usePrivy();

  const { data, isLoading } = useQuery({
    queryKey: ['creator-balance'],
    queryFn: async () => {
      const token = await getAccessToken();
      const res = await fetch('/api/creators/me/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load balance');
      return res.json() as Promise<BalanceSummary>;
    },
    refetchInterval: 30_000,
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <BalanceBlock
        icon={Wallet}
        label="Available to Withdraw"
        value={`${data.availableToWithdraw} USDC`}
        sublabel="From completed sales"
        color="text-emerald-400"
      />
      <BalanceBlock
        icon={TrendingUp}
        label="Total Earned"
        value={`${data.totalEarned} USDC`}
        sublabel="All time"
        color="text-cohora-400"
      />

      <Card className="flex flex-col justify-between">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Withdraw</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-bold mb-3">{data.availableToWithdraw} USDC</p>
          <Button
            variant="cohora"
            size="sm"
            className="w-full gap-2"
            onClick={onWithdraw}
            disabled={data.availableToWithdraw === '0.00'}
          >
            <ArrowDownToLine className="h-4 w-4" />
            Withdraw
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function BalanceBlock({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sublabel: string;
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
      </CardContent>
    </Card>
  );
}
