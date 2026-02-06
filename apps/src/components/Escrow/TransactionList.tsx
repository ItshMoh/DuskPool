import React from 'react';
import { Clock, ArrowDownRight, ArrowUpRight, CheckCircle, Loader } from 'lucide-react';
import { Button, EmptyState, SectionHeader } from '../ui';
import { Transaction } from './types';

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  return (
    <div className="relative h-full">
      {/* Accent Border */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-brand-stellar via-brand-stellar/50 to-transparent"></div>

      <div className="bg-zinc-900/60 border border-white/5 ml-[2px] h-full flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5">
          <SectionHeader
            icon={Clock}
            title="Recent Activity"
            className="mb-0"
          />
          <span className="text-[10px] text-gray-600">{transactions.length} transactions</span>
        </div>

        {/* Transaction List */}
        <div className="flex-1">
          {transactions.length === 0 ? (
            <EmptyState title="No recent transactions" className="h-full" />
          ) : (
            transactions.map(tx => (
              <div key={tx.id} className="px-6 py-4 flex items-center justify-between border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center border ${
                    tx.type === 'deposit'
                      ? 'border-green-500/30 bg-green-500/10'
                      : 'border-red-500/30 bg-red-500/10'
                  }`}>
                    {tx.type === 'deposit'
                      ? <ArrowDownRight className="w-5 h-5 text-green-500" />
                      : <ArrowUpRight className="w-5 h-5 text-red-500" />
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase ${
                        tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {tx.type}
                      </span>
                      <span className="text-sm font-bold text-white">{tx.asset}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-600 font-mono">{tx.txHash}</span>
                      <span className="text-[10px] text-gray-700">•</span>
                      <span className="text-[10px] text-gray-600">{tx.timestamp}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono text-white">
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    {tx.status === 'completed' ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-[10px] text-green-400">Completed</span>
                      </>
                    ) : (
                      <>
                        <Loader className="w-3 h-3 text-yellow-500 animate-spin" />
                        <span className="text-[10px] text-yellow-400">Pending</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* View All Button */}
        <div className="p-6">
          <Button variant="outline" fullWidth>
            View All Transactions
          </Button>
        </div>
      </div>
    </div>
  );
};
