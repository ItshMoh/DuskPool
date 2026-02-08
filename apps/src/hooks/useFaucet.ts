import { useState, useCallback } from 'react';
import {
  Keypair,
  TransactionBuilder,
  Operation,
  Asset,
  Horizon,
  Networks,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import { useWallet } from './useWallet';
import { HORIZON_URL } from '../utils/wallet';

const FAUCET_SECRET = import.meta.env.VITE_FAUCET_SECRET as string;

export function useFaucet() {
  const { address, signTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestTestTokens = useCallback(
    async (assetSymbol: string) => {
      if (!address) throw new Error('Wallet not connected');
      if (!FAUCET_SECRET) throw new Error('Faucet not configured');

      setIsLoading(true);
      setError(null);

      try {
        // Derive admin keypair from env secret
        const adminKeypair = Keypair.fromSecret(FAUCET_SECRET);
        const adminPublicKey = adminKeypair.publicKey();

        // Create classic Stellar asset issued by admin
        const asset = new Asset(assetSymbol, adminPublicKey);

        // Load user account for sequence number (user is tx source)
        const server = new Horizon.Server(HORIZON_URL);
        const userAccount = await server.loadAccount(address);

        // Build transaction with both operations
        const tx = new TransactionBuilder(userAccount, {
          fee: BASE_FEE,
          networkPassphrase: Networks.TESTNET,
        })
          // User adds trustline (idempotent — safe if already exists)
          .addOperation(
            Operation.changeTrust({ asset })
          )
          // Admin sends 1000 tokens to user
          .addOperation(
            Operation.payment({
              destination: address,
              asset,
              amount: '1000',
              source: adminPublicKey,
            })
          )
          .setTimeout(120)
          .build();

        // Sign with admin key first
        tx.sign(adminKeypair);

        // Pass to user wallet for their signature (preserves admin signature)
        const xdr = tx.toXDR();
        const signedXdr = await signTransaction(xdr);

        // Submit dual-signed transaction
        const signedTx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
        const result = await server.submitTransaction(signedTx);
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to request test tokens';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address, signTransaction]
  );

  return { requestTestTokens, isLoading, error };
}
