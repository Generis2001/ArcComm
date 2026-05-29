'use client';

import { useChainId, useSwitchChain } from 'wagmi';
import { useWallets } from '@privy-io/react-auth';
import { useCallback, useState } from 'react';
import { arcTestnet, arcTestnetAddParams } from '@/lib/wagmi/chains';

type SwitchState = 'idle' | 'switching' | 'error';

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
      // Chain not registered in wallet — add it first via EIP-3085
      const code = (switchError as { code?: number })?.code;
      if (code === 4902) {
        try {
          const wallet = wallets[0];
          if (!wallet) throw new Error('No wallet connected');
          const provider = await wallet.getEthereumProvider();
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [arcTestnetAddParams],
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
