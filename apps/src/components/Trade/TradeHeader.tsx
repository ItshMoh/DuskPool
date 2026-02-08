import React from 'react';
import { ChevronDown, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { AssetOption, ChartType, ChartTypeOption } from './types';
import { TradingPairLogo } from '../ui';

interface TradeHeaderProps {
  assets: AssetOption[];
  selectedAsset: AssetOption | null;
  setSelectedAsset: (asset: AssetOption) => void;
  showAssetDropdown: boolean;
  setShowAssetDropdown: (show: boolean) => void;
  currentPrice: string;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  timeframe: string;
  setTimeframe: (tf: string) => void;
  chartTypeOptions: ChartTypeOption[];
  priceChange24h?: number; // Percentage change
  volume24h?: number; // Volume in USD
}

export const TradeHeader: React.FC<TradeHeaderProps> = ({
  assets,
  selectedAsset,
  setSelectedAsset,
  showAssetDropdown,
  setShowAssetDropdown,
  currentPrice,
  chartType,
  setChartType,
  timeframe,
  setTimeframe,
  chartTypeOptions,
  priceChange24h,
  volume24h,
}) => {
  // Format price change
  const formatPriceChange = (change: number | undefined) => {
    if (change === undefined || isNaN(change)) return '--';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  // Format volume
  const formatVolume = (vol: number | undefined) => {
    if (vol === undefined || isNaN(vol)) return '--';
    if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(2)}M`;
    if (vol >= 1_000) return `$${(vol / 1_000).toFixed(2)}K`;
    return `$${vol.toFixed(2)}`;
  };

  const changeColor = priceChange24h === undefined ? 'text-gray-500'
    : priceChange24h > 0 ? 'text-green-400'
    : priceChange24h < 0 ? 'text-red-400'
    : 'text-gray-400';

  const ChangeIcon = priceChange24h === undefined ? Minus
    : priceChange24h > 0 ? ArrowUpRight
    : priceChange24h < 0 ? ArrowDownRight
    : Minus;
  return (
    <div className="flex flex-wrap items-center justify-between mb-2 gap-3 p-3 bg-zinc-900/50 backdrop-blur-md border border-white/5 shrink-0">
      {/* Asset Info */}
      <div className="flex items-center gap-4">
        <TradingPairLogo
          baseSymbol={selectedAsset?.symbol || '?'}
          baseTokenAddress={selectedAsset?.address}
          size="sm"
        />
        <div className="relative">
          <button
            onClick={() => setShowAssetDropdown(!showAssetDropdown)}
            className="flex items-center gap-2 text-xl font-oswald font-bold text-white hover:text-brand-stellar transition-colors"
          >
            {selectedAsset?.symbol || 'Select Asset'} / USDC <ChevronDown className="w-4 h-4" />
          </button>
          {showAssetDropdown && assets.length > 0 && (
            <div className="absolute top-full left-0 mt-2 bg-zinc-900 border border-white/10 shadow-xl z-50 min-w-[200px]">
              {assets.map((asset) => (
                <button
                  key={asset.address}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setShowAssetDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${
                    selectedAsset?.address === asset.address ? 'bg-white/5 text-brand-stellar' : 'text-white'
                  }`}
                >
                  {asset.symbol}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="h-8 w-[1px] bg-white/10"></div>
        <div>
          <span className="text-2xl font-mono text-white font-medium">${currentPrice}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">24h Change</span>
          <span className={`text-xs font-mono ${changeColor} flex items-center`}>
            {formatPriceChange(priceChange24h)} <ChangeIcon className="w-3 h-3 ml-1" />
          </span>
        </div>
        <div className="flex-col hidden md:flex">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">24h Volume</span>
          <span className="text-xs font-mono text-white">{formatVolume(volume24h)}</span>
        </div>
      </div>

      {/* Chart Type + Timeframe Selector */}
      <div className="flex items-center gap-2">
        {/* Chart Type Selector */}
        <div className="flex bg-black/40 p-1 border border-white/5">
          {chartTypeOptions.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-3 py-1 text-[10px] font-bold hover:bg-white/10 transition-all ${
                chartType === type ? 'bg-white/10 text-brand-stellar' : 'text-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Timeframe Selector */}
        <div className="flex bg-black/40 p-1 border border-white/5">
          {['15m', '1H', '4H', '1D', '1W'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-[10px] font-bold hover:bg-white/10 transition-all ${
                timeframe === tf ? 'bg-white/10 text-brand-stellar' : 'text-gray-500'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
