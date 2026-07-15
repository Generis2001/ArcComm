import hre from "hardhat";
const { ethers } = hre;

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEPLOYMENTS_FILE = join(__dirname, '../deployments/arc-testnet.json');
const PLATFORM_FEE_BPS = 500; // 5%

interface Deployments {
  usdc?: string;
  treasuryVault?: string;
  paymentRouter?: string;
  subscriptionManager?: string;
  deployer?: string;
  chainId?: number;
  deployedAt?: string;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log(`Deploying to chain ${network.chainId} as ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);

  const existing: Deployments = existsSync(DEPLOYMENTS_FILE)
    ? JSON.parse(readFileSync(DEPLOYMENTS_FILE, 'utf8'))
    : {};

  // ─── Deploy or reuse USDC mock (testnet only) ─────────────────────────────
  let usdcAddress = existing.usdc;
  if (!usdcAddress) {
    console.log('\nDeploying MockUSDC...');
    const MockUSDC = await ethers.getContractFactory('MockUSDC');
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();
    usdcAddress = await usdc.getAddress();
    console.log(`MockUSDC deployed at: ${usdcAddress}`);
  } else {
    console.log(`Using existing USDC at: ${usdcAddress}`);
  }

  // ─── Deploy TreasuryVault ─────────────────────────────────────────────────
  let vaultAddress = existing.treasuryVault;
  if (!vaultAddress) {
    console.log('\nDeploying TreasuryVault...');
    const TreasuryVault = await ethers.getContractFactory('TreasuryVault');
    const vault = await TreasuryVault.deploy(usdcAddress);
    await vault.waitForDeployment();
    vaultAddress = await vault.getAddress();
    console.log(`TreasuryVault deployed at: ${vaultAddress}`);
  }

  // ─── Deploy ArcPaymentRouter ──────────────────────────────────────────────
  let routerAddress = existing.paymentRouter;
  if (!routerAddress) {
    console.log('\nDeploying ArcPaymentRouter...');
    const ArcPaymentRouter = await ethers.getContractFactory('ArcPaymentRouter');
    const router = await ArcPaymentRouter.deploy(
      usdcAddress,
      vaultAddress,
      deployer.address,   // fee recipient = deployer for testnet
      PLATFORM_FEE_BPS,
    );
    await router.waitForDeployment();
    routerAddress = await router.getAddress();
    console.log(`ArcPaymentRouter deployed at: ${routerAddress}`);

    // Wire vault → router
    const vault = await ethers.getContractAt('TreasuryVault', vaultAddress);
    const tx = await vault.setRouter(routerAddress);
    await tx.wait();
    console.log(`TreasuryVault router set to: ${routerAddress}`);
  }

  // ─── Deploy SubscriptionManager ───────────────────────────────────────────
  let subManagerAddress = existing.subscriptionManager;
  if (!subManagerAddress) {
    console.log('\nDeploying SubscriptionManager...');
    const SubscriptionManager = await ethers.getContractFactory('SubscriptionManager');
    const subManager = await SubscriptionManager.deploy();
    await subManager.waitForDeployment();
    subManagerAddress = await subManager.getAddress();
    console.log(`SubscriptionManager deployed at: ${subManagerAddress}`);

    // Wire sub manager → router
    const tx = await subManager.setRouter(routerAddress);
    await tx.wait();
    console.log(`SubscriptionManager router set to: ${routerAddress}`);
  }

  // ─── Save deployments ─────────────────────────────────────────────────────
  const deployments: Deployments = {
    usdc: usdcAddress,
    treasuryVault: vaultAddress,
    paymentRouter: routerAddress,
    subscriptionManager: subManagerAddress,
    deployer: deployer.address,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
  };

  writeFileSync(DEPLOYMENTS_FILE, JSON.stringify(deployments, null, 2));

  console.log('\n✓ Deployment complete. Add these to your .env.local:');
  console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}`);
  console.log(`NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS=${routerAddress}`);
  console.log(`NEXT_PUBLIC_TREASURY_VAULT_ADDRESS=${vaultAddress}`);
  console.log(`NEXT_PUBLIC_SUBSCRIPTION_MANAGER_ADDRESS=${subManagerAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
