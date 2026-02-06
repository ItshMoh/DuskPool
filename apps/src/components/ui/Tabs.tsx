import React from 'react';

// Tab Container
interface TabsProps {
  children: React.ReactNode;
  variant?: 'default' | 'pills';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = variant === 'pills'
    ? 'bg-zinc-900/50 p-1 border border-white/10'
    : 'flex items-center gap-6 px-4 py-3 border-b border-white/5';

  return (
    <div className={`flex ${variantStyles} ${className}`}>
      {children}
    </div>
  );
};

// Individual Tab Button
interface TabProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'pills';
  className?: string;
}

export const Tab: React.FC<TabProps> = ({
  active,
  onClick,
  children,
  variant = 'default',
  className = '',
}) => {
  if (variant === 'pills') {
    return (
      <button
        onClick={onClick}
        className={`
          px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all
          ${active
            ? 'bg-white text-black'
            : 'text-gray-500 hover:text-white'
          }
          ${className}
        `}
      >
        {children}
      </button>
    );
  }

  // Default underline style
  return (
    <button
      onClick={onClick}
      className={`
        text-xs font-medium pb-3 -mb-3.5 transition-colors
        ${active
          ? 'text-white font-bold border-b-2 border-brand-stellar'
          : 'text-gray-500 hover:text-white'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// Controlled Tabs component
interface ControlledTabsProps<T extends string> {
  tabs: { key: T; label: string }[];
  activeTab: T;
  onChange: (tab: T) => void;
  variant?: 'default' | 'pills';
  className?: string;
}

export function ControlledTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  className = '',
}: ControlledTabsProps<T>) {
  return (
    <Tabs variant={variant} className={className}>
      {tabs.map((tab) => (
        <Tab
          key={tab.key}
          active={activeTab === tab.key}
          onClick={() => onChange(tab.key)}
          variant={variant}
        >
          {tab.label}
        </Tab>
      ))}
    </Tabs>
  );
}
