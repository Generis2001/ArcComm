export interface PaymentIntent {
  paymentId: string; // hex bytes32
  dbPaymentId: string;
  creatorWallet: string;
  grossAmountUsdc: string; // serialized BigInt
  netAmountUsdc: string;
  platformFeeUsdc: string;
  feeBps: number;
  type: 'SUBSCRIPTION_INITIAL' | 'SUBSCRIPTION_RENEWAL' | 'CONTENT_PURCHASE' | 'PRODUCT_PURCHASE' | 'COMMUNITY_JOIN';
  communityId?: string;
  expiresAt: number; // unix timestamp
}

export interface PaymentConfirmation {
  paymentId: string;
  txHash: string;
}

export interface BalanceSummary {
  totalEarned: string;
  availableToWithdraw: string;
}
