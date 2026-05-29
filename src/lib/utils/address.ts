import { getAddress, type Address } from 'viem';

export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function checksumAddress(address: string): Address {
  return getAddress(address);
}

export function isValidAddress(address: string): boolean {
  try {
    getAddress(address);
    return true;
  } catch {
    return false;
  }
}

export function addressesEqual(a: string, b: string): boolean {
  try {
    return getAddress(a) === getAddress(b);
  } catch {
    return false;
  }
}
