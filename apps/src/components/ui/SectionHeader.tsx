import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

// Section Header with icon and title
interface SectionHeaderProps {
  icon?: LucideIcon;
  iconColor?: string;
  title: string;
  badge?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon: Icon,
  iconColor = 'text-brand-stellar',
  title,
  badge,
  action,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
        <h3 className="text-sm font-bold text-white uppercase tracking-wide">{title}</h3>
        {badge}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-[10px] text-brand-stellar hover:text-white transition-colors uppercase tracking-wider flex items-center gap-1"
        >
          {action.label}
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

// Page Header - larger variant for page titles
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  className = '',
}) => {
  return (
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 ${className}`}>
      <div>
        <h1 className="text-2xl md:text-3xl font-condensed font-bold text-white uppercase tracking-wide">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs md:text-sm text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

// Compact header for smaller sections
interface CompactHeaderProps {
  icon?: LucideIcon;
  iconColor?: string;
  label: string;
  value?: string | number;
  className?: string;
}

export const CompactHeader: React.FC<CompactHeaderProps> = ({
  icon: Icon,
  iconColor = 'text-brand-stellar',
  label,
  value,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
        <span className="text-sm font-bold text-white uppercase tracking-wide">{label}</span>
      </div>
      {value !== undefined && (
        <span className="text-[10px] text-gray-600">{value}</span>
      )}
    </div>
  );
};
