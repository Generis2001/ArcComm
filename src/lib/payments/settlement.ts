import { prisma } from '@/lib/db/client';
import { settleCreatorPayment } from './ledger';

const SETTLEMENT_DELAY_MS = 60 * 60 * 1000; // 1 hour

export async function runSettlement(): Promise<{ settled: number }> {
  const cutoff = new Date(Date.now() - SETTLEMENT_DELAY_MS);

  const ready = await prisma.payment.findMany({
    where: {
      status: 'CONFIRMED',
      settledToCreator: false,
      confirmedAt: { lt: cutoff },
    },
    select: {
      id: true,
      toCreatorId: true,
      netAmountUsdc: true,
    },
    take: 100, // process in batches
  });

  let settled = 0;

  for (const payment of ready) {
    try {
      await prisma.$transaction(async (tx) => {
        await settleCreatorPayment(tx, {
          creatorId: payment.toCreatorId,
          paymentId: payment.id,
          netAmountUsdc: payment.netAmountUsdc,
        });

        await tx.payment.update({
          where: { id: payment.id },
          data: { settledToCreator: true },
        });
      });

      settled++;
    } catch (err) {
      console.error(`Settlement failed for payment ${payment.id}:`, err);
    }
  }

  return { settled };
}
