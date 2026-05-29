import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { createWalletClient, createPublicClient, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arcTestnet } from '@/lib/wagmi/chains';
import { TREASURY_VAULT_ABI, TREASURY_VAULT_ADDRESS } from '@/lib/wagmi/contracts';

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '');

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
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const requested = await prisma.payout.findMany({
    where: { status: 'REQUESTED' },
    include: {
      creator: { include: { user: { select: { walletAddress: true } } } },
    },
    take: 10,
  });

  let processed = 0;

  for (const payout of requested) {
    try {
      await prisma.payout.update({
        where: { id: payout.id },
        data: { status: 'PROCESSING', processedAt: new Date() },
      });

      const hash = await walletClient.writeContract({
        address: TREASURY_VAULT_ADDRESS,
        abi: TREASURY_VAULT_ABI,
        functionName: 'withdraw',
        args: [
          payout.creator.user.walletAddress as Address,
          payout.toAddress as Address,
          payout.amountUsdc,
        ],
      });

      await publicClient.waitForTransactionReceipt({ hash });

      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          txHash: hash,
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      });

      processed++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[payout-processor] Failed payout ${payout.id}:`, msg);

      await prisma.$transaction(async (tx) => {
        await tx.payout.update({
          where: { id: payout.id },
          data: { status: 'FAILED', failureReason: msg },
        });

        // Refund settled balance
        await tx.creator.update({
          where: { id: payout.creatorId },
          data: { settledBalance: { increment: payout.amountUsdc } },
        });

        await tx.ledgerEntry.create({
          data: {
            payoutId: payout.id,
            type: 'ADJUSTMENT',
            amountUsdc: payout.amountUsdc,
            balanceBefore: 0n,
            balanceAfter: payout.amountUsdc,
            note: `Payout failed: ${msg}`,
          },
        });
      });
    }
  }

  return Response.json({ ok: true, processed });
}
