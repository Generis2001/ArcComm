import { arcTestnet } from '@/lib/wagmi/config';

export { arcTestnet };

export const arcTestnetAddParams = {
  chainId: `0x${arcTestnet.id.toString(16)}`,
  chainName: arcTestnet.name,
  nativeCurrency: arcTestnet.nativeCurrency,
  rpcUrls: arcTestnet.rpcUrls.default.http,
  blockExplorerUrls: arcTestnet.blockExplorers?.default?.url
    ? [arcTestnet.blockExplorers.default.url]
    : [],
} as const;
