export interface AssetBalance {
  symbol: string;
  name: string;
  tokenAddress: string;
  walletBalance: bigint;
  escrowBalance: bigint;
  lockedBalance: bigint;
  availableBalance: bigint;
  decimals: number;
  price: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  asset: string;
  amount: number;
  timestamp: string;
  status: 'completed' | 'pending';
  txHash: string;
}
