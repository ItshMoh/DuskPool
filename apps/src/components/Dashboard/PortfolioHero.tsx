import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PortfolioHeroProps {
  totalValue: number;
  totalAvailable: number;
  totalLocked: number;
  hideBalances: boolean;
  formatBalance: (value: number) => string;
  timeframe: string;
  setTimeframe: (tf: string) => void;
}

export const PortfolioHero: React.FC<PortfolioHeroProps> = ({
  totalValue,
  totalAvailable,
  totalLocked,
  hideBalances,
  formatBalance,
  timeframe,
  setTimeframe,
}) => {
  // Mock portfolio chart data
  const portfolioData = [
    { day: 'Mon', value: totalValue * 0.95 },
    { day: 'Tue', value: totalValue * 0.97 },
    { day: 'Wed', value: totalValue * 0.96 },
    { day: 'Thu', value: totalValue * 0.98 },
    { day: 'Fri', value: totalValue * 0.99 },
    { day: 'Sat', value: totalValue * 1.0 },
    { day: 'Sun', value: totalValue },
  ];

  const maxValue = Math.max(...portfolioData.map(d => d.value)) || 1;
  const minValue = Math.min(...portfolioData.map(d => d.value)) || 0;

  const dayChange = totalValue * 0.02;
  const dayChangePercent = 2.0;

  return (
    <div className="relative mb-6 p-6 bg-gradient-to-br from-zinc-900/80 via-zinc-900/50 to-brand-stellar/5 border border-white/10 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-stellar/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 blur-2xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              Total Escrow Balance
              <span className="px-1.5 py-0.5 bg-brand-stellar/20 text-brand-stellar text-[8px]">PRIVATE</span>
            </p>
            <div className="flex items-baseline gap-4">
              <h2 className="text-5xl md:text-6xl font-oswald text-white tracking-tight">
                {hideBalances ? '$••••••' : formatBalance(totalValue)}
              </h2>
              {totalValue > 0 && (
                <div className={`flex items-center gap-1.5 px-2 py-1 ${dayChange >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'} border`}>
                  {dayChange >= 0 ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
                  <span className={`text-sm font-mono ${dayChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {dayChange >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Available</p>
              <p className="text-lg font-mono text-white">{formatBalance(totalAvailable)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Locked</p>
              <p className="text-lg font-mono text-yellow-400">{formatBalance(totalLocked)}</p>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        {totalValue > 0 && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500">Performance</span>
              <div className="flex bg-black/40 p-0.5 border border-white/5">
                {['24H', '7D', '30D', 'ALL'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 text-[10px] font-bold transition-all ${
                      timeframe === tf ? 'bg-brand-stellar text-white' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative h-32">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                {[25, 50, 75].map(y => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="white" strokeOpacity="0.03" />
                ))}

                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7d00ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#7d00ff" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <path
                  d={`
                    M 0 ${100 - ((portfolioData[0].value - minValue) / (maxValue - minValue || 1)) * 70 - 15}
                    ${portfolioData.map((d, i) => {
                      const x = (i / (portfolioData.length - 1)) * 100;
                      const y = 100 - ((d.value - minValue) / (maxValue - minValue || 1)) * 70 - 15;
                      return `L ${x} ${y}`;
                    }).join(' ')}
                    L 100 100 L 0 100 Z
                  `}
                  fill="url(#portfolioGradient)"
                />

                <path
                  d={`
                    M 0 ${100 - ((portfolioData[0].value - minValue) / (maxValue - minValue || 1)) * 70 - 15}
                    ${portfolioData.map((d, i) => {
                      const x = (i / (portfolioData.length - 1)) * 100;
                      const y = 100 - ((d.value - minValue) / (maxValue - minValue || 1)) * 70 - 15;
                      return `L ${x} ${y}`;
                    }).join(' ')}
                  `}
                  fill="none"
                  stroke="#7d00ff"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-gray-600 font-mono">
                {portfolioData.map((d, i) => (
                  <span key={i}>{d.day}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
