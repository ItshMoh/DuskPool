import React from 'react';

// Status Badge variants
type StatusVariant = 'open' | 'partial' | 'filled' | 'cancelled' | 'pending' | 'completed';

const STATUS_STYLES: Record<StatusVariant, string> = {
  open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  partial: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  filled: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
};

interface StatusBadgeProps {
  status: StatusVariant;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  return (
    <span className={`px-2 py-1 text-[10px] uppercase font-bold border ${STATUS_STYLES[status]} ${className}`}>
      {status}
    </span>
  );
};

// Side Badge (Buy/Sell)
type SideVariant = 'buy' | 'sell';

interface SideBadgeProps {
  side: SideVariant;
  showBackground?: boolean;
  className?: string;
}

export const SideBadge: React.FC<SideBadgeProps> = ({ side, showBackground = false, className = '' }) => {
  const baseStyles = side === 'buy' ? 'text-emerald-500' : 'text-rose-500';
  const bgStyles = showBackground
    ? side === 'buy'
      ? 'bg-emerald-500/10 border border-emerald-500/30 px-2 py-1'
      : 'bg-rose-500/10 border border-rose-500/30 px-2 py-1'
    : '';

  return (
    <span className={`text-xs font-bold uppercase ${baseStyles} ${bgStyles} ${className}`}>
      {side}
    </span>
  );
};

// Generic colored badge
type ColorVariant = 'purple' | 'green' | 'red' | 'yellow' | 'blue' | 'gray';

const COLOR_STYLES: Record<ColorVariant, string> = {
  purple: 'bg-brand-stellar/20 text-brand-stellar border-brand-stellar/30',
  green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  red: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

interface BadgeProps {
  children: React.ReactNode;
  color?: ColorVariant;
  size?: 'xs' | 'sm';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'purple', size = 'xs', className = '' }) => {
  const sizeStyles = size === 'xs' ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-1 text-[10px]';

  return (
    <span className={`uppercase font-bold border ${COLOR_STYLES[color]} ${sizeStyles} ${className}`}>
      {children}
    </span>
  );
};
