import React from 'react';
import { ChevronDown, Loader, AlertCircle } from 'lucide-react';
import type { AssetOption } from './types';
import { OrderProgressBar, OrderProgress } from './OrderProgress';

interface OrderFormProps {
  selectedAsset: AssetOption | null;
  orderSide: 'buy' | 'sell';
  setOrderSide: (side: 'buy' | 'sell') => void;
  amount: string;
  setAmount: (amount: string) => void;
  price: string;
  setPrice: (price: string) => void;
  isSubmitting: boolean;
  submitError: string | null;
  isConnected: boolean;
  onSubmit: () => void;
  noMatchWarning?: string | null;
  orderProgress: OrderProgress;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  selectedAsset,
  orderSide,
  setOrderSide,
  amount,
  setAmount,
  price,
  setPrice,
  isSubmitting,
  submitError,
  isConnected,
  onSubmit,
  noMatchWarning,
  orderProgress,
}) => {
  const total = amount && price ? (parseFloat(amount) * parseFloat(price)).toLocaleString() : '0.00';

  return (
    <div className="bg-black border border-white/10 p-3 shadow-2xl relative overflow-hidden shrink-0">
      {/* ZK Background effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-stellar/10 blur-3xl pointer-events-none"></div>

      {/* Buy/Sell Tabs */}
      <div className="grid grid-cols-2 gap-1 bg-white/5 p-1 mb-3">
        <button
          onClick={() => setOrderSide('buy')}
          className={`py-2 text-xs font-bold uppercase tracking-wider transition-all ${
            orderSide === 'buy' ? 'bg-emerald-600/80 text-white shadow-lg' : 'text-gray-500 hover:text-white'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setOrderSide('sell')}
          className={`py-2 text-xs font-bold uppercase tracking-wider transition-all ${
            orderSide === 'sell' ? 'bg-rose-600/80 text-white shadow-lg' : 'text-gray-500 hover:text-white'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Order Type */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400">Order Type</span>
        <button className="text-xs text-brand-stellar font-bold flex items-center gap-1 hover:text-white transition-colors">
          Limit (ZK) <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Inputs */}
      <div className="space-y-2">
        <div className="bg-white/5 border border-white/10 px-3 py-2">
          <div className="flex justify-between text-[10px] text-gray-500 uppercase mb-1">
            <span>Price</span>
            <span>USDC</span>
          </div>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-transparent text-white font-mono text-sm focus:outline-none"
          />
        </div>
        <div className="bg-white/5 border border-white/10 px-3 py-2">
          <div className="flex justify-between text-[10px] text-gray-500 uppercase mb-1">
            <span>Amount</span>
            <span>{selectedAsset?.symbol || 'ASSET'}</span>
          </div>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-transparent text-white font-mono text-sm focus:outline-none"
          />
        </div>

        {/* Slider */}
        <div className="py-2">
          <div className="h-1 bg-white/10 w-full relative">
            <div className="absolute left-0 top-0 h-full w-[40%] bg-brand-stellar"></div>
            <div className="absolute left-[40%] top-1/2 -translate-y-1/2 w-3 h-3 bg-white shadow cursor-pointer hover:scale-125 transition-transform"></div>
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-gray-600 font-mono">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-2 border-t border-white/10">
          <span className="text-xs text-gray-400">Total</span>
          <span className="text-sm font-mono text-white">${total}</span>
        </div>
      </div>

      {/* Error Messages */}
      {submitError && orderProgress.step !== 'error' && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 mt-3">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs text-red-400">{submitError}</span>
        </div>
      )}
      {noMatchWarning && (
        <div className="flex items-start gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 mt-3">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span className="text-xs text-amber-400">{noMatchWarning}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={isSubmitting || !isConnected || !selectedAsset}
        className={`w-full mt-3 py-3 font-bold text-sm uppercase tracking-wider text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
          orderSide === 'buy' ? 'bg-emerald-600/80 hover:bg-emerald-500/80' : 'bg-rose-600/80 hover:bg-rose-500/80'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader className="w-4 h-4 animate-spin" />
            Submitting...
          </span>
        ) : !isConnected ? (
          'Connect Wallet'
        ) : (
          `${orderSide} ${selectedAsset?.symbol || 'ASSET'}`
        )}
      </button>

      {/* Order Progress / ZK Badge */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <OrderProgressBar progress={orderProgress} />
      </div>
    </div>
  );
};
