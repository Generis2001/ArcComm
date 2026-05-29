import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { createWalletClient, createPublicClient, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arcTestnet } from '@/lib/wagmi/chains';
import { TREASURY_VAULT_ABI, TREASURY_VAULT_ADDRESS } from '@/lib/wagmi/contracts';

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret');
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const communities = await prisma.community.findMany({
    where: {
      isActive: true,
      communityPool: { gt: 0n },
      OR: [
        { lastDistributedAt: null },
        { lastDistributedAt: { lte: sevenDaysAgo } },
      ],
    },
    include: {
      creator: { select: { id: true, user: { select: { walletAddress: true } } } },
      members: { include: { user: { select: { walletAddress: true } } } },
    },
  });

  const account = privateKeyToAccount(process.env.PLATFORM_SIGNER_PRIVATE_KEY as `0x${string}`);
  const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http(process.env.PLATFORM_RPC_URL),
  });
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(process.env.PLATFORM_RPC_URL),
  });

  const results: { communityId: string; status: string; error?: string }[] = [];

  for (const community of communities) {
    try {
      const pool = community.communityPool;
      const memberCount = community.members.length;
      const creatorWallet = community.creator.user.walletAddress as Address;

      const creatorShare = (pool * BigInt(community.revenueSplitPct)) / 100n;
      const memberPool = pool - creatorShare;
      const memberShare = memberCount > 0 ? memberPool / BigInt(memberCount) : 0n;

      const txHashes: string[] = [];

      // Distribute creator share
      if (creatorShare > 0n) {
        const hash = await walletClient.writeContract({
          address: TREASURY_VAULT_ADDRESS,
          abi: TREASURY_VAULT_ABI,
          functionName: 'withdraw',
          args: [creatorWallet, creatorWallet, creatorShare],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        txHashes.push(hash);
      }

      // Distribute member shares
      if (memberShare > 0n) {
        for (const member of community.members) {
          const memberWallet = member.user.walletAddress as Address;
          const hash = await walletClient.writeContract({
            address: TREASURY_VAULT_ADDRESS,
            abi: TREASURY_VAULT_ABI,
            functionName: 'withdraw',
            args: [creatorWallet, memberWallet, memberShare],
          });
          await publicClient.waitForTransactionReceipt({ hash });
          txHashes.push(hash);
        }
      }

      await prisma.$transaction([
        prisma.community.update({
          where: { id: community.id },
          data: { communityPool: 0n, lastDistributedAt: new Date() },
        }),
        prisma.creator.update({
          where: { id: community.creator.id },
          data: { settledBalance: { decrement: pool } },
        }),
        prisma.communityDistribution.create({
          data: {
            communityId: community.id,
            totalAmount: pool,
            creatorShare,
            memberShare,
            memberCount,
            txHashes,
          },
        }),
      ]);

      results.push({ communityId: community.id, status: 'distributed' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      results.push({ communityId: community.id, status: 'failed', error: msg });
    }
  }

  return Response.json({ processed: results.length, results });
}
