import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';
import { createOrderbookClient } from '../contracts';
import { OrderSide } from '../contracts/orderbook';

// Re-export types for convenience
export { OrderSide, OrderStatus } from '../contracts/orderbook';

export function useOrderbook() {
  const { address, signTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wrapper to match SDK expected signature
  const signTx = useCallback(async (xdr: string) => {
    const signedXdr = await signTransaction(xdr);
    return { signedTxXdr: signedXdr, signerAddress: address };
  }, [signTransaction, address]);

  // Submit an order commitment
  const submitOrder = useCallback(async (
    commitment: Buffer,
    assetAddress: string,
    side: OrderSide,
    expirySeconds: bigint
  ): Promise<{ result: any; txHash: string }> => {
    if (!address) throw new Error('Wallet not connected');
    setIsLoading(true);
    setError(null);

    try {
      const client = createOrderbookClient(address);
      const tx = await client.submit_order({
        trader: address,
        commitment,
        asset_address: assetAddress,
        side,
        expiry_seconds: expirySeconds,
      });

      const response = await tx.signAndSend({ signTransaction: signTx as any });
      // Extract transaction hash from the response
      const txHash = (response as any).sendTransactionResponse?.hash ||
                     (response as any).hash ||
                     '';
      return { result: response.result, txHash };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submit order failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, signTx]);

  // Cancel an order (requires ZK proof of ownership)
  const cancelOrder = useCallback(async (
    commitment: Buffer,
    proofBytes: Buffer,
    pubSignalsBytes: Buffer
  ) => {
    if (!address) throw new Error('Wallet not connected');
    setIsLoading(true);
    setError(null);

    try {
      const client = createOrderbookClient(address);
      const tx = await client.cancel_order({
        trader: address,
        commitment,
        proof_bytes: proofBytes,
        pub_signals_bytes: pubSignalsBytes,
      });

      const { result } = await tx.signAndSend({ signTransaction: signTx as any });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cancel order failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, signTx]);

  // Get active orders for an asset
  const getActiveOrders = useCallback(async (assetAddress: string) => {
    try {
      const client = createOrderbookClient();
      const tx = await client.get_active_orders({ asset_address: assetAddress });
      return tx.result;
    } catch (err) {
      console.error('Failed to get active orders:', err);
      return [];
    }
  }, []);

  // Get orders by asset (optionally filter by side)
  const getOrdersByAsset = useCallback(async (assetAddress: string, side?: OrderSide) => {
    try {
      const client = createOrderbookClient();
      const tx = await client.get_orders_by_asset({
        asset_address: assetAddress,
        side: side as any, // Optional filter by side
      });
      return tx.result;
    } catch (err) {
      console.error('Failed to get orders by asset:', err);
      return [];
    }
  }, []);

  // Get order by commitment
  const getOrder = useCallback(async (commitment: Buffer) => {
    try {
      const client = createOrderbookClient();
      const tx = await client.get_order({ commitment });
      return tx.result;
    } catch (err) {
      console.error('Failed to get order:', err);
      return null;
    }
  }, []);

  // Get all matches
  const getMatches = useCallback(async () => {
    try {
      const client = createOrderbookClient();
      const tx = await client.get_matches();
      return tx.result;
    } catch (err) {
      console.error('Failed to get matches:', err);
      return [];
    }
  }, []);

  // Get pending (unsettled) matches
  const getPendingMatches = useCallback(async () => {
    try {
      const client = createOrderbookClient();
      const tx = await client.get_pending_matches();
      return tx.result;
    } catch (err) {
      console.error('Failed to get pending matches:', err);
      return [];
    }
  }, []);

  return {
    submitOrder,
    cancelOrder,
    getActiveOrders,
    getOrdersByAsset,
    getOrder,
    getMatches,
    getPendingMatches,
    isLoading,
    error,
  };
}
