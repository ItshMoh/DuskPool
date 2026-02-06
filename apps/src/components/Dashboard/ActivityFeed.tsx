import React from 'react';
import { Activity, ArrowRight, Clock } from 'lucide-react';
import { Card, SectionHeader, EmptyState } from '../ui';

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
              <div className="w-8 h-8 flex items-center justify-center border shrink-0 border-emerald-500/30 bg-emerald-500/10">
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-400">{activity.type}</span>
                  <span className="text-xs font-bold text-white">{activity.asset}</span>
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
