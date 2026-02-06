import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Clock, ExternalLink, X } from 'lucide-react';

// Stellar testnet explorer URL
const EXPLORER_URL = 'https://stellar.expert/explorer/testnet/tx';

export type SettlementStatus = 'success' | 'pending' | 'error' | null;

export interface SettlementResult {
  status: SettlementStatus;
  message: string;
  txHash?: string;
  matchId?: string;
}

interface SettlementNotificationProps {
  result: SettlementResult | null;
  onClose: () => void;
  autoCloseDelay?: number; // ms, 0 to disable
}

export const SettlementNotification: React.FC<SettlementNotificationProps> = ({
  result,
  onClose,
  autoCloseDelay = 10000,
}) => {
  // Auto-close after delay (only for success)
  useEffect(() => {
    if (result?.status === 'success' && autoCloseDelay > 0) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [result, onClose, autoCloseDelay]);

  if (!result) return null;

  const { status, message, txHash, matchId } = result;

  // Style configurations based on status
  const styles = {
    success: {
      bg: 'bg-zinc-900/95',
      border: 'border-emerald-500/50',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      titleColor: 'text-emerald-400',
      progressBar: 'bg-emerald-500',
    },
    pending: {
      bg: 'bg-zinc-900/95',
      border: 'border-amber-500/50',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-400',
      progressBar: 'bg-amber-500',
    },
    error: {
      bg: 'bg-zinc-900/95',
      border: 'border-red-500/50',
      glow: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      titleColor: 'text-red-400',
      progressBar: 'bg-red-500',
    },
  };

  const style = styles[status || 'error'];

  const Icon = status === 'success'
    ? CheckCircle
    : status === 'pending'
    ? Clock
    : XCircle;

  const title = status === 'success'
    ? 'Settlement Complete!'
    : status === 'pending'
    ? 'Waiting for Counterparty'
    : 'Settlement Failed';

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className={`p-4 rounded-xl border backdrop-blur-xl ${style.bg} ${style.border} ${style.glow} min-w-[320px] max-w-sm`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${style.iconBg}`}>
              <Icon className={`w-5 h-5 ${style.iconColor}`} />
            </div>
            <div>
              <span className={`text-sm font-semibold ${style.titleColor}`}>{title}</span>
              {matchId && (
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                  {matchId.slice(0, 24)}...
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs text-gray-300 mt-3 leading-relaxed">{message}</p>

        {/* Explorer Link */}
        {txHash && (
          <a
            href={`${EXPLORER_URL}/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-2 mt-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-brand-stellar" />
              <span className="text-xs text-white font-medium">View on Stellar Explorer</span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono group-hover:text-gray-400">
              {txHash.slice(0, 6)}...{txHash.slice(-6)}
            </span>
          </a>
        )}

        {/* Progress bar for auto-close */}
        {status === 'success' && autoCloseDelay > 0 && (
          <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full ${style.progressBar} animate-shrink-width rounded-full`}
              style={{ animationDuration: `${autoCloseDelay}ms` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Initial result state
export const initialSettlementResult: SettlementResult | null = null;
