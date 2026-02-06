import React from 'react';
import { Search } from 'lucide-react';

// Form Input with label and helper text
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  rightElement?: React.ReactNode;
  error?: string;
  fullWidth?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  helperText,
  rightElement,
  error,
  fullWidth = true,
  className = '',
  ...props
}) => {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {(label || helperText) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <label className="text-[10px] text-gray-500 uppercase tracking-wider">
              {label}
            </label>
          )}
          {helperText && (
            <span className="text-[10px] text-gray-600">{helperText}</span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          className={`
            w-full bg-black/30 border border-white/5 px-4 py-2 text-white font-mono
            focus:outline-none focus:border-brand-stellar/30 transition-colors
            placeholder:text-gray-600
            ${error ? 'border-red-500/50' : ''}
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-[10px] text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
};

// Search Input variant
interface SearchInputProps extends Omit<FormInputProps, 'rightElement'> {
  onSearch?: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  className = '',
  ...props
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        type="text"
        className={`
          w-full bg-black/40 border border-white/10 pl-10 pr-4 py-2
          text-sm text-white focus:outline-none focus:border-white/30
          placeholder:text-gray-600
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

// Amount Input with currency/token suffix
interface AmountInputProps extends Omit<FormInputProps, 'rightElement'> {
  suffix?: string;
  onMax?: () => void;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  label = 'Amount',
  suffix,
  onMax,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] text-gray-500 uppercase tracking-wider">
          {label}
        </label>
        {onMax && (
          <button
            type="button"
            onClick={onMax}
            className="text-[10px] font-bold text-brand-stellar hover:text-white transition-colors uppercase tracking-wider"
          >
            Max
          </button>
        )}
      </div>
      <div className="relative">
        <input
          type="text"
          className={`
            w-full bg-black/30 border border-white/5 px-4 py-4 text-white font-mono text-xl
            focus:outline-none focus:border-brand-stellar/30 transition-colors
            placeholder:text-gray-600
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};
