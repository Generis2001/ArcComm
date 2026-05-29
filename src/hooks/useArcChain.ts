'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { useWallets } from '@privy-io/react-auth';
import { useCallback, useState } from 'react';
import { arcTestnet, arcTestnetAddParams } from '@/lib/wagmi/chains';

type SwitchState = 'idle' | 'switching' | 'error';

// MetaMask rejects wallet_addEthereumChain when nativeCurrency.decimals !== 18.
// Arc Testnet uses USDC (6 decimals) as native, so we send decimals=18 to satisfy
// MetaMask's validation — the value is cosmetic in MetaMask's UI only.
const arcTestnetAddParamsMetaMask = {
  ...arcTestnetAddParams,
  nativeCurrency: { ...arcTestnetAddParams.nativeCurrency, decimals: 18 },
};

function isMetaMask(provider: { isMetaMask?: boolean }): boolean {
  return !!provider?.isMetaMask;
}

export function useArcChain() {
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { wallets } = useWallets();
  const [state, setState] = useState<SwitchState>('idle');
  const [error, setError] = useState<string | null>(null);

  const isArcChain = chainId === arcTestnet.id;

  const switchToArc = useCallback(async () => {
    setState('switching');
    setError(null);

    try {
      await switchChainAsync({ chainId: arcTestnet.id });
      setState('idle');
    } catch (switchError: unknown) {
      const code = (switchError as { code?: number })?.code;
      if (code === 4902) {
        try {
          const wallet = wallets[0];
          if (!wallet) throw new Error('No wallet connected');
          const provider = await wallet.getEthereumProvider();
          // Use MetaMask-compatible params (decimals=18) when talking to MetaMask
          const addParams = isMetaMask(provider as { isMetaMask?: boolean })
            ? arcTestnetAddParamsMetaMask
            : arcTestnetAddParams;
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [addParams],
          });
          await switchChainAsync({ chainId: arcTestnet.id });
          setState('idle');
        } catch (addError: unknown) {
          const msg = addError instanceof Error ? addError.message : 'Failed to add Arc network';
          setError(msg);
          setState('error');
        }
      } else if (code === 4001) {
        setError('Switch rejected. You must be on Arc Testnet to continue.');
        setState('error');
      } else {
        const msg = switchError instanceof Error ? switchError.message : 'Failed to switch network';
        setError(msg);
        setState('error');
      }
    }
  }, [switchChainAsync, wallets]);

  return { isArcChain, switchToArc, state, error };
}
