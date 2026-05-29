import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/privy/server';
import { prisma } from '@/lib/db/client';
import { toApiError, NotFoundError, PaymentError } from '@/lib/utils/errors';
import { initiatePayoutLedger } from '@/lib/payments/ledger';
import { usdcToUnits } from '@/lib/payments/usdc';
import { isValidAddress } from '@/lib/utils/address';
import { z } from 'zod';
import { createWalletClient, createPublicClient, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arcTestnet } from '@/lib/wagmi/chains';
import { TREASURY_VAULT_ABI, TREASURY_VAULT_ADDRESS } from '@/lib/wagmi/contracts';

const payoutSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,6})?$/),
  toAddress: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const claims = await requireAuth(req);
    const body = await req.json();
    const { amount, toAddress } = payoutSchema.parse(body);

    if (!isValidAddress(toAddress)) throw new PaymentError('Invalid destination address');

    const user = await prisma.user.findUnique({
      where: { privyId: claims.userId },
      include: { creator: true },
    });

    if (!user?.creator) throw new NotFoundError('Creator profile');

    const amountUnits = usdcToUnits(amount);
    if (amountUnits <= 0n) throw new PaymentError('Amount must be greater than zero');

    // Clear stuck PROCESSING payouts older than 2 minutes before checking
    await prisma.payout.updateMany({
      where: {
        creatorId: user.creator.id,
        status: 'PROCESSING',
        processedAt: { lt: new Date(Date.now() - 2 * 60 * 1000) },
      },
      data: { status: 'FAILED', failureReason: 'Timed out' },
    });

    // Check for existing in-flight payout
    const inflight = await prisma.payout.findFirst({
      where: { creatorId: user.creator.id, status: 'PROCESSING' },
    });
    if (inflight) throw new PaymentError('A payout is already in progress');

    let payoutId: string;

    // Create payout record and deduct from settled balance
    await prisma.$transaction(async (tx) => {
      const payout = await tx.payout.create({
        data: {
          creatorId: user.creator!.id,
          amountUsdc: amountUnits,
          toAddress,
          status: 'PROCESSING',
          processedAt: new Date(),
        },
      });

      payoutId = payout.id;

      await initiatePayoutLedger(tx, {
        creatorId: user.creator!.id,
        payoutId: payout.id,
        amountUsdc: amountUnits,
      });
    });

    // Process withdrawal immediately on-chain (Arc has sub-second finality)
    try {
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

      const hash = await walletClient.writeContract({
        address: TREASURY_VAULT_ADDRESS,
        abi: TREASURY_VAULT_ABI,
        functionName: 'withdraw',
        args: [
          user.walletAddress as Address,
          toAddress as Address,
          amountUnits,
        ],
      });

      // Wait for confirmation (sub-second on Arc)
      await publicClient.waitForTransactionReceipt({ hash });

      // Mark as confirmed
      await prisma.payout.update({
        where: { id: payoutId! },
        data: {
          txHash: hash,
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      });

      return Response.json({ payoutId: payoutId!, status: 'CONFIRMED', txHash: hash }, { status: 201 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Withdrawal failed';

      // Refund on failure
      await prisma.$transaction(async (tx) => {
        await tx.payout.update({
          where: { id: payoutId! },
          data: { status: 'FAILED', failureReason: msg },
        });

        await tx.creator.update({
          where: { id: user.creator!.id },
          data: { settledBalance: { increment: amountUnits } },
        });

        await tx.ledgerEntry.create({
          data: {
            payoutId: payoutId!,
            type: 'ADJUSTMENT',
            amountUsdc: amountUnits,
            balanceBefore: 0n,
            balanceAfter: amountUnits,
            note: `Payout failed: ${msg}`,
          },
        });
      });

      throw new PaymentError(`Withdrawal failed: ${msg}`);
    }
  } catch (err) {
    return toApiError(err);
  }
}
