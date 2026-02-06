const STORAGE_KEYS = {
  WALLET_ID: 'stellar_wallet_id',
  WALLET_ADDRESS: 'stellar_wallet_address',
  WALLET_NETWORK: 'stellar_wallet_network',
  NETWORK_PASSPHRASE: 'stellar_network_passphrase',
} as const;

export interface WalletStorage {
  walletId: string | null;
  walletAddress: string | null;
  walletNetwork: string | null;
  networkPassphrase: string | null;
}

export function getStoredWallet(): WalletStorage {
  return {
    walletId: localStorage.getItem(STORAGE_KEYS.WALLET_ID),
    walletAddress: localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS),
    walletNetwork: localStorage.getItem(STORAGE_KEYS.WALLET_NETWORK),
    networkPassphrase: localStorage.getItem(STORAGE_KEYS.NETWORK_PASSPHRASE),
  };
}

export function storeWallet(data: Partial<WalletStorage>): void {
  if (data.walletId !== undefined) {
    if (data.walletId) {
      localStorage.setItem(STORAGE_KEYS.WALLET_ID, data.walletId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.WALLET_ID);
    }
  }
  if (data.walletAddress !== undefined) {
    if (data.walletAddress) {
      localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, data.walletAddress);
    } else {
      localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
    }
  }
  if (data.walletNetwork !== undefined) {
    if (data.walletNetwork) {
      localStorage.setItem(STORAGE_KEYS.WALLET_NETWORK, data.walletNetwork);
    } else {
      localStorage.removeItem(STORAGE_KEYS.WALLET_NETWORK);
    }
  }
  if (data.networkPassphrase !== undefined) {
    if (data.networkPassphrase) {
      localStorage.setItem(STORAGE_KEYS.NETWORK_PASSPHRASE, data.networkPassphrase);
    } else {
      localStorage.removeItem(STORAGE_KEYS.NETWORK_PASSPHRASE);
    }
  }
}

export function clearWalletStorage(): void {
  localStorage.removeItem(STORAGE_KEYS.WALLET_ID);
  localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
  localStorage.removeItem(STORAGE_KEYS.WALLET_NETWORK);
  localStorage.removeItem(STORAGE_KEYS.NETWORK_PASSPHRASE);
}
