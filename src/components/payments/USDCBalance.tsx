'use client';

import { useUSDCBalance } from '@/hooks/useUSDCBalance';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface USDCBalanceProps {
  className?: string;
  showRefresh?: boolean;
}

export function USDCBalance({ className, showRefresh }: USDCBalanceProps) {
  const { formatted, isLoading, isRefetching, refetch } = useUSDCBalance();

  return (
    <div className={cn('flex items-center gap-1.5 text-sm font-medium', className)}>
      <span className="text-foreground">{formatted}</span>
      {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      {showRefresh && (
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          aria-label="Refresh balance"
        >
          <RefreshCw className={cn('h-3 w-3', isRefetching && 'animate-spin')} />
        </button>
      )}
    </div>
  );
}
