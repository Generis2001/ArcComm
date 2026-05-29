export interface SubscriptionWithTier {
  id: string;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  renewalCount: number;
  tier: {
    id: string;
    name: string;
    priceUsdc: string;
    intervalDays: number;
    perks: string[];
  };
  creator: {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl: string | null;
  };
}
