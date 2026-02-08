import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { Card, SectionHeader, EmptyState, TradingPairLogo } from '../ui';

interface ActivityItem {
  id: number;
  type: string;
  asset: string;
  amount: string;
  received: string;
  time: string;
  status: string;
  hash: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  onViewAll: () => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, onViewAll }) => {
  return (
    <Card>
      <SectionHeader
        icon={Clock}
        title="Activity"
        action={{ label: 'See all', onClick: onViewAll }}
      />

      {activities.length === 0 ? (
        <EmptyState title="No recent activity" className="py-6" />
      ) : (
        <div className="space-y-1">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-white/5 transition-colors group">
              <TradingPairLogo
                baseSymbol={activity.asset}
                size="xs"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-400">{activity.type}</span>
                  <span className="text-xs font-bold text-white">{activity.asset}/USDC</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                  <span>{activity.amount}</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="text-gray-400">{activity.received}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-gray-600 block">{activity.time}</span>
                <span className="text-[10px] text-gray-700 font-mono">{activity.hash}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
