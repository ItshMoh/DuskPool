import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';
import { createSettlementClient } from '../contracts';

export function useSettlement() {
  const { address, signTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getClient = useCallback(() => {
    if (!address) throw new Error('Wallet not connected');
    return createSettlementClient(address);
  }, [address]);

  // Wrapper to match SDK expected signature
  const signTx = useCallback(async (xdr: string) => {
    const signedXdr = await signTransaction(xdr);
    return { signedTxXdr: signedXdr, signerAddress: address };
  }, [signTransaction, address]);

  // Deposit tokens to escrow
  const deposit = useCallback(async (assetAddress: string, amount: bigint) => {
    if (!address) throw new Error('Wallet not connected');
    setIsLoading(true);
    setError(null);

    try {
      const client = getClient();
      const tx = await client.deposit({
        depositor: address,
        asset_address: assetAddress,
        amount,
      });

      const { result } = await tx.signAndSend({ signTransaction: signTx as any });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Deposit failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, signTx, getClient]);

  // Withdraw tokens from escrow
  const withdraw = useCallback(async (assetAddress: string, amount: bigint) => {
    if (!address) throw new Error('Wallet not connected');
    setIsLoading(true);
    setError(null);

    try {
      const client = getClient();
      const tx = await client.withdraw({
        withdrawer: address,
        asset_address: assetAddress,
        amount,
      });

      const { result } = await tx.signAndSend({ signTransaction: signTx as any });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Withdraw failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, signTx, getClient]);

  // Get escrow balance (read-only, no signing needed)
  const getEscrowBalance = useCallback(async (assetAddress: string): Promise<bigint> => {
    try {
      const client = createSettlementClient(); // No publicKey needed for reads
      const tx = await client.get_escrow_balance({
        participant: address!,
        asset: assetAddress,
      });
      return tx.result;
    } catch (err) {
      console.error('Failed to get escrow balance:', err);
      return BigInt(0);
    }
  }, [address]);

  // Get locked balance
  const getLockedBalance = useCallback(async (assetAddress: string): Promise<bigint> => {
    try {
      const client = createSettlementClient();
      const tx = await client.get_locked_balance({
        participant: address!,
        asset: assetAddress,
      });
      return tx.result;
    } catch (err) {
      console.error('Failed to get locked balance:', err);
      return BigInt(0);
    }
  }, [address]);

  // Get available (unlocked) balance
  const getAvailableBalance = useCallback(async (assetAddress: string): Promise<bigint> => {
    try {
      const client = createSettlementClient();
      const tx = await client.get_available_balance({
        participant: address!,
        asset: assetAddress,
      });
      return tx.result;
    } catch (err) {
      console.error('Failed to get available balance:', err);
      return BigInt(0);
    }
  }, [address]);

  // Get all settlements
  const getSettlements = useCallback(async () => {
    try {
      const client = createSettlementClient();
      const tx = await client.get_settlements();
      return tx.result;
    } catch (err) {
      console.error('Failed to get settlements:', err);
      return [];
    }
  }, []);

  // Lock escrow for a pending order
  const lockEscrow = useCallback(async (assetAddress: string, amount: bigint) => {
    if (!address) throw new Error('Wallet not connected');
    setIsLoading(true);
    setError(null);

    try {
      const client = getClient();
      const tx = await client.lock_escrow({
        trader: address,
        asset_address: assetAddress,
        amount,
      });

      await tx.signAndSend({ signTransaction: signTx as any });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lock escrow failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, signTx, getClient]);

  // Unlock escrow when an order is cancelled
  const unlockEscrow = useCallback(async (assetAddress: string, amount: bigint) => {
    if (!address) throw new Error('Wallet not connected');
    setIsLoading(true);
    setError(null);

    try {
      const client = getClient();
      const tx = await client.unlock_escrow({
        trader: address,
        asset_address: assetAddress,
        amount,
      });

      await tx.signAndSend({ signTransaction: signTx as any });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unlock escrow failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, signTx, getClient]);

  return {
    deposit,
    withdraw,
    lockEscrow,
    unlockEscrow,
    getEscrowBalance,
    getLockedBalance,
    getAvailableBalance,
    getSettlements,
    isLoading,
    error,
  };
}
