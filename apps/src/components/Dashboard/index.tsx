import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Lock, Activity, Shield,
  BarChart3, PieChart, Zap, Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { useSettlement } from '../../hooks/useSettlement';
import { useRegistry } from '../../hooks/useRegistry';
import { formatBigint, getAssetColor } from '../../utils';

import { PortfolioHero } from './PortfolioHero';
import { AssetGrid } from './AssetGrid';
import { ActivityFeed } from './ActivityFeed';
import { QuickActions } from './QuickActions';

import {
  Badge, IconButton,
  Card, StatCard,
  LoadingState, EmptyState,
  SectionHeader,
} from '../ui';

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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected } = useWallet();
  const { getEscrowBalance, getLockedBalance, getAvailableBalance, getSettlements } = useSettlement();
  const { getActiveAssets } = useRegistry();

  const [timeframe, setTimeframe] = useState('7D');
  const [hideBalances, setHideBalances] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [openOrders, setOpenOrders] = useState<{ asset: string }[]>([]);
  const [recentActivity, setRecentActivity] = useState<{
    id: number;
    type: string;
    asset: string;
    amount: string;
    received: string;
    time: string;
    status: string;
    hash: string;
  }[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [totalLocked, setTotalLocked] = useState(0);

  const loadDashboardData = useCallback(async () => {
    if (!isConnected || !address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const registeredAssets = await getActiveAssets();

      const assetDataPromises = registeredAssets.map(async (asset) => {
        const escrowBal = await getEscrowBalance(asset.token_address);
        const escrowBalance = formatBigint(escrowBal);
        const price = 1.0;
        const balance = escrowBalance * price;

        return {
          symbol: asset.symbol,
          name: asset.symbol,
          tokenAddress: asset.token_address,
          balance,
          escrowBalance,
          holdings: escrowBalance,
          price,
          change: 0,
          color: getAssetColor(asset.symbol),
          percentage: 0,
          sparkline: [price, price, price, price, price, price, price],
          icon: asset.symbol[0],
        };
      });

      const assetData = await Promise.all(assetDataPromises);

      const total = assetData.reduce((sum, a) => sum + a.balance, 0);
      const assetsWithPercentage = assetData.map(a => ({
        ...a,
        percentage: total > 0 ? Math.round((a.balance / total) * 100) : 0,
      }));

      setAssets(assetsWithPercentage);
      setTotalValue(total);

      let available = 0;
      let locked = 0;
      for (const asset of registeredAssets) {
        const avail = formatBigint(await getAvailableBalance(asset.token_address));
        const lock = formatBigint(await getLockedBalance(asset.token_address));
        available += avail;
        locked += lock;
      }
      setTotalAvailable(available);
      setTotalLocked(locked);

      try {
        const settlements = await getSettlements();
        const activityItems = settlements.slice(0, 4).map((s, i) => ({
          id: i,
          type: 'trade',
          asset: 'RWA',
          amount: `${formatBigint(s.quantity).toFixed(2)}`,
          received: `${formatBigint(s.price).toFixed(2)} USDC`,
          time: 'Recent',
          status: 'completed',
          hash: `0x${Buffer.from(s.match_id).toString('hex').slice(0, 8)}...`,
        }));
        setRecentActivity(activityItems);
      } catch (err) {
        console.error('Failed to load settlements:', err);
        setRecentActivity([]);
      }

      setOpenOrders([]);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, getActiveAssets, getEscrowBalance, getLockedBalance, getAvailableBalance, getSettlements]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatBalance = (value: number) => {
    if (hideBalances) return '••••••';
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!isConnected) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <EmptyState
          icon={Wallet}
          title="Connect your wallet to view your portfolio"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingState message="Loading portfolio..." size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full h-full px-4 md:px-6 py-4 animate-fade-in-up overflow-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-condensed font-bold text-white uppercase tracking-wide">Portfolio</h1>
            <IconButton
              onClick={() => setHideBalances(!hideBalances)}
              icon={hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            />
            <IconButton
              onClick={loadDashboardData}
              icon={<RefreshCw className="w-4 h-4" />}
            />
          </div>
          <p className="text-xs text-gray-500">Manage your RWA positions and track performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">Synced</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 border border-white/10 bg-white/5">
            <Shield className="w-3 h-3 text-brand-stellar" />
            <span className="text-[10px] text-white/60 uppercase tracking-wider">ZK Protected</span>
          </div>
        </div>
      </div>

      {/* Portfolio Value Hero */}
      <PortfolioHero
        totalValue={totalValue}
        totalAvailable={totalAvailable}
        totalLocked={totalLocked}
        hideBalances={hideBalances}
        formatBalance={formatBalance}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
      />

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Assets Section */}
        <div className="col-span-12 lg:col-span-8">
          <SectionHeader
            icon={PieChart}
            title="Your Assets"
            action={{ label: 'Deposit', onClick: () => navigate('/escrow') }}
          />

          <AssetGrid
            assets={assets}
            formatBalance={formatBalance}
            onDeposit={() => navigate('/escrow')}
            onTrade={() => navigate('/trade')}
          />

          {/* Open Orders */}
          <Card className="mt-4">
            <SectionHeader
              icon={BarChart3}
              title="Open Orders"
              badge={<Badge color="purple">{openOrders.length}</Badge>}
              action={{ label: 'View All', onClick: () => navigate('/history') }}
            />

            {openOrders.length > 0 ? (
              <div className="space-y-2">
                {openOrders.map((order, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-black/30 border border-white/5">
                    <span className="text-sm text-white">{order.asset}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No open orders" className="py-8" />
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <QuickActions
            onTrade={() => navigate('/trade')}
            onDeposit={() => navigate('/escrow')}
          />

          <ActivityFeed
            activities={recentActivity}
            onViewAll={() => navigate('/history')}
          />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              icon={Activity}
              iconColor="text-emerald-500"
              label="Active"
              value={openOrders.length}
              description="Open orders"
            />
            <StatCard
              icon={Lock}
              iconColor="text-yellow-500"
              label="Locked"
              value={formatBalance(totalLocked).replace('$', '')}
              description="In orders"
            />
            <StatCard
              icon={Zap}
              iconColor="text-brand-stellar"
              label="Assets"
              value={assets.length}
              description="In escrow"
            />
            <StatCard
              icon={Shield}
              iconColor="text-brand-stellar"
              label="Trades"
              value={recentActivity.length}
              description="Settlements"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
