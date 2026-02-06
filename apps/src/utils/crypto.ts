/**
 * Cryptographic utilities for ZK commitments and proofs
 *
 * This module provides both mock (fallback) and real (API-based) commitment generation.
 * The real implementation uses the matching engine API for Poseidon hash.
 */

import { API_ENDPOINTS, apiRequest } from "../config/api";

/**
 * Commitment result from API or mock
 */
export interface CommitmentResult {
  commitment: Buffer;
  secret: string;
  nonce: string;
  assetHash?: string;
  /** Original decimal string for ZK circuit (more reliable than hex conversion) */
  commitmentDecimal?: string;
}

/**
 * Generate a commitment hash via the Matching Engine API (real Poseidon)
 *
 * @param asset - Asset address
 * @param side - Order side (0 = buy, 1 = sell)
 * @param quantity - Order quantity
 * @param price - Order price
 * @returns CommitmentResult with real Poseidon commitment
 */
export const generateCommitmentAsync = async (
  asset: string,
  side: number,
  quantity: number,
  price: number
): Promise<CommitmentResult> => {
  try {
    const response = await apiRequest<{
      commitment: string;
      secret: string;
      nonce: string;
      assetHash: string;
    }>(API_ENDPOINTS.generateCommitment, {
      method: "POST",
      body: JSON.stringify({
        assetAddress: asset,
        side,
        quantity: Math.round(quantity * 1e7).toString(), // Convert to stroops
        price: Math.round(price * 1e7).toString(), // Convert to stroops
      }),
    });

    // IMPORTANT: Keep commitment as decimal string for ZK circuit compatibility
    // The circuit expects decimal field elements, not hex strings
    // We store it in a buffer for on-chain submission, but the decimal string
    // is used for off-chain matching engine
    const commitmentBigInt = BigInt(response.commitment);
    const commitmentHex = commitmentBigInt.toString(16).padStart(64, "0");
    const commitmentBuffer = Buffer.from(commitmentHex, "hex");

    console.log('[Crypto] Generated commitment:', {
      decimalString: response.commitment.slice(0, 30) + '...',
      hexString: '0x' + commitmentHex.slice(0, 20) + '...',
      assetHash: response.assetHash.slice(0, 20) + '...',
    });

    return {
      commitment: commitmentBuffer,
      secret: response.secret,
      nonce: response.nonce,
      assetHash: response.assetHash,
      // Store the original decimal string for off-chain use
      commitmentDecimal: response.commitment,
    };
  } catch (error) {
    console.warn(
      "API commitment generation failed, falling back to mock:",
      error
    );
    // Fallback to mock commitment
    const mockNonce = generateNonce();
    return {
      commitment: generateCommitment(asset, side, quantity, price, mockNonce),
      secret: Math.floor(Math.random() * 2 ** 32).toString(),
      nonce: mockNonce.toString(),
    };
  }
};

/**
 * Generate a mock commitment hash (synchronous, for backwards compatibility)
 * NOTE: This is NOT cryptographically secure. Use generateCommitmentAsync for real use.
 *
 * @param asset - Asset address
 * @param side - Order side (0 = buy, 1 = sell)
 * @param quantity - Order quantity
 * @param price - Order price
 * @param nonce - Random nonce for uniqueness
 * @returns 32-byte Buffer representing the commitment
 */
export const generateCommitment = (
  asset: string,
  side: number,
  quantity: number,
  price: number,
  nonce: number
): Buffer => {
  const data = `${asset}:${side}:${quantity}:${price}:${nonce}:${Date.now()}`;
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = data.charCodeAt(i % data.length) ^ (i * 7);
  }
  return Buffer.from(bytes);
};

/**
 * Generate a random nonce
 * @returns Random number for use as commitment nonce
 */
export const generateNonce = (): number => {
  return Math.floor(Math.random() * 2 ** 32);
};

/**
 * Convert a buffer to hex string
 * @param buffer - Buffer to convert
 * @returns Hex string with 0x prefix
 */
export const bufferToHex = (buffer: Buffer): string => {
  return `0x${buffer.toString("hex")}`;
};

/**
 * Convert hex string to buffer
 * @param hex - Hex string (with or without 0x prefix)
 * @returns Buffer
 */
export const hexToBuffer = (hex: string): Buffer => {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  return Buffer.from(cleanHex, "hex");
};

/**
 * Truncate a commitment/hash for display
 * @param commitment - Buffer or hex string
 * @returns Truncated string like "0xabcd...ef12"
 */
export const truncateCommitment = (commitment: Buffer | string): string => {
  const hex =
    typeof commitment === "string" ? commitment : bufferToHex(commitment);
  return `${hex.slice(0, 6)}...${hex.slice(-4)}`;
};

/**
 * Check if the matching engine API is available
 * @returns true if API is reachable
 */
export const isMatchingEngineAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_ENDPOINTS.health, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.ok;
  } catch {
    return false;
  }
};
