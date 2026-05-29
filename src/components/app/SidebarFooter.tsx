'use client';

import { usePrivy } from '@privy-io/react-auth';
import { USDCBalance } from '@/components/payments/USDCBalance';
import { Button } from '@/components/ui/button';
import { LogOut, Wallet } from 'lucide-react';

export function SidebarFooter() {
  const { user, logout, connectWallet } = usePrivy();
  const walletAddress = user?.wallet?.address;

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : null;

  return (
    <div className="border-t border-border pt-4 space-y-3">
      {/* USDC balance */}
      <div className="px-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Balance</span>
        <USDCBalance showRefresh />
      </div>

      {/* Wallet address + connect/disconnect */}
      <div className="px-2 space-y-2">
        {walletAddress ? (
          <>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Wallet className="h-3 w-3 shrink-0" />
              <span className="font-mono truncate">{shortAddress}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-2 h-8"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 h-3 w-3" />
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            variant="arc"
            size="sm"
            className="w-full text-xs h-8"
            onClick={() => connectWallet()}
          >
            <Wallet className="mr-2 h-3 w-3" />
            Connect Wallet
          </Button>
        )}
      </div>
    </div>
  );
}
