import React from 'react';
import { Settings, X } from 'lucide-react';
import type { ChartType, ChartTypeOption, Drawing } from './types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  timeframe: string;
  setTimeframe: (tf: string) => void;
  drawings: Drawing[];
  clearDrawings: () => void;
  chartTypeOptions: ChartTypeOption[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  chartType,
  setChartType,
  timeframe,
  setTimeframe,
  drawings,
  clearDrawings,
  chartTypeOptions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-md mx-4 shadow-2xl animate-fade-in-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-brand-stellar" /> Chart Settings
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* Chart Type */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Chart Type</label>
            <div className="grid grid-cols-4 gap-2">
              {chartTypeOptions.map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`py-2 text-xs font-medium transition-all ${
                    chartType === type
                      ? 'bg-brand-stellar text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Timeframe</label>
            <div className="grid grid-cols-6 gap-2">
              {['1m', '5m', '15m', '1H', '4H', '1D'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`py-2 text-xs font-medium transition-all ${
                    timeframe === tf
                      ? 'bg-brand-stellar text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Drawing Settings */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Drawing Tools</label>
            <div className="flex items-center justify-between py-2 px-3 bg-white/5">
              <span className="text-xs text-gray-300">Saved Drawings</span>
              <span className="text-xs font-mono text-brand-stellar">{drawings.length}</span>
            </div>
            {drawings.length > 0 && (
              <button
                onClick={() => { clearDrawings(); onClose(); }}
                className="w-full mt-2 py-2 text-xs font-medium bg-red-700/20 text-red-500 hover:bg-red-700/30 transition-colors"
              >
                Clear All Drawings
              </button>
            )}
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Privacy</label>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 px-3 bg-white/5">
                <span className="text-xs text-gray-300">ZK Proof Enabled</span>
                <div className="w-8 h-4 bg-brand-stellar/50 relative">
                  <div className="absolute right-0 top-0 w-4 h-4 bg-brand-stellar"></div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-white/5">
                <span className="text-xs text-gray-300">Hide Order Amounts</span>
                <div className="w-8 h-4 bg-white/20 relative">
                  <div className="absolute left-0 top-0 w-4 h-4 bg-gray-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-brand-stellar text-white hover:bg-brand-stellar/80 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
