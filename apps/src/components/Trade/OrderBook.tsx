import React from 'react';
import { BookOpen } from 'lucide-react';
import type { OrderBookData } from './types';

interface OrderBookRowProps {
  price: string;
  size: string;
  total: string;
  type: 'bid' | 'ask';
  depth: number;
}

const OrderBookRow: React.FC<OrderBookRowProps> = ({ price, size, total, type, depth }) => (
  <div className="relative grid grid-cols-3 text-[10px] py-0.5 hover:bg-white/10 cursor-pointer font-mono">
    <div
      className={`absolute top-0 bottom-0 ${type === 'bid' ? 'left-0' : 'right-0'} bg-emerald-600/10`}
      style={{ width: `${depth}%` }}
    />
    <span className={`relative z-10 ${type === 'bid' ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>{price}</span>
    <span className="relative z-10 text-gray-400 text-right">{size}</span>
    <span className={`relative z-10 text-right ${type === 'bid' ? 'text-emerald-500/50' : 'text-rose-500/50'}`}>{total}</span>
  </div>
);

interface OrderBookProps {
  data: OrderBookData;
  currentPrice: string;
}

export const OrderBook: React.FC<OrderBookProps> = ({ data, currentPrice }) => {
  return (
    <div className="flex-1 min-h-0 bg-zinc-900/50 backdrop-blur-sm border border-white/5 flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <BookOpen className="w-3 h-3" /> Pool Liquidity
        </span>
        <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5">0.05% Spread</span>
      </div>

      <div className="flex-1 flex flex-col relative">
        {/* Header Row */}
        <div className="grid grid-cols-3 px-4 py-2 text-[10px] text-gray-500 uppercase font-mono border-b border-white/5">
          <span>Price</span>
          <span className="text-right">Size</span>
          <span className="text-right">Total</span>
        </div>

        {/* Asks (Red) */}
        <div className="flex-1 overflow-hidden flex flex-col-reverse px-4 pb-2">
          {data.asks.slice(0, 8).map((item, i) => (
            <OrderBookRow
              key={i}
              type="ask"
              price={item.price.toFixed(2)}
              size={item.size.toString()}
              total={item.total.toString()}
              depth={(item.total / data.maxTotal) * 100}
            />
          ))}
        </div>

        {/* Spread Indicator */}
        <div className="py-2 bg-white/5 border-y border-white/10 flex items-center justify-center gap-2">
          <span className="text-lg font-mono text-white font-bold">{currentPrice}</span>
          <span className="text-xs text-gray-400">≈ ${currentPrice}</span>
        </div>

        {/* Bids (Green) */}
        <div className="flex-1 overflow-hidden px-4 pt-2">
          {data.bids.slice(0, 8).map((item, i) => (
            <OrderBookRow
              key={i}
              type="bid"
              price={item.price.toFixed(2)}
              size={item.size.toString()}
              total={item.total.toString()}
              depth={(item.total / data.maxTotal) * 100}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
