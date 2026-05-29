'use client';

import { useAccount } from 'wagmi';
import { useArcChain } from '@/hooks/useArcChain';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

interface ChainGuardProps {
  children: React.ReactNode;
}

export function ChainGuard({ children }: ChainGuardProps) {
  const { status } = useAccount();
  const { isArcChain, switchToArc, state, error } = useArcChain();

  // Auto-trigger switch as soon as wallet is connected and on wrong chain
  useEffect(() => {
    if (status === 'connected' && !isArcChain && state === 'idle') {
      switchToArc();
    }
  }, [status, isArcChain, state, switchToArc]);

  if (status === 'reconnecting' || status === 'connecting') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isArcChain) return <>{children}</>;

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-sm w-full rounded-2xl border border-border bg-card p-8 text-center space-y-5">
        <div className="flex justify-center">
          <div className="rounded-full bg-amber-500/10 p-4">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Wrong Network</h2>
          <p className="text-sm text-muted-foreground">
            ArcCom runs on Arc Testnet. Switch your wallet to continue.
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
            {error}
          </p>
        )}

        <Button
          variant="arc"
          size="lg"
          className="w-full"
          onClick={switchToArc}
          disabled={state === 'switching'}
        >
          {state === 'switching' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Arc Testnet...
            </>
          ) : state === 'error' ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </>
          ) : (
            'Switch to Arc Testnet'
          )}
        </Button>
      </div>
    </div>
  );
}
