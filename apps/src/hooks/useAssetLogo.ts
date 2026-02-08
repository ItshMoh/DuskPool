import { useState, useEffect } from 'react';

// Local overrides for specific assets (takes priority over API)
const LOCAL_LOGO_OVERRIDES: Record<string, string> = {
  // Add custom logos here if Stellar Expert doesn't have them
  // 'TBILL': 'https://your-domain.com/tbill-logo.png',
};

// In-memory cache shared across all hook instances
const logoCache = new Map<string, string | null>();
const pendingRequests = new Map<string, Promise<string | null>>();

/**
 * Hook to get asset logo URLs from Stellar Expert API
 * Searches the public network for assets matching the symbol
 * @param symbol - Asset symbol (e.g., 'USDC', 'PAXG', 'TBILL')
 * @param tokenAddress - Optional token address (not used for search, kept for interface compatibility)
 * @returns Object with logoUrl and loading state
 */
export const useAssetLogo = (symbol: string, tokenAddress?: string) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!symbol) {
      setLogoUrl(null);
      return;
    }

    const upperSymbol = symbol.toUpperCase();
    const cacheKey = upperSymbol; // Cache by symbol only since we search by symbol

    // Check local overrides first
    if (LOCAL_LOGO_OVERRIDES[upperSymbol]) {
      setLogoUrl(LOCAL_LOGO_OVERRIDES[upperSymbol]);
      return;
    }

    // Check cache
    if (logoCache.has(cacheKey)) {
      setLogoUrl(logoCache.get(cacheKey) || null);
      return;
    }

    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      pendingRequests.get(cacheKey)!.then(url => setLogoUrl(url));
      return;
    }

    // Fetch from Stellar Expert API
    setIsLoading(true);
    const fetchPromise = fetchLogoFromStellarExpert(upperSymbol);
    pendingRequests.set(cacheKey, fetchPromise);

    fetchPromise
      .then((url) => {
        logoCache.set(cacheKey, url);
        setLogoUrl(url);
      })
      .catch(() => {
        logoCache.set(cacheKey, null);
        setLogoUrl(null);
      })
      .finally(() => {
        setIsLoading(false);
        pendingRequests.delete(cacheKey);
      });
  }, [symbol]);

  return { logoUrl, isLoading };
};

/**
 * Fetch logo URL from Stellar Expert API by searching for the asset symbol
 * Uses the PUBLIC network which has more assets with logos
 */
async function fetchLogoFromStellarExpert(symbol: string): Promise<string | null> {
  try {
    // Search for assets matching the symbol on PUBLIC network (more assets have tomlInfo)
    const response = await fetch(
      `https://api.stellar.expert/explorer/public/asset?search=${encodeURIComponent(symbol)}&limit=20`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const records = data?._embedded?.records || [];

    // Find an asset that matches the symbol exactly and has a logo
    for (const asset of records) {
      // Asset format is "CODE-ISSUER-VERSION" or just "CODE" for native (XLM)
      const assetParts = asset.asset?.split('-');
      const assetCode = assetParts?.[0];

      if (assetCode?.toUpperCase() === symbol.toUpperCase()) {
        // Check for logo in tomlInfo
        const logoUrl = asset.tomlInfo?.image || asset.tomlInfo?.orgLogo;

        if (logoUrl && logoUrl.startsWith('https://')) {
          return logoUrl;
        }
      }
    }

    return null;
  } catch (error) {
    console.warn(`Failed to fetch logo for ${symbol}:`, error);
    return null;
  }
}

/**
 * Add a custom logo override for an asset
 * Useful for assets not listed on Stellar Expert
 */
export const registerAssetLogo = (symbol: string, logoUrl: string) => {
  LOCAL_LOGO_OVERRIDES[symbol.toUpperCase()] = logoUrl;
  // Clear cache for this symbol
  logoCache.delete(symbol.toUpperCase());
};

/**
 * Get all registered logo overrides
 */
export const getRegisteredLogos = () => ({ ...LOCAL_LOGO_OVERRIDES });

/**
 * Clear the logo cache (forces re-fetch on next render)
 */
export const clearLogoCache = () => {
  logoCache.clear();
};
