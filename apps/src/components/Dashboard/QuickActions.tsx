import React from 'react';
import { BarChart3, Wallet } from 'lucide-react';

interface QuickActionsProps {
  onTrade: () => void;
  onDeposit: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onTrade, onDeposit }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={onTrade}
        className="p-4 bg-brand-stellar/20 border border-brand-stellar/30 hover:bg-brand-stellar/30 transition-all group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-stellar/0 via-brand-stellar/10 to-brand-stellar/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        <BarChart3 className="w-5 h-5 text-brand-stellar mb-2 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-bold text-white uppercase tracking-wider block">Trade</span>
        <span className="text-[10px] text-gray-400">Buy & Sell RWAs</span>
      </button>
      <button
        onClick={onDeposit}
        className="p-4 bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
      >
        <Wallet className="w-5 h-5 text-white/60 mb-2 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-bold text-white uppercase tracking-wider block">Deposit</span>
        <span className="text-[10px] text-gray-400">Add funds</span>
      </button>
    </div>
  );
};
