import { PublicKey } from '@solana/web3.js';

export interface ValidationResult {
  valid: string[];
  invalid: { address: string; reason: string }[];
}

/**
 * Validates if a string is a valid Solana address
 */
export const isValidSolanaAddress = (address: string): boolean => {
  if (!address || address.trim().length === 0) {
    return false;
  }

  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates a list of addresses and returns valid/invalid groups
 */
export const validateAddressList = (addresses: string[]): ValidationResult => {
  const valid: string[] = [];
  const invalid: { address: string; reason: string }[] = [];

  addresses.forEach((address) => {
    const trimmed = address.trim();
    
    if (trimmed.length === 0) {
      return; // Skip empty lines
    }

    if (isValidSolanaAddress(trimmed)) {
      valid.push(trimmed);
    } else {
      invalid.push({
        address: trimmed,
        reason: 'Invalid Solana address format',
      });
    }
  });

  return { valid, invalid };
};
