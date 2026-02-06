import React from 'react';
import type { LucideIcon } from 'lucide-react';

// Base Card/Panel component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING_STYLES = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
}) => {
  const variantStyles = variant === 'glass'
    ? 'glass-panel'
    : 'bg-zinc-900/50 border border-white/5';

  return (
    <div className={`${variantStyles} ${PADDING_STYLES[padding]} ${className}`}>
      {children}
    </div>
  );
};

// Stat Card - displays a metric with icon, label, and value
interface StatCardProps {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  value: string | number;
  description?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  iconColor = 'text-brand-stellar',
  label,
  value,
  description,
  className = '',
}) => {
  return (
    <div className={`p-3 bg-zinc-900/50 border border-white/5 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-3 h-3 ${iconColor}`} />
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-oswald text-white">{value}</p>
      {description && <p className="text-[10px] text-gray-600">{description}</p>}
    </div>
  );
};

// Info Card - displays information with icon, title, and content
interface InfoCardProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  content: React.ReactNode;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  icon: Icon,
  iconColor = 'text-brand-stellar',
  title,
  content,
  className = '',
}) => {
  return (
    <div className={`p-4 bg-zinc-900/50 border border-white/5 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h4 className="text-sm font-bold text-white uppercase tracking-wide">{title}</h4>
      </div>
      <div className="text-sm text-gray-400">{content}</div>
    </div>
  );
};

// Clickable Card with hover effects
interface ClickableCardProps extends CardProps {
  onClick?: () => void;
  accentColor?: string;
}

export const ClickableCard: React.FC<ClickableCardProps> = ({
  children,
  onClick,
  accentColor,
  className = '',
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        group relative bg-zinc-900/50 border border-white/5 hover:border-white/20
        transition-all cursor-pointer overflow-hidden
        ${className}
      `}
      {...props}
    >
      {accentColor && (
        <div
          className="absolute top-0 left-0 w-full h-0.5"
          style={{ backgroundColor: accentColor, opacity: 0.5 }}
        />
      )}
      {children}
    </div>
  );
};
