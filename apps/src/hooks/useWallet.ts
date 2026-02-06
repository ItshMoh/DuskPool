import { useContext } from 'react';
import { WalletContext } from '../providers/WalletProvider';
import type { WalletContextValue } from '../providers/WalletProvider';

export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
