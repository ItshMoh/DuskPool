import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, Loader } from 'lucide-react';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

const VARIANT_CONFIG: Record<AlertVariant, { icon: React.ElementType; styles: string }> = {
  error: {
    icon: AlertCircle,
    styles: 'bg-red-500/10 border-red-500/20 text-red-200/80',
  },
  success: {
    icon: CheckCircle,
    styles: 'bg-green-500/10 border-green-500/20 text-green-200/80',
  },
  warning: {
    icon: AlertTriangle,
    styles: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200/80',
  },
  info: {
    icon: Info,
    styles: 'bg-blue-500/10 border-blue-500/20 text-blue-200/80',
  },
};

const ICON_COLORS: Record<AlertVariant, string> = {
  error: 'text-red-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

interface AlertProps {
  variant: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ variant, children, className = '' }) => {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  return (
    <div className={`flex gap-2 p-3 border ${config.styles} ${className}`}>
      <Icon className={`w-4 h-4 flex-shrink-0 ${ICON_COLORS[variant]}`} />
      <p className="text-[10px] leading-relaxed">{children}</p>
    </div>
  );
};

// Convenience components
export const ErrorAlert: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert variant="error" {...props} />
);

export const SuccessAlert: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert variant="success" {...props} />
);

export const WarningAlert: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert variant="warning" {...props} />
);

export const InfoAlert: React.FC<Omit<AlertProps, 'variant'>> = (props) => (
  <Alert variant="info" {...props} />
);

// Loading State
interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: { icon: 'w-4 h-4', text: 'text-xs', padding: 'py-4' },
    md: { icon: 'w-6 h-6', text: 'text-sm', padding: 'py-8' },
    lg: { icon: 'w-8 h-8', text: 'text-base', padding: 'py-12' },
  };

  const styles = sizeStyles[size];

  return (
    <div className={`flex items-center justify-center ${styles.padding} ${className}`}>
      <Loader className={`${styles.icon} text-brand-stellar animate-spin`} />
      {message && <span className={`ml-2 text-gray-500 ${styles.text}`}>{message}</span>}
    </div>
  );
};

// Empty State
interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && <Icon className="w-12 h-12 text-gray-600 mx-auto mb-4" />}
      <p className="text-gray-500">{title}</p>
      {description && <p className="text-sm text-gray-600 mt-2">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
