import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, LoadingState, EmptyState, AssetLogo } from '../ui';
import { AssetBalance } from './types';
import { formatAmount } from '../../utils';

interface AssetSelectorProps {
  assets: AssetBalance[];
  selectedAsset: string;
  currentAsset: AssetBalance | undefined;
  mode: 'deposit' | 'withdraw';
  isLoading: boolean;
  showDropdown: boolean;
  onToggleDropdown: () => void;
  onSelectAsset: (tokenAddress: string) => void;
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({
  assets,
  selectedAsset,
  currentAsset,
  mode,
  isLoading,
  showDropdown,
  onToggleDropdown,
  onSelectAsset,
}) => {
  if (isLoading) {
    return (
      <Card padding="md">
        <LoadingState message="Loading assets..." size="sm" />
      </Card>
    );
  }

  if (assets.length === 0) {
    return (
      <Card padding="md">
        <EmptyState title="No registered assets found" className="py-4" />
      </Card>
    );
  }

  return (
    <div className="relative">
      <div
        onClick={onToggleDropdown}
        className="flex items-center justify-between p-4 bg-black/30 border border-white/5 cursor-pointer hover:border-white/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <AssetLogo
            symbol={currentAsset?.symbol || '?'}
            tokenAddress={currentAsset?.tokenAddress}
            size="md"
          />
          <div>
            <p className="text-white font-bold">{currentAsset?.symbol || 'Select'}</p>
            <p className="text-[10px] text-gray-500 font-mono">
              {mode === 'deposit' ? 'Wallet' : 'Available'}: {currentAsset ? formatAmount(mode === 'deposit' ? currentAsset.walletBalance : currentAsset.availableBalance, currentAsset.decimals) : '0'}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 z-10">
          {assets.map(asset => (
            <div
              key={asset.tokenAddress}
              onClick={() => onSelectAsset(asset.tokenAddress)}
              className={`flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors ${
                asset.tokenAddress === selectedAsset ? 'bg-brand-stellar/10' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <AssetLogo
                  symbol={asset.symbol}
                  tokenAddress={asset.tokenAddress}
                  size="sm"
                />
                <div>
                  <p className="text-sm text-white font-bold">{asset.symbol}</p>
                  <p className="text-[10px] text-gray-500">{asset.name}</p>
                </div>
              </div>
              <p className="text-xs text-white font-mono">
                {formatAmount(mode === 'deposit' ? asset.walletBalance : asset.availableBalance, asset.decimals)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
