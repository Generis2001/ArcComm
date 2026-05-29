import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/client';
import { createPublicClient, http, type Hash } from 'viem';
import { arcTestnet } from '@/lib/wagmi/chains';
import { PAYMENT_ROUTER_ABI, PAYMENT_ROUTER_ADDRESS } from '@/lib/wagmi/contracts';
import { creditCreatorPayment } from '@/lib/payments/ledger';

const TX_TIMEOUT_MS = 10 * 60 * 1000;

export async function GET(req: NextRequest) {
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(process.env.PLATFORM_RPC_URL),
  });
  const secret = req.headers.get('authorization')?.replace('Bearer ', '');
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pending = await prisma.payment.findMany({
    where: {
      status: { in: ['PENDING', 'CONFIRMING'] },
      txHash: { not: null },
    },
    take: 50,
  });

  let confirmed = 0;
  let failed = 0;

  for (const payment of pending) {
    if (!payment.txHash) continue;

    const timedOut = Date.now() - payment.createdAt.getTime() > TX_TIMEOUT_MS;

    try {
      const receipt = await publicClient.getTransactionReceipt({
        hash: payment.txHash as Hash,
      });

      if (receipt.status === 'success') {
        // Verify PaymentReceived event exists in logs
        const logs = await publicClient.getContractEvents({
          address: PAYMENT_ROUTER_ADDRESS,
          abi: PAYMENT_ROUTER_ABI,
          eventName: 'PaymentReceived',
          fromBlock: receipt.blockNumber,
          toBlock: receipt.blockNumber,
        });

        const matchedLog = logs.find(
          (log) =>
            log.transactionHash?.toLowerCase() === payment.txHash?.toLowerCase(),
        );

        if (matchedLog) {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: 'CONFIRMED',
                blockNumber: receipt.blockNumber,
                confirmedAt: new Date(),
              },
            });

            await creditCreatorPayment(tx, {
              creatorId: payment.toCreatorId,
              paymentId: payment.id,
              netAmountUsdc: payment.netAmountUsdc,
            });

            // Create subscription record if this was a subscription payment
            if (
              payment.type === 'SUBSCRIPTION_INITIAL' &&
              payment.subscriptionId === null
            ) {
              // Subscription creation is handled separately via subscriptions route
            }
          });

          confirmed++;
        } else {
          // Transaction succeeded but no PaymentReceived event — revert
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' },
          });
          failed++;
        }
      } else if (receipt.status === 'reverted') {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });
        failed++;
      }
    } catch {
      // Receipt not found yet — check timeout
      if (timedOut) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });
        failed++;
      }
    }
  }

  console.log(`[cron:tx-indexer] confirmed=${confirmed} failed=${failed}`);
  return Response.json({ ok: true, confirmed, failed });
}
