import React from 'react';

interface AmountInputProps {
  amount: string;
  symbol: string;
  usdValue: number;
  onChange: (value: string) => void;
  onMax: () => void;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  amount,
  symbol,
  usdValue,
  onChange,
  onMax,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      onChange(val);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] text-gray-500 uppercase tracking-wider">Amount</label>
        <button
          onClick={onMax}
          className="text-[10px] font-bold text-brand-stellar hover:text-white transition-colors uppercase tracking-wider"
        >
          Max
        </button>
      </div>
      <div className="relative">
        <input
          type="text"
          value={amount}
          onChange={handleChange}
          placeholder="0.00"
          className="w-full bg-black/30 border border-white/5 px-4 py-4 text-white font-mono text-xl focus:outline-none focus:border-brand-stellar/30 transition-colors"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">{symbol}</span>
      </div>
      <p className="text-[10px] text-gray-600 mt-1.5 text-right font-mono">
        ≈ ${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
};
