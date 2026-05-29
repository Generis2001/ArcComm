# ArcCom Deployment Instructions

## Prerequisites

- Node.js 20+
- A Privy account: https://dashboard.privy.io
- A Neon PostgreSQL database: https://neon.tech
- A Vercel account for hosting
- Arc testnet ETH for gas (faucet at Arc developer portal)

---

## Step 1 — Local Setup

```bash
# Clone and install
cd arccom
npm install

# Copy env
cp .env.example .env.local
```

Fill in `.env.local`:
- `NEXT_PUBLIC_PRIVY_APP_ID` and `PRIVY_APP_SECRET` — from https://dashboard.privy.io
- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXT_PUBLIC_ARC_CHAIN_ID` — actual Arc testnet chain ID
- `NEXT_PUBLIC_ARC_RPC_URL` — actual Arc testnet RPC endpoint
- Generate a random `CRON_SECRET`: `openssl rand -hex 32`
- Generate a `PLATFORM_SIGNER_PRIVATE_KEY` wallet (never use a personal wallet)

---

## Step 2 — Database Setup

```bash
# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

---

## Step 3 — Deploy Smart Contracts

```bash
cd contracts
npm install

# Deploy to Arc testnet
npm run deploy:testnet
```

The script outputs contract addresses. Copy them into `.env.local`:

```
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS=0x...
NEXT_PUBLIC_TREASURY_VAULT_ADDRESS=0x...
NEXT_PUBLIC_SUBSCRIPTION_MANAGER_ADDRESS=0x...
```

---

## Step 4 — Run Locally

```bash
cd ..   # back to arccom root
npm run dev
```

Visit http://localhost:3000

---

## Step 5 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Push environment variables
vercel env add NEXT_PUBLIC_PRIVY_APP_ID
vercel env add PRIVY_APP_SECRET
vercel env add DATABASE_URL
vercel env add PLATFORM_SIGNER_PRIVATE_KEY
vercel env add CRON_SECRET
# ... (repeat for all vars in .env.example)

# Deploy preview
vercel

# Deploy production
vercel --prod
```

---

## Cron Jobs

Vercel runs crons automatically from `vercel.ts`. They call these routes with `Authorization: Bearer $CRON_SECRET`:

| Route | Schedule | Purpose |
|---|---|---|
| `/api/cron/tx-indexer` | Every 2 min | Confirm on-chain payments |
| `/api/cron/settlement` | Every 15 min | Move pending → settled |
| `/api/cron/payout-processor` | Every 5 min | Execute withdrawals |
| `/api/cron/subscriptions` | Daily 2am | Expire past-due subs |

---

## Privy Configuration

In your Privy dashboard:
1. Add your production domain to allowed origins
2. Set redirect URL to `https://yourdomain.com/auth/callback`
3. Enable: Email, Wallet, Google, Twitter login methods
4. Enable embedded wallets

---

## Arc Testnet Configuration

Replace placeholder values in `.env.local` and `src/lib/wagmi/chains.ts` with:
- The actual Arc testnet chain ID
- The actual RPC endpoint URL
- The actual block explorer URL

These values come from the Arc developer documentation or developer portal.
