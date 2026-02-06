import { useCallback } from 'react';
import { useWallet } from './useWallet';
import { createRegistryClient } from '../contracts';

// Re-export types for convenience
export { AssetType, ParticipantCategory } from '../contracts/registry';
export type { RWAAsset, Participant } from '../contracts/registry';

export function useRegistry() {
  const { address } = useWallet();

  // Get all active assets
  const getActiveAssets = useCallback(async () => {
    try {
      const client = createRegistryClient();
      const tx = await client.get_active_assets();
      return tx.result;
    } catch (err) {
      console.error('Failed to get active assets:', err);
      return [];
    }
  }, []);

  // Get asset by address
  const getAsset = useCallback(async (tokenAddress: string) => {
    try {
      const client = createRegistryClient();
      const tx = await client.get_asset({ token_address: tokenAddress });
      return tx.result;
    } catch (err) {
      console.error('Failed to get asset:', err);
      return null;
    }
  }, []);

  // Check if asset is eligible for trading
  const isAssetEligible = useCallback(async (tokenAddress: string): Promise<boolean> => {
    try {
      const client = createRegistryClient();
      const tx = await client.is_asset_eligible({ token_address: tokenAddress });
      return tx.result;
    } catch (err) {
      console.error('Failed to check asset eligibility:', err);
      return false;
    }
  }, []);

  // Get all active participants
  const getActiveParticipants = useCallback(async () => {
    try {
      const client = createRegistryClient();
      const tx = await client.get_active_participants();
      return tx.result;
    } catch (err) {
      console.error('Failed to get active participants:', err);
      return [];
    }
  }, []);

  // Get participant by address
  const getParticipant = useCallback(async (participantAddress?: string) => {
    const addr = participantAddress || address;
    if (!addr) return null;

    try {
      const client = createRegistryClient();
      const tx = await client.get_participant({ trading_address: addr });
      return tx.result;
    } catch (err) {
      console.error('Failed to get participant:', err);
      return null;
    }
  }, [address]);

  // Check if participant is eligible for trading
  const isParticipantEligible = useCallback(async (participantAddress?: string): Promise<boolean> => {
    const addr = participantAddress || address;
    if (!addr) return false;

    try {
      const client = createRegistryClient();
      const tx = await client.is_participant_eligible({ trading_address: addr });
      return tx.result;
    } catch (err) {
      console.error('Failed to check participant eligibility:', err);
      return false;
    }
  }, [address]);

  // Get whitelist Merkle root
  const getWhitelistRoot = useCallback(async (): Promise<Buffer | null> => {
    try {
      const client = createRegistryClient();
      const tx = await client.get_whitelist_root();
      return tx.result;
    } catch (err) {
      console.error('Failed to get whitelist root:', err);
      return null;
    }
  }, []);

  // Get whitelist count
  const getWhitelistCount = useCallback(async (): Promise<number> => {
    try {
      const client = createRegistryClient();
      const tx = await client.get_whitelist_count();
      return tx.result;
    } catch (err) {
      console.error('Failed to get whitelist count:', err);
      return 0;
    }
  }, []);

  return {
    getActiveAssets,
    getAsset,
    isAssetEligible,
    getActiveParticipants,
    getParticipant,
    isParticipantEligible,
    getWhitelistRoot,
    getWhitelistCount,
  };
}
