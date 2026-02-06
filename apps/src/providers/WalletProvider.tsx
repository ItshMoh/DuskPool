import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getStoredWallet } from '../utils/storage';
import {
  connectWallet as walletConnect,
  disconnectWallet as walletDisconnect,
  reconnectWallet,
  fetchBalances as walletFetchBalances,
  signTransaction as walletSignTransaction,
  NETWORK,
  NETWORK_PASSPHRASE,
} from '../utils/wallet';
import type { Balance } from '../utils/wallet';

export interface WalletContextValue {
  address: string | null;
  balances: Balance[];
  network: string;
  networkPassphrase: string;
  isConnected: boolean;
  isPending: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (xdr: string) => Promise<string>;
  refreshBalances: () => Promise<void>;
}

export const WalletContext = createContext<WalletContextValue | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isPending, setIsPending] = useState(false);

  const isConnected = address !== null;

  const refreshBalances = useCallback(async () => {
    if (!address) return;
    const newBalances = await walletFetchBalances(address);
    setBalances(newBalances);
  }, [address]);

  const connect = useCallback(async () => {
    setIsPending(true);
    try {
      const result = await walletConnect();
      setAddress(result.address);
      const newBalances = await walletFetchBalances(result.address);
      setBalances(newBalances);
    } catch (err) {
      // User closed modal or error - just ignore
      console.log('Connection cancelled or failed:', err);
    } finally {
      setIsPending(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await walletDisconnect();
    setAddress(null);
    setBalances([]);
  }, []);

  const signTransaction = useCallback(async (xdr: string) => {
    if (!address) throw new Error('Wallet not connected');
    return walletSignTransaction(xdr, address);
  }, [address]);

  // Auto-reconnect from localStorage on mount
  useEffect(() => {
    const stored = getStoredWallet();
    if (stored.walletId && stored.walletAddress) {
      setIsPending(true);
      reconnectWallet(stored.walletId)
        .then(async (addr) => {
          if (addr) {
            setAddress(addr);
            const newBalances = await walletFetchBalances(addr);
            setBalances(newBalances);
          }
        })
        .finally(() => setIsPending(false));
    }
  }, []);

  const value: WalletContextValue = {
    address,
    balances,
    network: NETWORK,
    networkPassphrase: NETWORK_PASSPHRASE,
    isConnected,
    isPending,
    connect,
    disconnect,
    signTransaction,
    refreshBalances,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
