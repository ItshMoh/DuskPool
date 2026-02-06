import React from 'react';
import { ArrowDownUp, Shield, Lock, Unlock, RefreshCw } from 'lucide-react';
import { Button, IconButton, ErrorAlert, SuccessAlert, WarningAlert } from '../ui';
import { AssetBalance } from './types';
import { AssetSelector } from './AssetSelector';
import { AmountInput } from './AmountInput';

interface TransferFormProps {
  mode: 'deposit' | 'withdraw';
  amount: string;
  assets: AssetBalance[];
  selectedAsset: string;
  currentAsset: AssetBalance | undefined;
  isLoadingAssets: boolean;
  showAssetSelect: boolean;
  txLoading: boolean;
  txError: string | null;
  submitStatus: 'idle' | 'success' | 'error';
  maxAmount: bigint;
  amountBigint: bigint;
  usdValue: number;
  onToggleMode: () => void;
  onAmountChange: (value: string) => void;
  onMaxClick: () => void;
  onToggleAssetSelect: () => void;
  onSelectAsset: (tokenAddress: string) => void;
  onSubmit: () => void;
  onRefresh: () => void;
}

export const TransferForm: React.FC<TransferFormProps> = ({
  mode,
  amount,
  assets,
  selectedAsset,
  currentAsset,
  isLoadingAssets,
  showAssetSelect,
  txLoading,
  txError,
  submitStatus,
  maxAmount,
  amountBigint,
  usdValue,
  onToggleMode,
  onAmountChange,
  onMaxClick,
  onToggleAssetSelect,
  onSelectAsset,
  onSubmit,
  onRefresh,
}) => {
  return (
    <div className="relative">
      {/* Accent Border */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-brand-stellar via-brand-stellar/50 to-transparent"></div>

      <div className="bg-zinc-900/60 border border-white/5 ml-[2px]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-brand-stellar/30 bg-brand-stellar/10 flex items-center justify-center">
              {mode === 'deposit' ? <Lock className="w-4 h-4 text-brand-stellar" /> : <Unlock className="w-4 h-4 text-brand-stellar" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {mode === 'deposit' ? 'Deposit' : 'Withdraw'}
              </h2>
              <p className="text-[10px] text-gray-500">
                {mode === 'deposit' ? 'Lock funds in escrow' : 'Unlock available balance'}
              </p>
            </div>
          </div>
          <IconButton
            onClick={onRefresh}
            disabled={isLoadingAssets}
            icon={<RefreshCw className={`w-4 h-4 ${isLoadingAssets ? 'animate-spin' : ''}`} />}
          />
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Asset Selector */}
          <div className="relative">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block">Select Asset</label>
            <AssetSelector
              assets={assets}
              selectedAsset={selectedAsset}
              currentAsset={currentAsset}
              mode={mode}
              isLoading={isLoadingAssets}
              showDropdown={showAssetSelect}
              onToggleDropdown={onToggleAssetSelect}
              onSelectAsset={onSelectAsset}
            />
          </div>

          {/* Amount Input */}
          <AmountInput
            amount={amount}
            symbol={currentAsset?.symbol || ''}
            usdValue={usdValue}
            onChange={onAmountChange}
            onMax={onMaxClick}
          />

          {/* Mode Toggle */}
          <div className="flex justify-center py-1">
            <button
              onClick={onToggleMode}
              className="w-10 h-10 bg-zinc-800/80 border border-white/10 flex items-center justify-center hover:border-brand-stellar/30 hover:bg-brand-stellar/5 transition-all group"
            >
              <ArrowDownUp className="w-4 h-4 text-gray-500 group-hover:text-brand-stellar transition-colors" />
            </button>
          </div>

          {/* Destination */}
          <div className="p-4 bg-black/30 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center border border-white/10 bg-brand-stellar/10">
                  {mode === 'deposit' ? <Lock className="w-4 h-4 text-brand-stellar" /> : <Unlock className="w-4 h-4 text-brand-stellar" />}
                </div>
                <div>
                  <p className="text-white font-bold">{mode === 'deposit' ? 'Escrow Vault' : 'Your Wallet'}</p>
                  <p className="text-[10px] text-gray-500">
                    {mode === 'deposit' ? 'ZK-protected' : 'External'}
                  </p>
                </div>
              </div>
              <p className="text-xl font-oswald text-white">{amount || '0'}</p>
            </div>
          </div>

          {/* Info */}
          <div className="flex justify-between text-xs py-2">
            <span className="text-gray-600">Network Fee</span>
            <span className="text-gray-400 font-mono">~0.00001 XLM</span>
          </div>

          {/* Error Display */}
          {(txError || submitStatus === 'error') && (
            <ErrorAlert>
              {txError || 'Transaction failed. Please try again.'}
            </ErrorAlert>
          )}

          {/* Success Display */}
          {submitStatus === 'success' && (
            <SuccessAlert>
              {mode === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!
            </SuccessAlert>
          )}

          {/* Warning for Withdraw */}
          {mode === 'withdraw' && amountBigint > 0 && submitStatus === 'idle' && (
            <WarningAlert>
              Only unlocked funds can be withdrawn. Funds locked in orders must be released first.
            </WarningAlert>
          )}

          {/* Submit Button */}
          <Button
            onClick={onSubmit}
            disabled={!currentAsset || amountBigint <= 0 || amountBigint > maxAmount}
            isLoading={txLoading}
            fullWidth
            size="lg"
          >
            {txLoading ? 'Processing...' : mode === 'deposit' ? 'Deposit' : 'Withdraw'}
          </Button>

          {/* Security Footer */}
          <div className="flex items-center justify-center gap-2 opacity-30">
            <Shield className="w-3 h-3" />
            <span className="text-[9px] uppercase tracking-wider">Protocol 25 Secured</span>
          </div>
        </div>
      </div>
    </div>
  );
};
