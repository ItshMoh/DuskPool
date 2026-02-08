import React from 'react';
import { Wallet, ArrowRight } from 'lucide-react';
import { Sparkline } from './Sparkline';
import { Card, EmptyState, Button, AssetLogo } from '../ui';

interface AssetData {
  symbol: string;
  name: string;
  tokenAddress: string;
  balance: number;
  escrowBalance: number;
  holdings: number;
  price: number;
  change: number;
  color: string;
  percentage: number;
  sparkline: number[];
  icon: string;
}

interface AssetGridProps {
  assets: AssetData[];
  formatBalance: (value: number) => string;
  onDeposit: () => void;
  onTrade: () => void;
}

export const AssetGrid: React.FC<AssetGridProps> = ({
  assets,
  formatBalance,
  onDeposit,
  onTrade,
}) => {
  if (assets.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Wallet}
          title="No assets in escrow"
          description="Deposit assets to start trading"
          action={
            <Button variant="ghost" onClick={onDeposit}>
              Deposit Now
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {assets.map(asset => (
        <div
          key={asset.tokenAddress}
          className="group relative p-4 bg-zinc-900/50 border border-white/5 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
          onClick={onTrade}
        >
          <div
            className="absolute top-0 left-0 w-full h-0.5"
            style={{ backgroundColor: asset.color, opacity: 0.5 }}
          />

          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <AssetLogo
                symbol={asset.symbol}
                tokenAddress={asset.tokenAddress}
                size="sm"
              />
              <div>
                <p className="text-sm font-bold text-white">{asset.symbol}</p>
                <p className="text-[10px] text-gray-500">{asset.name}</p>
              </div>
            </div>
            <Sparkline
              data={asset.sparkline}
              color={asset.change >= 0 ? '#10b981' : '#f43f5e'}
              positive={asset.change >= 0}
            />
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-lg font-mono text-white">{formatBalance(asset.balance)}</p>
              <p className="text-[10px] text-gray-500 font-mono">{asset.holdings.toFixed(2)} {asset.symbol}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 font-mono">${asset.price.toLocaleString()}</p>
              <p className={`text-[10px] font-mono ${asset.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
              <span>Portfolio allocation</span>
              <span>{asset.percentage}%</span>
            </div>
            <div className="h-1 bg-white/5 w-full overflow-hidden">
              <div
                className="h-full transition-all"
                style={{ width: `${asset.percentage}%`, backgroundColor: asset.color, opacity: 0.7 }}
              />
            </div>
          </div>

          <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-white/0 group-hover:text-white/40 transition-all transform translate-x-2 group-hover:translate-x-0" />
        </div>
      ))}
    </div>
  );
};
