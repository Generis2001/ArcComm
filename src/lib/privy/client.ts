import { type PrivyClientConfig } from '@privy-io/react-auth';
import { arcTestnet } from '@/lib/wagmi/config';

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: 'dark',
    accentColor: '#6370f5',
    logo: '/assets/logo.svg',
  },
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
  },
  loginMethods: ['email', 'wallet'],
  defaultChain: arcTestnet,
  supportedChains: [arcTestnet],
};
