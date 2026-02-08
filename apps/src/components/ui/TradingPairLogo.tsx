import React from 'react';
import { AssetLogo } from './AssetLogo';

interface TradingPairLogoProps {
  baseSymbol: string;
  baseTokenAddress?: string;
  quoteSymbol?: string;
  quoteTokenAddress?: string;
  size?: 'xs' | 'sm' | 'md';
}

/**
 * Displays overlapping circular logos for trading pairs (e.g., PAXG/USDC)
 * Base asset is in front, quote asset is behind and offset
 */
export const TradingPairLogo: React.FC<TradingPairLogoProps> = ({
  baseSymbol,
  baseTokenAddress,
  quoteSymbol = 'USDC',
  quoteTokenAddress,
  size = 'sm',
}) => {
  return (
    <div className="flex items-center -space-x-2">
      <AssetLogo
        symbol={baseSymbol}
        tokenAddress={baseTokenAddress}
        size={size}
        className="ring-2 ring-zinc-900 z-10"
      />
      <AssetLogo
        symbol={quoteSymbol}
        tokenAddress={quoteTokenAddress}
        size={size}
        className="ring-2 ring-zinc-900 z-0"
      />
    </div>
  );
};

export default TradingPairLogo;
