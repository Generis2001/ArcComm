import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env.local' });

const DEPLOYER_KEY = process.env.PLATFORM_SIGNER_PRIVATE_KEY ?? '0x' + '0'.repeat(64);
const ARC_RPC = process.env.PLATFORM_RPC_URL ?? 'https://rpc.arc-testnet.io';
const ARC_CHAIN_ID = Number(process.env.NEXT_PUBLIC_ARC_CHAIN_ID ?? 1313161558);

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {},
    'arc-testnet': {
      url: ARC_RPC,
      chainId: ARC_CHAIN_ID,
      accounts: [DEPLOYER_KEY],
    },
  },
  paths: {
    sources: './src',
    tests: './test',
    artifacts: './artifacts',
  },
};

export default config;
