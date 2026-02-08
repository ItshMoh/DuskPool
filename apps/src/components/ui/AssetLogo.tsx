import React, { useState } from 'react';
import { getAssetColor } from '../../utils';
import { useAssetLogo } from '../../hooks/useAssetLogo';

interface AssetLogoProps {
  symbol: string;
  tokenAddress?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

// Default fallback logos from Stellar Expert public assets (IPFS hosted)
// These are real token logos that look good as generic RWA placeholders
const DEFAULT_FALLBACK_LOGOS = [
  'https://stellar.myfilebase.com/ipfs/QmTqE6DhQftp51YXXL8HtkEBhr1PpW6F8W1NxnVoyK6G93', // AQUA - nice circular logo
  'https://stellar.myfilebase.com/ipfs/QmYkosLbMRMPZSiRZBUuCBaGRbaxiuxPmXeFfs6QYeSWCY', // SSLX
  'https://stellar.myfilebase.com/ipfs/Qmb1bNmAaXCmTWPqE9s1QUg1jmpkkoyzakzdFQUpRLyB2z', // TFT
];

/**
 * Get a consistent default logo based on symbol (so same symbol always gets same fallback)
 */
const getDefaultLogo = (symbol: string): string => {
  // Use symbol to pick a consistent fallback (hash-like behavior)
  const index = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return DEFAULT_FALLBACK_LOGOS[index % DEFAULT_FALLBACK_LOGOS.length];
};

/**
 * Displays an asset logo with automatic fallback
 * Fetches logos from Stellar Expert API, falls back to default RWA logos
 */
export const AssetLogo: React.FC<AssetLogoProps> = ({
  symbol,
  tokenAddress,
  size = 'sm',
  className = '',
}) => {
  const { logoUrl } = useAssetLogo(symbol, tokenAddress);
  const [imageError, setImageError] = useState(false);
  const color = getAssetColor(symbol);

  // Use fetched logo, or fall back to a default logo from Stellar Expert
  const displayUrl = logoUrl || getDefaultLogo(symbol || 'DEFAULT');
  const showColorBorder = !logoUrl || imageError;

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full overflow-hidden shrink-0 ${className}`}
      style={{
        border: showColorBorder ? `1px solid ${color}50` : '1px solid transparent',
        backgroundColor: '#18181b',
      }}
    >
      <img
        src={imageError ? getDefaultLogo(symbol || 'DEFAULT') : displayUrl}
        alt={`${symbol} logo`}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </div>
  );
};

export default AssetLogo;
