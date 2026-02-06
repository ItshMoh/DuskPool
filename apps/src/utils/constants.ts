/**
 * Shared constants used across components
 */

// Asset display colors for UI
export const ASSET_COLORS: Record<string, string> = {
  'USDC': '#10b981',  // Emerald/green
  'TBILL': '#6366f1', // Indigo
  'PAXG': '#eab308',  // Yellow/gold
  'DEFAULT': '#7d00ff', // Brand purple
};

/**
 * Get color for an asset symbol
 * @param symbol - Asset symbol (e.g., 'USDC', 'TBILL')
 * @returns Hex color string
 */
export const getAssetColor = (symbol: string): string => {
  return ASSET_COLORS[symbol] || ASSET_COLORS['DEFAULT'];
};

// Order side colors
export const SIDE_COLORS = {
  buy: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    color: '#10b981',
  },
  sell: {
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    color: '#f43f5e',
  },
};

// Status colors
export const STATUS_COLORS = {
  open: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  filled: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  cancelled: { text: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
  pending: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  completed: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  failed: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
};

// Network configuration
export const NETWORK = {
  name: 'Stellar Testnet',
  passphrase: 'Test SDF Network ; September 2015',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  rpcUrl: 'https://soroban-testnet.stellar.org',
};

// Time intervals in milliseconds
export const INTERVALS = {
  BALANCE_REFRESH: 30000,    // 30 seconds
  ORDERBOOK_REFRESH: 5000,   // 5 seconds
  PRICE_REFRESH: 10000,      // 10 seconds
};
