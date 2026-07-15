import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.PRIVATE_KEY) {
  throw new Error("Missing PRIVATE_KEY");
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },

  networks: {
    hardhat: {},
    "arc-testnet": {
      url: process.env.ARC_RPC_URL!,
      chainId: Number(process.env.ARC_CHAIN_ID),
      accounts: [process.env.PRIVATE_KEY],
    },
  },

  paths: {
    sources: "./src",
    tests: "./test",
    artifacts: "./artifacts",
  },
};

export default config;
