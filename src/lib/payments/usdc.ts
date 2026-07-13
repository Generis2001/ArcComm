import { keccak256, stringToHex } from 'viem';

// USDC uses 6 decimal places
export const USDC_DECIMALS = 6;
export const USDC_UNIT = 10n ** BigInt(USDC_DECIMALS);

// Convert human-readable USDC amount (e.g. "9.99") → on-chain BigInt units
export function usdcToUnits(amount: string | number): bigint {
  const str = typeof amount === 'number' ? amount.toFixed(USDC_DECIMALS) : amount;
  const [whole, fraction = ''] = str.split('.');
  const paddedFraction = fraction.padEnd(USDC_DECIMALS, '0').slice(0, USDC_DECIMALS);
  return BigInt(whole) * USDC_UNIT + BigInt(paddedFraction);
}

// Convert on-chain BigInt units → human-readable display string
export function unitsToUsdc(units: bigint): string {
  const whole = units / USDC_UNIT;
  const fraction = units % USDC_UNIT;
  const paddedFraction = fraction.toString().padStart(USDC_DECIMALS, '0');
  const trimmedFraction = paddedFraction.replace(/0+$/, '');
  return trimmedFraction ? `${whole}.${trimmedFraction}` : whole.toString();
}

// Format for display: always 2 decimal places, e.g. "9.99 USDC"
export function formatUsdc(units: bigint): string {
  const whole = units / USDC_UNIT;
  const fraction = ((units % USDC_UNIT) * 100n) / USDC_UNIT;
  return `${whole}.${fraction.toString().padStart(2, '0')} USDC`;
}

// Compute platform fee from gross amount
export function computeFee(grossUnits: bigint, feeBps: number): bigint {
  return (grossUnits * BigInt(feeBps)) / 10_000n;
}

// Generate a deterministic payment ID from a random string + timestamp
export function generatePaymentId(raw: string): `0x${string}` {
  return keccak256(stringToHex(raw));
}
