import React from 'react';
import { CheckCircle, Loader, Circle, XCircle, ShieldCheck, Clock, Zap, ExternalLink } from 'lucide-react';

export type OrderStep =
  | 'idle'
  | 'validating'
  | 'locking_escrow'
  | 'generating_proof'
  | 'submitting_chain'
  | 'submitting_engine'
  | 'matching'
  | 'complete'
  | 'error';

export interface OrderProgress {
  step: OrderStep;
  stepIndex: number;
  error?: string;
  matchId?: string;
  matched?: boolean; // true = matched immediately, false = waiting in orderbook
  txHash?: string; // On-chain transaction hash for explorer link
}

// Stellar testnet explorer URL
const EXPLORER_URL = 'https://stellar.expert/explorer/testnet/tx';

const STEPS: { step: OrderStep; label: string; activeLabel: string }[] = [
  { step: 'validating', label: 'Validate order', activeLabel: 'Validating order...' },
  { step: 'locking_escrow', label: 'Lock escrow', activeLabel: 'Locking escrow...' },
  { step: 'generating_proof', label: 'Generate ZK proof', activeLabel: 'Generating ZK proof...' },
  { step: 'submitting_chain', label: 'Submit to blockchain', activeLabel: 'Submitting to blockchain...' },
  { step: 'submitting_engine', label: 'Submit to matching engine', activeLabel: 'Submitting to matching engine...' },
  { step: 'matching', label: 'Check for match', activeLabel: 'Checking for match...' },
];

interface OrderProgressBarProps {
  progress: OrderProgress;
}

export const OrderProgressBar: React.FC<OrderProgressBarProps> = ({ progress }) => {
  const { step, stepIndex, error, matchId, matched, txHash } = progress;

  // Idle state - show ZK badge
  if (step === 'idle') {
    return (
      <div className="flex items-center justify-center gap-2 opacity-60">
        <ShieldCheck className="w-3 h-3 text-brand-stellar" />
        <span className="text-[10px] text-gray-400">Zero-Knowledge Proof Enabled</span>
      </div>
    );
  }

  // Complete state - show different messages based on match result
  if (step === 'complete') {
    if (matched && matchId) {
      // Order matched immediately
      return (
        <div className="space-y-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded">
          <div className="flex items-center gap-2 text-emerald-400">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-medium">Order Matched!</span>
          </div>
          <div className="text-[10px] text-emerald-300/80 pl-6">
            Match ID: {matchId.slice(0, 20)}...
          </div>
          <div className="text-[10px] text-gray-400 pl-6">
            Check the Matches tab to sign and settle the trade.
          </div>
          {txHash && (
            <a
              href={`${EXPLORER_URL}/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-brand-stellar hover:text-white pl-6 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View on Explorer
            </a>
          )}
        </div>
      );
    } else {
      // Order placed but not matched yet
      return (
        <div className="space-y-2 p-2 bg-brand-stellar/10 border border-brand-stellar/30 rounded">
          <div className="flex items-center gap-2 text-brand-stellar">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Order Placed</span>
          </div>
          <div className="text-[10px] text-gray-400 pl-6">
            Waiting for a matching counterparty. Your order is now live in the dark pool.
          </div>
          {txHash && (
            <a
              href={`${EXPLORER_URL}/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-brand-stellar hover:text-white pl-6 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View on Explorer
            </a>
          )}
        </div>
      );
    }
  }

  // Error state
  if (step === 'error') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-red-400">
          <XCircle className="w-4 h-4" />
          <span className="text-xs font-medium">Order failed</span>
        </div>
        {error && (
          <div className="text-[10px] text-red-400/80 pl-6">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Active progress state
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 mb-2">
        <Loader className="w-3 h-3 text-brand-stellar animate-spin" />
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Processing Order</span>
      </div>

      {STEPS.map((s, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepIndex > stepNumber;
        const isCurrent = stepIndex === stepNumber;

        return (
          <div
            key={s.step}
            className={`flex items-center gap-2 transition-all duration-200 ${
              isCurrent ? 'opacity-100' : isCompleted ? 'opacity-70' : 'opacity-40'
            }`}
          >
            {isCompleted ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            ) : isCurrent ? (
              <Loader className="w-3.5 h-3.5 text-brand-stellar animate-spin" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-gray-600" />
            )}
            <span
              className={`text-[11px] ${
                isCompleted
                  ? 'text-emerald-400'
                  : isCurrent
                  ? 'text-white font-medium'
                  : 'text-gray-500'
              }`}
            >
              {isCurrent ? s.activeLabel : s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Initial progress state
export const initialProgress: OrderProgress = {
  step: 'idle',
  stepIndex: 0,
};
