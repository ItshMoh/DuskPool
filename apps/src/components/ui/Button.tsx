import React from 'react';
import { Loader } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-stellar hover:bg-brand-stellar/80 text-white shadow-[0_0_30px_rgba(125,0,255,0.2)]',
  secondary: 'bg-white/5 hover:bg-white/10 text-white border border-white/10',
  ghost: 'hover:bg-white/10 text-gray-400 hover:text-white',
  danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30',
  outline: 'border border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-500 hover:text-white',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[10px]',
  md: 'px-4 py-2 text-xs',
  lg: 'px-6 py-4 text-sm',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={`
        font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading && <Loader className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

// Icon Button variant
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'ghost' | 'outline';
  size?: 'sm' | 'md';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = size === 'sm' ? 'p-1' : 'p-1.5';
  const variantStyles = variant === 'ghost'
    ? 'hover:bg-white/10 text-gray-500 hover:text-white'
    : 'border border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-500 hover:text-white';

  return (
    <button
      className={`transition-colors ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};
