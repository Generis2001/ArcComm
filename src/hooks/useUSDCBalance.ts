'use client';

import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { type Address } from 'viem';
import { ERC20_ABI, USDC_ADDRESS } from '@/lib/wagmi/contracts';
import { formatUsdc } from '@/lib/payments/usdc';

export function useUSDCBalance() {
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address as Address | undefined;
  const [manualRefetching, setManualRefetching] = useState(false);

  const { data, isLoading, refetch } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: walletAddress ? [walletAddress] : undefined,
    query: {
      enabled: Boolean(walletAddress),
      refetchInterval: 15_000,
    },
  });

  const raw = data ?? 0n;

  async function manualRefetch() {
    setManualRefetching(true);
    try {
      await refetch();
    } finally {
      setManualRefetching(false);
    }
  }

  return {
    raw,
    formatted: formatUsdc(raw),
    isLoading,
    isRefetching: manualRefetching,
    refetch: manualRefetch,
  };
}
