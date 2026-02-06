import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
} from '@creit.tech/stellar-wallets-kit';
import { Horizon, Networks } from '@stellar/stellar-sdk';
import { storeWallet, clearWalletStorage } from './storage';

export const NETWORK = WalletNetwork.TESTNET;
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';

let kit: StellarWalletsKit | null = null;

export function getKit(): StellarWalletsKit {
  if (!kit) {
    kit = new StellarWalletsKit({
      network: NETWORK,
      modules: allowAllModules(),
    });
  }
  return kit;
}

export interface ConnectResult {
  address: string;
}

export async function connectWallet(): Promise<ConnectResult> {
  const stellarKit = getKit();

  return new Promise((resolve, reject) => {
    stellarKit.openModal({
      modalTitle: 'Connect Wallet',
      onWalletSelected: async (option) => {
        try {
          stellarKit.setWallet(option.id);
          const { address } = await stellarKit.getAddress();

          storeWallet({
            walletId: option.id,
            walletAddress: address,
            walletNetwork: NETWORK,
            networkPassphrase: NETWORK_PASSPHRASE,
          });

          resolve({ address });
        } catch (err) {
          reject(err);
        }
      },
      onClosed: () => {
        // Modal closed without selection - reject with a cancellation
        reject(new Error('Modal closed'));
      },
    });
  });
}

export async function disconnectWallet(): Promise<void> {
  const stellarKit = getKit();
  await stellarKit.disconnect();
  clearWalletStorage();
}

export async function reconnectWallet(walletId: string): Promise<string | null> {
  try {
    const stellarKit = getKit();
    stellarKit.setWallet(walletId);
    const { address } = await stellarKit.getAddress();
    return address;
  } catch {
    clearWalletStorage();
    return null;
  }
}

export interface Balance {
  asset: string;
  balance: string;
}

export async function fetchBalances(address: string): Promise<Balance[]> {
  try {
    const server = new Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(address);

    return account.balances.map((bal) => {
      if (bal.asset_type === 'native') {
        return { asset: 'XLM', balance: bal.balance };
      }
      if ('asset_code' in bal) {
        return { asset: bal.asset_code, balance: bal.balance };
      }
      return { asset: 'unknown', balance: bal.balance };
    });
  } catch {
    return [];
  }
}

export async function signTransaction(xdr: string, address: string): Promise<string> {
  const stellarKit = getKit();
  const { signedTxXdr } = await stellarKit.signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address,
  });
  return signedTxXdr;
}
