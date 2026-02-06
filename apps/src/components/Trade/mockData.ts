import type { CandlestickData, Time } from 'lightweight-charts';
import type { OrderBookData, OpenOrder, TradeRecord } from './types';
import { generateCommitment as generateCommitmentUtil } from '../../utils';

// Re-export for backwards compatibility
export const generateCommitment = generateCommitmentUtil;

// Generate realistic candlestick data with price movement
export const generateCandleData = (count: number): CandlestickData<Time>[] => {
  let price = 98.00;
  const data: CandlestickData<Time>[] = [];
  const now = Math.floor(Date.now() / 1000);

  for (let i = 0; i < count; i++) {
    const volatility = 0.8 + Math.random() * 0.5;
    const trend = Math.sin(i / 10) * 0.3;
    const change = (Math.random() - 0.5) * volatility + trend;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;

    data.push({
      time: (now - (count - i) * 3600) as Time,
      open,
      high,
      low,
      close,
    });
    price = close;
  }
  return data;
};

// Generate order book data
export const generateOrderBookData = (): OrderBookData => {
  const asks: { price: number; size: number; total: number }[] = [];
  const bids: { price: number; size: number; total: number }[] = [];

  let askTotal = 0;
  let bidTotal = 0;

  for (let i = 0; i < 12; i++) {
    const askSize = Math.floor(Math.random() * 500 + 50);
    askTotal += askSize;
    asks.push({
      price: 98.50 + i * 0.01,
      size: askSize,
      total: askTotal,
    });

    const bidSize = Math.floor(Math.random() * 500 + 50);
    bidTotal += bidSize;
    bids.push({
      price: 98.45 - i * 0.01,
      size: bidSize,
      total: bidTotal,
    });
  }

  return { asks, bids, maxTotal: Math.max(askTotal, bidTotal) };
};

// Mock open orders data
export const openOrdersData: OpenOrder[] = [
  { id: '1', time: '14:02:22', pair: 'TBILLS/USDC', type: 'Limit (ZK)', side: 'buy', price: '98.40', amount: '50,000', status: 'open' },
  { id: '2', time: '10:15:00', pair: 'PAXG/USDC', type: 'Limit (ZK)', side: 'sell', price: '2,045.50', amount: '10.5', status: 'open' },
];

// Mock order history data
export const orderHistoryData: OpenOrder[] = [
  { id: '3', time: '09:45:12', pair: 'TBILLS/USDC', type: 'Limit (ZK)', side: 'buy', price: '98.35', amount: '25,000', status: 'filled' },
  { id: '4', time: '09:30:00', pair: 'TBILLS/USDC', type: 'Market', side: 'sell', price: '98.42', amount: '15,000', status: 'filled' },
  { id: '5', time: 'Yesterday', pair: 'PAXG/USDC', type: 'Limit (ZK)', side: 'buy', price: '2,038.00', amount: '5.2', status: 'cancelled' },
  { id: '6', time: 'Yesterday', pair: 'TBILLS/USDC', type: 'Limit (ZK)', side: 'buy', price: '98.20', amount: '100,000', status: 'filled' },
];

// Mock trade history data
export const tradeHistoryData: TradeRecord[] = [
  { id: 't1', time: '09:45:12', pair: 'TBILLS/USDC', side: 'buy', price: '98.35', amount: '25,000', fee: '12.50' },
  { id: 't2', time: '09:30:00', pair: 'TBILLS/USDC', side: 'sell', price: '98.42', amount: '15,000', fee: '7.50' },
  { id: 't3', time: 'Yesterday', pair: 'PAXG/USDC', side: 'buy', price: '2,041.20', amount: '3.0', fee: '3.06' },
  { id: 't4', time: 'Yesterday', pair: 'TBILLS/USDC', side: 'buy', price: '98.20', amount: '100,000', fee: '49.10' },
  { id: 't5', time: '2 days ago', pair: 'TBILLS/USDC', side: 'sell', price: '98.55', amount: '50,000', fee: '24.64' },
];
