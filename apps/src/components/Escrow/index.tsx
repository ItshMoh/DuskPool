import React, { useState, useEffect, useCallback } from 'react';
import { Lock } from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { useSettlement } from '../../hooks/useSettlement';
import { useRegistry } from '../../hooks/useRegistry';
import { useFaucet } from '../../hooks/useFaucet';
import { EmptyState } from '../ui';

import { AssetBalance, Transaction } from './types';
import { parseAmount, formatAmount } from '../../utils';
import { TransferForm } from './TransferForm';
import { TransactionList } from './TransactionList';
import { EscrowStats } from './EscrowStats';

// Payment asset (native XLM wrapped as SAC) - used for buying RWA tokens
const PAYMENT_ASSET = {
  symbol: 'USDC',
  name: 'USD Coin (XLM)',
  tokenAddress: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  decimals: 7,
  price: 1.0,
};

const Escrow: React.FC = () => {
  const { address, balances, isConnected } = useWallet();
  const { deposit, withdraw, getEscrowBalance, getLockedBalance, getAvailableBalance, isLoading: txLoading, error: txError } = useSettlement();
  const { getActiveAssets } = useRegistry();
  const { requestTestTokens, isLoading: faucetLoading, error: faucetError } = useFaucet();

  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [showAssetSelect, setShowAssetSelect] = useState(false);
  const [assets, setAssets] = useState<AssetBalance[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [faucetStatus, setFaucetStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load assets and balances
  const loadAssets = useCallback(async () => {
    if (!isConnected || !address) {
      setAssets([]);
      setIsLoadingAssets(false);
      return;
    }

    setIsLoadingAssets(true);
    try {
      const registeredAssets = await getActiveAssets();

      // Load balances for registry assets
      const registryAssetBalances: AssetBalance[] = await Promise.all(
        registeredAssets.map(async (asset) => {
          const escrowBalance = await getEscrowBalance(asset.token_address);
          const lockedBalance = await getLockedBalance(asset.token_address);
          const availableBalance = await getAvailableBalance(asset.token_address);

          const walletBal = balances.find(b => b.asset === asset.symbol || b.asset.includes(asset.symbol));
          const walletBalance = walletBal ? parseAmount(walletBal.balance) : BigInt(0);

          return {
            symbol: asset.symbol,
            name: asset.symbol,
            tokenAddress: asset.token_address,
            walletBalance,
            escrowBalance,
            lockedBalance,
            availableBalance,
            decimals: 7,
            price: 1.0,
          };
        })
      );

      // Add payment asset (USDC/XLM SAC) - uses native XLM balance
      const paymentEscrowBalance = await getEscrowBalance(PAYMENT_ASSET.tokenAddress);
      const paymentLockedBalance = await getLockedBalance(PAYMENT_ASSET.tokenAddress);
      const paymentAvailableBalance = await getAvailableBalance(PAYMENT_ASSET.tokenAddress);

      // For payment asset, use native XLM balance (SAC wraps automatically)
      const xlmBalance = balances.find(b => b.asset === 'XLM');
      const paymentWalletBalance = xlmBalance ? parseAmount(xlmBalance.balance) : BigInt(0);

      const paymentAssetBalance: AssetBalance = {
        symbol: PAYMENT_ASSET.symbol,
        name: PAYMENT_ASSET.name,
        tokenAddress: PAYMENT_ASSET.tokenAddress,
        walletBalance: paymentWalletBalance,
        escrowBalance: paymentEscrowBalance,
        lockedBalance: paymentLockedBalance,
        availableBalance: paymentAvailableBalance,
        decimals: PAYMENT_ASSET.decimals,
        price: PAYMENT_ASSET.price,
      };

      // Combine: payment asset first, then registry assets
      const allAssets = [paymentAssetBalance, ...registryAssetBalances];

      setAssets(allAssets);
      if (allAssets.length > 0 && !selectedAsset) {
        setSelectedAsset(allAssets[0].tokenAddress);
      }
    } catch (err) {
      console.error('Failed to load assets:', err);
      setAssets([]);
    } finally {
      setIsLoadingAssets(false);
    }
  }, [isConnected, address, getActiveAssets, getEscrowBalance, getLockedBalance, getAvailableBalance, balances, selectedAsset]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const currentAsset = assets.find(a => a.tokenAddress === selectedAsset) || assets[0];

  const getMaxAmount = (): bigint => {
    if (!currentAsset) return BigInt(0);
    return mode === 'deposit' ? currentAsset.walletBalance : currentAsset.availableBalance;
  };

  const maxAmount = getMaxAmount();
  const amountBigint = amount ? parseAmount(amount, currentAsset?.decimals || 7) : BigInt(0);
  const usdValue = currentAsset ? (Number(amountBigint) / 10 ** (currentAsset.decimals || 7)) * currentAsset.price : 0;

  const handleMax = () => {
    if (currentAsset) {
      setAmount(formatAmount(maxAmount, currentAsset.decimals));
    }
  };

  const toggleMode = () => {
    setMode(mode === 'deposit' ? 'withdraw' : 'deposit');
    setAmount('');
    setSubmitStatus('idle');
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setSubmitStatus('idle');
  };

  const handleSelectAsset = (tokenAddress: string) => {
    setSelectedAsset(tokenAddress);
    setShowAssetSelect(false);
    setAmount('');
  };

  const handleSubmit = async () => {
    if (!currentAsset || amountBigint <= 0) return;

    setSubmitStatus('idle');
    try {
      if (mode === 'deposit') {
        await deposit(currentAsset.tokenAddress, amountBigint);
      } else {
        await withdraw(currentAsset.tokenAddress, amountBigint);
      }

      setSubmitStatus('success');
      setAmount('');

      const newTx: Transaction = {
        id: Date.now().toString(),
        type: mode,
        asset: currentAsset.symbol,
        amount: Number(amountBigint) / 10 ** currentAsset.decimals,
        timestamp: 'Just now',
        status: 'completed',
        txHash: '0x...',
      };
      setTransactions(prev => [newTx, ...prev].slice(0, 10));

      await loadAssets();
    } catch (err) {
      setSubmitStatus('error');
      console.error(`${mode} failed:`, err);
    }
  };

  const handleFaucet = async () => {
    if (!currentAsset) return;
    setFaucetStatus('idle');
    try {
      await requestTestTokens(currentAsset.symbol);
      setFaucetStatus('success');
      await loadAssets();
    } catch {
      setFaucetStatus('error');
    }
  };

  // Calculate totals
  const totalEscrow = assets.reduce((sum, a) => sum + Number(a.escrowBalance) / 10 ** a.decimals * a.price, 0);
  const totalAvailable = assets.reduce((sum, a) => sum + Number(a.availableBalance) / 10 ** a.decimals * a.price, 0);
  const totalLocked = assets.reduce((sum, a) => sum + Number(a.lockedBalance) / 10 ** a.decimals * a.price, 0);

  if (!isConnected) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <EmptyState
          icon={Lock}
          title="Connect your wallet to manage escrow"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full px-6 py-4 animate-fade-in-up overflow-hidden flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-condensed font-bold text-white uppercase tracking-wide pr-37">Escrow Management</h1>
          <p className="text-xs text-gray-500 mt-1 pr-37">Deposit and withdraw assets from ZK-protected escrow</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Card - Deposit/Withdraw */}
          <TransferForm
            mode={mode}
            amount={amount}
            assets={assets}
            selectedAsset={selectedAsset}
            currentAsset={currentAsset}
            isLoadingAssets={isLoadingAssets}
            showAssetSelect={showAssetSelect}
            txLoading={txLoading}
            txError={txError}
            submitStatus={submitStatus}
            maxAmount={maxAmount}
            amountBigint={amountBigint}
            usdValue={usdValue}
            onToggleMode={toggleMode}
            onAmountChange={handleAmountChange}
            onMaxClick={handleMax}
            onToggleAssetSelect={() => setShowAssetSelect(!showAssetSelect)}
            onSelectAsset={handleSelectAsset}
            onSubmit={handleSubmit}
            onRefresh={loadAssets}
            faucetLoading={faucetLoading}
            faucetStatus={faucetStatus}
            faucetError={faucetError}
            onFaucet={handleFaucet}
            paymentAssetSymbol={PAYMENT_ASSET.symbol}
          />

          {/* Right Card - Transaction History */}
          <TransactionList transactions={transactions} />
        </div>

        {/* Bottom Stats */}
        <EscrowStats
          totalEscrow={totalEscrow}
          totalAvailable={totalAvailable}
          totalLocked={totalLocked}
        />
      </div>
    </div>
  );
};

export default Escrow;
