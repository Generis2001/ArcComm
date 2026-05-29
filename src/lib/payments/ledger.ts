import { type PrismaClient, LedgerEntryType } from '@prisma/client';

interface CreditPaymentArgs {
  creatorId: string;
  paymentId: string;
  netAmountUsdc: bigint;
}

export async function creditCreatorPayment(
  tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  { creatorId, paymentId, netAmountUsdc }: CreditPaymentArgs,
) {
  const creator = await tx.creator.findUniqueOrThrow({
    where: { id: creatorId },
    select: { pendingBalance: true, totalEarned: true },
  });

  const newPending = creator.pendingBalance + netAmountUsdc;

  await tx.creator.update({
    where: { id: creatorId },
    data: {
      pendingBalance: { increment: netAmountUsdc },
      totalEarned: { increment: netAmountUsdc },
    },
  });

  await tx.ledgerEntry.create({
    data: {
      paymentId,
      type: LedgerEntryType.PAYMENT_RECEIVED,
      amountUsdc: netAmountUsdc,
      balanceBefore: creator.pendingBalance,
      balanceAfter: newPending,
    },
  });
}

interface SettlePaymentArgs {
  creatorId: string;
  paymentId: string;
  netAmountUsdc: bigint;
}

export async function settleCreatorPayment(
  tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  { creatorId, paymentId, netAmountUsdc }: SettlePaymentArgs,
) {
  const creator = await tx.creator.findUniqueOrThrow({
    where: { id: creatorId },
    select: { settledBalance: true, pendingBalance: true },
  });

  await tx.creator.update({
    where: { id: creatorId },
    data: {
      pendingBalance: { decrement: netAmountUsdc },
      settledBalance: { increment: netAmountUsdc },
    },
  });

  await tx.ledgerEntry.create({
    data: {
      paymentId,
      type: LedgerEntryType.SETTLEMENT_TO_AVAILABLE,
      amountUsdc: netAmountUsdc,
      balanceBefore: creator.settledBalance,
      balanceAfter: creator.settledBalance + netAmountUsdc,
    },
  });
}

interface InitiatePayoutArgs {
  creatorId: string;
  payoutId: string;
  amountUsdc: bigint;
}

export async function initiatePayoutLedger(
  tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  { creatorId, payoutId, amountUsdc }: InitiatePayoutArgs,
) {
  const creator = await tx.creator.findUniqueOrThrow({
    where: { id: creatorId },
    select: { settledBalance: true },
  });

  if (creator.settledBalance < amountUsdc) {
    throw new Error('Insufficient settled balance');
  }

  await tx.creator.update({
    where: { id: creatorId },
    data: { settledBalance: { decrement: amountUsdc } },
  });

  await tx.ledgerEntry.create({
    data: {
      payoutId,
      type: LedgerEntryType.PAYOUT_INITIATED,
      amountUsdc: -amountUsdc,
      balanceBefore: creator.settledBalance,
      balanceAfter: creator.settledBalance - amountUsdc,
    },
  });
}
