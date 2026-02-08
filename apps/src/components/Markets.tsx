import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, TrendingUp, TrendingDown, Search,
  ArrowRight, Activity, Globe, Lock, Verified,
  ChevronDown, Star, Filter, Loader, RefreshCw
} from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useRegistry } from '../hooks/useRegistry';
import { AssetLogo } from './ui';

// Sparkline component
const Sparkline: React.FC<{ data: number[]; positive: boolean }> = ({ data, positive }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const color = positive ? '#10b981' : '#f43f5e';

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 80;
    const y = 24 - ((v - min) / range) * 20;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="80" height="28" className="overflow-visible">
      <defs>
        <linearGradient id={`spark-grad-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,24 ${points} 80,24`}
        fill={`url(#spark-grad-${positive})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Asset colors for display
const ASSET_COLORS: Record<string, string> = {
  'USDC': '#10b981',
  'TBILL': '#6366f1',
  'PAXG': '#eab308',
  'REALT': '#8b5cf6',
  'DEFAULT': '#7d00ff',
};

const ASSET_TYPE_NAMES: Record<number, string> = {
  0: 'Treasury Bond',
  1: 'Corporate Bond',
  2: 'Municipal Bond',
  3: 'Equity',
  4: 'Real Estate',
  5: 'Commodity',
  6: 'Other',
};

interface AssetDisplay {
  id: string;
  symbol: string;
  name: string;
  type: string;
  tokenAddress: string;
  price: number;
  change24h: number;
  color: string;
  icon: string;
  sparkline: number[];
  verified: boolean;
  isActive: boolean;
}

const Markets: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const { getActiveAssets } = useRegistry();

  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState<AssetDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    try {
      const registeredAssets = await getActiveAssets();

      const assetData: AssetDisplay[] = registeredAssets.map((asset) => ({
        id: asset.token_address,
        symbol: asset.symbol,
        name: asset.symbol,
        type: ASSET_TYPE_NAMES[asset.asset_type] || 'Other',
        tokenAddress: asset.token_address,
        price: 1.0, // Mock price
        change24h: 0,
        color: ASSET_COLORS[asset.symbol] || ASSET_COLORS['DEFAULT'],
        icon: asset.symbol[0],
        sparkline: [1, 1, 1, 1, 1, 1, 1],
        verified: true,
        isActive: asset.is_active,
      }));

      setAssets(assetData);
    } catch (err) {
      console.error('Failed to load assets:', err);
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  }, [getActiveAssets]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || selectedType === 'All' || asset.type === selectedType;
    return matchesSearch && matchesType;
  });

  const assetTypes = ['All', ...new Set(assets.map(a => a.type))];

  return (
    <div className="w-full min-h-screen relative px-4 md:px-6 py-6 overflow-auto">

      {/* Background */}
      <div className="fixed inset-0 bg-black z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-stellar/5 blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] pointer-events-none"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-condensed font-bold text-white uppercase tracking-tight">
                Supported Assets
              </h1>
              <span className="px-2 py-1 bg-brand-stellar/20 text-brand-stellar text-[10px] font-bold uppercase">
                {assets.length} Assets
              </span>
              <button
                onClick={loadAssets}
                className="p-1.5 hover:bg-white/10 transition-colors text-gray-500 hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-sm text-gray-500">Trade tokenized real-world assets with zero-knowledge privacy</p>
          </div>

          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Registry</p>
              <p className="text-xl font-oswald text-white">{assets.length} Assets</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Active</p>
              <p className="text-xl font-oswald text-emerald-400">{assets.filter(a => a.isActive).length}</p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-stellar/50"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {assetTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type === 'All' ? null : type)}
                className={`px-3 py-2 text-xs font-medium transition-all ${
                  (type === 'All' && !selectedType) || selectedType === type
                    ? 'bg-brand-stellar text-white'
                    : 'bg-zinc-900/50 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Asset Registry Table */}
        <div className="bg-zinc-900/50 border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-stellar" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Asset Registry</h3>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <Lock className="w-3 h-3" />
              <span>All trades ZK-protected</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 text-brand-stellar animate-spin" />
              <span className="ml-2 text-gray-500">Loading assets from registry...</span>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-8 h-8 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No registered assets found</p>
              {!isConnected && (
                <p className="text-sm text-gray-600 mt-2">Connect your wallet to view assets</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/5 bg-black/20">
                    <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-normal tracking-wider">Asset</th>
                    <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-normal tracking-wider">Type</th>
                    <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-normal tracking-wider">Price</th>
                    <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-normal tracking-wider">7d Chart</th>
                    <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-normal tracking-wider">Contract</th>
                    <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-normal tracking-wider">Status</th>
                    <th className="py-3 px-4 text-[10px] text-gray-500 uppercase font-normal tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAssets.map(asset => (
                    <tr key={asset.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <AssetLogo
                            symbol={asset.symbol}
                            tokenAddress={asset.tokenAddress}
                            size="md"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{asset.symbol}</span>
                              {asset.verified && <Verified className="w-3 h-3 text-brand-stellar" />}
                            </div>
                            <span className="text-[10px] text-gray-500">{asset.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs px-2 py-1 bg-white/5 text-gray-400">{asset.type}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-mono text-white">${asset.price.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Sparkline data={asset.sparkline} positive={asset.change24h >= 0} />
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[10px] text-gray-500 font-mono">
                          {asset.tokenAddress.slice(0, 8)}...{asset.tokenAddress.slice(-4)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] px-2 py-1 ${asset.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {asset.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => navigate('/trade')}
                          className="px-3 py-1.5 bg-brand-stellar/20 text-brand-stellar text-[10px] font-bold uppercase hover:bg-brand-stellar/30 transition-colors"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bottom Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-900/50 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-brand-stellar" />
              <h4 className="text-xs font-bold text-white uppercase">Verified Assets</h4>
            </div>
            <p className="text-[10px] text-gray-500">All listed assets undergo rigorous verification including proof of reserves, regulatory compliance, and smart contract audits.</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-brand-stellar" />
              <h4 className="text-xs font-bold text-white uppercase">ZK Privacy</h4>
            </div>
            <p className="text-[10px] text-gray-500">Every trade is protected by zero-knowledge proofs, ensuring your positions and trading activity remain confidential.</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-brand-stellar" />
              <h4 className="text-xs font-bold text-white uppercase">Real-Time Settlement</h4>
            </div>
            <p className="text-[10px] text-gray-500">Instant atomic settlement on Stellar ensures your trades execute without counterparty risk or settlement delays.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Markets;
