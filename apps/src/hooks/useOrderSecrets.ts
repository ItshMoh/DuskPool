/**
 * Hook for managing order secrets in localStorage
 *
 * Order secrets (secret, nonce) are required for settlement.
 * They must be stored locally since they are not visible on-chain.
 */

import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "rwa-darkpool-order-secrets";

/**
 * Stored order secret data structure
 */
export interface StoredOrderSecret {
  commitment: string;
  secret: string; // bigint as string
  nonce: string; // bigint as string
  assetHash: string;
  assetAddress: string;
  side: number; // 0 = Buy, 1 = Sell
  quantity: string;
  price: string;
  trader: string;
  timestamp: number;
  expiry?: number;
}

/**
 * Hook for storing and retrieving order secrets
 */
export function useOrderSecrets() {
  const [secrets, setSecrets] = useState<StoredOrderSecret[]>([]);

  // Load secrets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredOrderSecret[];
        // Filter out expired secrets
        const now = Date.now();
        const valid = parsed.filter((s) => !s.expiry || s.expiry > now);
        setSecrets(valid);

        // Clean up expired entries
        if (valid.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
        }
      }
    } catch (err) {
      console.error("Failed to load order secrets:", err);
    }
  }, []);

  /**
   * Store a new order secret
   */
  const storeSecret = useCallback(
    (secret: StoredOrderSecret): void => {
      const updated = [...secrets, secret];
      setSecrets(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to store order secret:", err);
      }
    },
    [secrets]
  );

  /**
   * Get secret by commitment
   */
  const getSecret = useCallback(
    (commitment: string): StoredOrderSecret | undefined => {
      return secrets.find((s) => s.commitment === commitment);
    },
    [secrets]
  );

  /**
   * Get all secrets for a trader
   */
  const getSecretsByTrader = useCallback(
    (trader: string): StoredOrderSecret[] => {
      return secrets.filter((s) => s.trader === trader);
    },
    [secrets]
  );

  /**
   * Get all secrets for an asset
   */
  const getSecretsByAsset = useCallback(
    (assetAddress: string): StoredOrderSecret[] => {
      return secrets.filter((s) => s.assetAddress === assetAddress);
    },
    [secrets]
  );

  /**
   * Remove a secret by commitment (e.g., after settlement)
   */
  const removeSecret = useCallback(
    (commitment: string): void => {
      const updated = secrets.filter((s) => s.commitment !== commitment);
      setSecrets(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to remove order secret:", err);
      }
    },
    [secrets]
  );

  /**
   * Clear all secrets (use with caution!)
   */
  const clearAllSecrets = useCallback((): void => {
    setSecrets([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear order secrets:", err);
    }
  }, []);

  /**
   * Export secrets for backup
   */
  const exportSecrets = useCallback((): string => {
    return JSON.stringify(secrets, null, 2);
  }, [secrets]);

  /**
   * Import secrets from backup
   */
  const importSecrets = useCallback((jsonData: string): boolean => {
    try {
      const imported = JSON.parse(jsonData) as StoredOrderSecret[];
      // Validate structure
      if (
        !Array.isArray(imported) ||
        imported.some(
          (s) =>
            !s.commitment ||
            !s.secret ||
            !s.nonce ||
            !s.assetAddress ||
            !s.trader
        )
      ) {
        console.error("Invalid secrets format");
        return false;
      }

      setSecrets((prev) => {
        // Merge with existing, avoiding duplicates
        const existingCommitments = new Set(prev.map((s) => s.commitment));
        const newSecrets = imported.filter(
          (s) => !existingCommitments.has(s.commitment)
        );
        const merged = [...prev, ...newSecrets];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      });
      return true;
    } catch (err) {
      console.error("Failed to import secrets:", err);
      return false;
    }
  }, []);

  /**
   * Get count of active (non-expired) secrets
   */
  const getActiveSecretsCount = useCallback((): number => {
    const now = Date.now();
    return secrets.filter((s) => !s.expiry || s.expiry > now).length;
  }, [secrets]);

  return {
    // State
    secrets,

    // CRUD operations
    storeSecret,
    getSecret,
    getSecretsByTrader,
    getSecretsByAsset,
    removeSecret,
    clearAllSecrets,

    // Backup/restore
    exportSecrets,
    importSecrets,

    // Utilities
    getActiveSecretsCount,
  };
}
