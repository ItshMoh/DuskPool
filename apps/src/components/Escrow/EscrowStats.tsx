import React from 'react';
import { Lock, Unlock, Zap } from 'lucide-react';
import { StatCard } from '../ui';

interface EscrowStatsProps {
  totalEscrow: number;
  totalAvailable: number;
  totalLocked: number;
}

export const EscrowStats: React.FC<EscrowStatsProps> = ({
  totalEscrow,
  totalAvailable,
  totalLocked,
}) => {
  const formatValue = (value: number) =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      <StatCard
        icon={Lock}
        iconColor="text-brand-stellar"
        label="Total in Escrow"
        value={formatValue(totalEscrow)}
      />
      <StatCard
        icon={Unlock}
        iconColor="text-green-500"
        label="Available to Withdraw"
        value={formatValue(totalAvailable)}
        className="[&>p]:text-green-400"
      />
      <StatCard
        icon={Zap}
        iconColor="text-yellow-500"
        label="Locked in Orders"
        value={formatValue(totalLocked)}
        className="[&>p]:text-yellow-400"
      />
    </div>
  );
};
