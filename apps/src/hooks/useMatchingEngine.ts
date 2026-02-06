/**
 * Hook for interacting with the Matching Engine API
 * Provides real Poseidon-based commitments and order matching
 */

import { useState, useCallback } from "react";
import { API_ENDPOINTS, apiRequest } from "../config/api";

// Types for API responses
export interface CommitmentResult {
  commitment: string;
  secret: string;
  nonce: string;
  assetHash: string;
}

export interface OrderBookState {
  assetAddress: string;
  buyOrders: number;
  sellOrders: number;
  buyQuantities: string[];
  sellQuantities: string[];
  buyPrices: string[];
  sellPrices: string[];
}

export interface MatchResult {
  matchId: string;
  buyOrder: {
    commitment: string;
    trader: string;
    assetAddress: string;
    side: number;
    timestamp: number;
  };
  sellOrder: {
    commitment: string;
    trader: string;
    assetAddress: string;
    side: number;
    timestamp: number;
  };
  executionPrice: string;
  executionQuantity: string;
  timestamp: number;
}

export interface SettlementResult {
  matchId: string;
  success: boolean;
  nullifierHash: string;
  proofHex: string;
  signalsHex: string;
  error?: string;
}

export interface PendingSettlement {
  matchId: string;
  status: "pending" | "ready" | "awaiting_signatures" | "submitted" | "confirmed" | "failed";
  buyer: string;
  seller: string;
  assetAddress: string;
  quantity: string;
  price: string;
  nullifierHash: string;
  buyerSigned?: boolean;
  sellerSigned?: boolean;
  role?: "buyer" | "seller";
  txHash?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SigningStatus {
  buyerSigned: boolean;
  sellerSigned: boolean;
  status: string;
}

export interface SignatureResult {
  success: boolean;
  complete: boolean;
  message?: string;
  error?: string;
  txHash?: string; // Transaction hash when settlement is complete
}

export interface SettlementStats {
  total: number;
  pending: number;
  ready: number;
  confirmed: number;
  failed: number;
}

export interface SettlementData {
  matchId: string;
  buyer: string;
  seller: string;
  assetAddress: string;
  paymentAsset: string;
  quantity: string;
  price: string;
  proofHex: string;
  signalsHex: string;
  nullifierHash: string;
}

// Request types
interface GenerateCommitmentParams {
  assetAddress: string;
  side: number; // 0 = Buy, 1 = Sell
  quantity: string;
  price: string;
}

interface SubmitPrivateOrderParams {
  commitment: string;
  trader: string;
  assetAddress: string;
  side: number;
  quantity: string;
  price: string;
  secret: string;
  nonce: string;
  expiry?: number;
  whitelistIndex?: number;
}

/**
 * Hook for interacting with the Matching Engine API
 */
export function useMatchingEngine() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate a real Poseidon commitment via the API
   */
  const generateCommitment = useCallback(
    async (params: GenerateCommitmentParams): Promise<CommitmentResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiRequest<CommitmentResult>(
          API_ENDPOINTS.generateCommitment,
          {
            method: "POST",
            body: JSON.stringify(params),
          }
        );
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to generate commitment";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Submit private order details to the matching engine
   * Returns info about whether the order matched and why not if it didn't
   */
  const submitPrivateOrder = useCallback(
    async (params: SubmitPrivateOrderParams): Promise<{
      success: boolean;
      matched: boolean;
      message: string;
      noMatchReason: string | null;
    }> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiRequest<{
          success: boolean;
          matched: boolean;
          message: string;
          noMatchReason: string | null;
        }>(API_ENDPOINTS.submitOrder, {
          method: "POST",
          body: JSON.stringify(params),
        });
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to submit order";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Get order book state for an asset
   */
  const getOrderBookState = useCallback(
    async (assetAddress: string): Promise<OrderBookState> => {
      try {
        return await apiRequest<OrderBookState>(
          API_ENDPOINTS.getOrderBook(assetAddress)
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to get order book";
        setError(message);
        throw err;
      }
    },
    []
  );

  /**
   * Get all completed matches
   */
  const getMatches = useCallback(async (): Promise<MatchResult[]> => {
    try {
      const response = await apiRequest<{ matches: MatchResult[] }>(
        API_ENDPOINTS.getMatches
      );
      return response.matches;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to get matches";
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Get pending matches count
   */
  const getPendingMatchesCount = useCallback(async (): Promise<number> => {
    try {
      const response = await apiRequest<{ pendingCount: number }>(
        API_ENDPOINTS.getPendingMatches
      );
      return response.pendingCount;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to get pending matches";
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Get all settlement results
   */
  const getSettlements = useCallback(async (): Promise<SettlementResult[]> => {
    try {
      const response = await apiRequest<{ settlements: SettlementResult[] }>(
        API_ENDPOINTS.getSettlements
      );
      return response.settlements;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to get settlements";
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Trigger processing of pending matches (generates ZK proofs)
   */
  const processMatches = useCallback(async (): Promise<{
    processed: number;
    successful: number;
    failed: number;
  }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<{
        processed: number;
        successful: number;
        failed: number;
      }>(API_ENDPOINTS.processMatches, {
        method: "POST",
      });
      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process matches";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check API health
   */
  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      await apiRequest<{ status: string }>(API_ENDPOINTS.health);
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Get all pending settlements
   */
  const getPendingSettlements = useCallback(async (): Promise<PendingSettlement[]> => {
    try {
      const response = await apiRequest<{ settlements: PendingSettlement[] }>(
        API_ENDPOINTS.getPendingSettlements
      );
      return response.settlements;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to get pending settlements";
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Get settlement statistics
   */
  const getSettlementStats = useCallback(async (): Promise<SettlementStats> => {
    try {
      return await apiRequest<SettlementStats>(API_ENDPOINTS.getSettlementStats);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to get settlement stats";
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Prepare settlement data for a match
   */
  const prepareSettlement = useCallback(async (matchId: string): Promise<SettlementData> => {
    try {
      return await apiRequest<SettlementData>(
        API_ENDPOINTS.prepareSettlement(matchId),
        { method: "POST" }
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to prepare settlement";
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Build unsigned settlement transaction
   */
  const buildSettlementTx = useCallback(async (
    matchId: string,
    sourceAccount: string
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ txXdr: string }>(
        API_ENDPOINTS.buildSettlementTx(matchId),
        {
          method: "POST",
          body: JSON.stringify({ sourceAccount }),
        }
      );
      return response.txXdr;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to build settlement transaction";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Submit signed settlement transaction
   */
  const submitSettlement = useCallback(async (
    matchId: string,
    signedTxXdr: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      return await apiRequest<{ success: boolean; txHash?: string; error?: string }>(
        API_ENDPOINTS.submitSettlement(matchId),
        {
          method: "POST",
          body: JSON.stringify({ signedTxXdr }),
        }
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit settlement";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get settlements for a specific trader (buyer or seller)
   */
  const getSettlementsForTrader = useCallback(async (
    traderAddress: string
  ): Promise<PendingSettlement[]> => {
    try {
      const response = await apiRequest<{ settlements: PendingSettlement[] }>(
        API_ENDPOINTS.getSettlementsForTrader(traderAddress)
      );
      return response.settlements;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to get trader settlements";
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Get signing status for a settlement
   */
  const getSigningStatus = useCallback(async (
    matchId: string
  ): Promise<SigningStatus> => {
    try {
      return await apiRequest<SigningStatus>(
        API_ENDPOINTS.getSigningStatus(matchId)
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to get signing status";
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Add a signature from a party (buyer or seller)
   */
  const addSignature = useCallback(async (
    matchId: string,
    signerAddress: string,
    signedTxXdr: string
  ): Promise<SignatureResult> => {
    setIsLoading(true);
    setError(null);
    try {
      return await apiRequest<SignatureResult>(
        API_ENDPOINTS.addSignature(matchId),
        {
          method: "POST",
          body: JSON.stringify({ signerAddress, signedTxXdr }),
        }
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add signature";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    error,

    // Commitment
    generateCommitment,

    // Orders
    submitPrivateOrder,
    getOrderBookState,

    // Matches
    getMatches,
    getPendingMatchesCount,
    getSettlements,
    processMatches,

    // Settlement
    getPendingSettlements,
    getSettlementStats,
    prepareSettlement,
    buildSettlementTx,
    submitSettlement,

    // Multi-party signing
    getSettlementsForTrader,
    getSigningStatus,
    addSignature,

    // Health
    checkHealth,
  };
}
