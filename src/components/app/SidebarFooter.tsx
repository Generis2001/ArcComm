'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useDisconnect } from 'wagmi';
import { Check, Copy, Loader2, LogOut, Wallet } from 'lucide-react';
import { USDCBalance } from '@/components/payments/USDCBalance';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export function SidebarFooter({ compact = false }: { compact?: boolean }) {
  const { user, logout, connectWallet } = usePrivy();
  const { disconnectAsync } = useDisconnect();
  const router = useRouter();
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const walletAddress = user?.wallet?.address;

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : null;

  const handleDisconnect = async () => {
    if (isDisconnecting) return;
    setIsDisconnecting(true);

    try {
      await disconnectAsync().catch(() => undefined);
      await logout();
    } finally {
      router.replace('/');
      router.refresh();
      window.setTimeout(() => {
        window.location.assign('/');
      }, 120);
    }
  };

  const copyWalletAddress = async () => {
    if (!walletAddress) return;

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={cn('space-y-3 rounded-[1.35rem] border border-white/[0.10] bg-white/[0.03] p-4', compact && 'p-3')}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/[0.38]">Balance</p>
          <div className="mt-1 text-sm text-white/[0.78]">
            <USDCBalance showRefresh />
          </div>
        </div>
        {shortAddress && (
          <button
            type="button"
            onClick={copyWalletAddress}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.10] px-3 py-1 font-mono text-[11px] text-white/[0.58] transition-colors hover:border-white/[0.20] hover:bg-white/[0.06] hover:text-white"
            title="Copy wallet address"
            aria-label={copied ? 'Wallet address copied' : 'Copy wallet address'}
          >
            {shortAddress}
            {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {walletAddress ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between border-white/[0.10] bg-black/[0.45] text-white/[0.72] hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-white"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
          >
            <span className="inline-flex items-center gap-2">
              {isDisconnecting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              {isDisconnecting ? 'Disconnecting' : 'Disconnect wallet'}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-white/[0.34]">Arc</span>
          </Button>
        ) : (
          <Button
            variant="arc"
            size="sm"
            className="w-full justify-between"
            onClick={() => connectWallet()}
          >
            <span className="inline-flex items-center gap-2">
              <Wallet className="h-3.5 w-3.5" />
              Connect wallet
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-black/[0.50]">USDC</span>
          </Button>
        )}
      </div>
    </div>
  );
}
