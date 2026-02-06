/**
 * Hook for persisting market data (candles, order book, trades) in localStorage
 *
 * Provides instant display of cached data on page load while fresh data is fetched.
 * Auto-cleanup removes data older than 48 hours.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { CandlestickData, Time, OrderBookEntry, TradeRecord } from '../components/Trade/types';

const STORAGE_KEY = 'rwa-darkpool-market-data';
const DATA_EXPIRY_MS = 48 * 60 * 60 * 1000; // 48 hours
const DEBOUNCE_MS = 5000; // 5 seconds debounce for saves
const MAX_TRADES_PER_ASSET = 100;
const MAX_CANDLES_PER_ASSET = 500;

interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdated: number;
}

interface CandleCache {
  data: CandlestickData<Time>[];
  lastUpdated: number;
}

interface TradeCache {
  records: TradeRecord[];
  lastUpdated: number;
}

interface PersistedMarketData {
  version: 1;
  lastUpdated: number;
  candles: Record<string, CandleCache>;
  orderBook: Record<string, OrderBookData>;
  trades: Record<string, TradeCache>;
}

function createEmptyData(): PersistedMarketData {
  return {
    version: 1,
    lastUpdated: Date.now(),
    candles: {},
    orderBook: {},
    trades: {},
  };
}

function loadFromStorage(): PersistedMarketData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PersistedMarketData;
      if (parsed.version === 1) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('[useMarketDataPersistence] Failed to load from localStorage:', err);
  }
  return createEmptyData();
}

function saveToStorage(data: PersistedMarketData): void {
  try {
    data.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('[useMarketDataPersistence] Failed to save to localStorage:', err);
    // If storage is full, try to clear old data and retry
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      console.warn('[useMarketDataPersistence] Storage quota exceeded, clearing old data');
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

/**
 * Merge two arrays of candle data, preferring newer data for same timestamps
 */
function mergeCandles(
  existing: CandlestickData<Time>[],
  fresh: CandlestickData<Time>[]
): CandlestickData<Time>[] {
  const candleMap = new Map<number, CandlestickData<Time>>();

  // Add existing candles
  for (const candle of existing) {
    candleMap.set(candle.time as number, candle);
  }

  // Override with fresh candles (newer data wins)
  for (const candle of fresh) {
    candleMap.set(candle.time as number, candle);
  }

  // Sort by time and limit to max
  return Array.from(candleMap.values())
    .sort((a, b) => (a.time as number) - (b.time as number))
    .slice(-MAX_CANDLES_PER_ASSET);
}

/**
 * Merge trade records, deduplicating by ID
 */
function mergeTrades(existing: TradeRecord[], fresh: TradeRecord[]): TradeRecord[] {
  const tradeMap = new Map<string, TradeRecord>();

  // Add existing trades
  for (const trade of existing) {
    tradeMap.set(trade.id, trade);
  }

  // Add fresh trades (newer data wins)
  for (const trade of fresh) {
    tradeMap.set(trade.id, trade);
  }

  // Sort by time (newest first) and limit
  return Array.from(tradeMap.values())
    .slice(0, MAX_TRADES_PER_ASSET);
}

export function useMarketDataPersistence() {
  const [data, setData] = useState<PersistedMarketData>(() => loadFromStorage());
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<PersistedMarketData | null>(null);

  // Use ref to provide stable getter functions that don't cause re-renders
  const dataRef = useRef<PersistedMarketData>(data);
  dataRef.current = data;

  // Debounced save function
  const debouncedSave = useCallback((newData: PersistedMarketData) => {
    pendingDataRef.current = newData;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (pendingDataRef.current) {
        saveToStorage(pendingDataRef.current);
        pendingDataRef.current = null;
      }
    }, DEBOUNCE_MS);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Save any pending data immediately on unmount
      if (pendingDataRef.current) {
        saveToStorage(pendingDataRef.current);
      }
    };
  }, []);

  // Auto-cleanup old data on mount
  useEffect(() => {
    const now = Date.now();
    let needsCleanup = false;
    const cleanedData = { ...data };

    // Clean candles
    for (const [asset, cache] of Object.entries(cleanedData.candles)) {
      if (now - cache.lastUpdated > DATA_EXPIRY_MS) {
        delete cleanedData.candles[asset];
        needsCleanup = true;
      }
    }

    // Clean order books
    for (const [asset, cache] of Object.entries(cleanedData.orderBook)) {
      if (now - cache.lastUpdated > DATA_EXPIRY_MS) {
        delete cleanedData.orderBook[asset];
        needsCleanup = true;
      }
    }

    // Clean trades
    for (const [asset, cache] of Object.entries(cleanedData.trades)) {
      if (now - cache.lastUpdated > DATA_EXPIRY_MS) {
        delete cleanedData.trades[asset];
        needsCleanup = true;
      }
    }

    if (needsCleanup) {
      setData(cleanedData);
      saveToStorage(cleanedData);
      console.log('[useMarketDataPersistence] Cleaned up expired data');
    }
  // Only run on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Candle operations - use dataRef for stable getter (no dependency on data)
  const getPersistedCandles = useCallback((assetAddress: string): CandlestickData<Time>[] => {
    return dataRef.current.candles[assetAddress]?.data || [];
  }, []);

  const updateCandles = useCallback((assetAddress: string, candles: CandlestickData<Time>[]) => {
    setData(prev => {
      const existing = prev.candles[assetAddress]?.data || [];
      const merged = mergeCandles(existing, candles);

      const newData: PersistedMarketData = {
        ...prev,
        candles: {
          ...prev.candles,
          [assetAddress]: {
            data: merged,
            lastUpdated: Date.now(),
          },
        },
      };

      debouncedSave(newData);
      return newData;
    });
  }, [debouncedSave]);

  // Order book operations - use dataRef for stable getter (no dependency on data)
  const getPersistedOrderBook = useCallback((assetAddress: string): { bids: OrderBookEntry[]; asks: OrderBookEntry[] } => {
    const cache = dataRef.current.orderBook[assetAddress];
    if (!cache) {
      return { bids: [], asks: [] };
    }
    return { bids: cache.bids, asks: cache.asks };
  }, []);

  const updateOrderBook = useCallback((
    assetAddress: string,
    orderBook: { bids: OrderBookEntry[]; asks: OrderBookEntry[] }
  ) => {
    setData(prev => {
      const newData: PersistedMarketData = {
        ...prev,
        orderBook: {
          ...prev.orderBook,
          [assetAddress]: {
            bids: orderBook.bids,
            asks: orderBook.asks,
            lastUpdated: Date.now(),
          },
        },
      };

      debouncedSave(newData);
      return newData;
    });
  }, [debouncedSave]);

  // Trade operations - use dataRef for stable getter (no dependency on data)
  const getPersistedTrades = useCallback((assetAddress: string): TradeRecord[] => {
    return dataRef.current.trades[assetAddress]?.records || [];
  }, []);

  const updateTrades = useCallback((assetAddress: string, trades: TradeRecord[]) => {
    setData(prev => {
      const existing = prev.trades[assetAddress]?.records || [];
      const merged = mergeTrades(existing, trades);

      const newData: PersistedMarketData = {
        ...prev,
        trades: {
          ...prev.trades,
          [assetAddress]: {
            records: merged,
            lastUpdated: Date.now(),
          },
        },
      };

      debouncedSave(newData);
      return newData;
    });
  }, [debouncedSave]);

  const addTrade = useCallback((assetAddress: string, trade: TradeRecord) => {
    setData(prev => {
      const existing = prev.trades[assetAddress]?.records || [];
      // Add at the beginning, dedupe by id
      const merged = [trade, ...existing.filter(t => t.id !== trade.id)]
        .slice(0, MAX_TRADES_PER_ASSET);

      const newData: PersistedMarketData = {
        ...prev,
        trades: {
          ...prev.trades,
          [assetAddress]: {
            records: merged,
            lastUpdated: Date.now(),
          },
        },
      };

      debouncedSave(newData);
      return newData;
    });
  }, [debouncedSave]);

  // Clear all data
  const clearAllData = useCallback(() => {
    const emptyData = createEmptyData();
    setData(emptyData);
    localStorage.removeItem(STORAGE_KEY);
    console.log('[useMarketDataPersistence] Cleared all persisted data');
  }, []);

  // Force save (for use before page unload)
  const forceSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveToStorage(dataRef.current);
  }, []);

  return {
    // Candles
    getPersistedCandles,
    updateCandles,

    // Order book
    getPersistedOrderBook,
    updateOrderBook,

    // Trades
    getPersistedTrades,
    updateTrades,
    addTrade,

    // Utilities
    clearAllData,
    forceSave,
  };
}
