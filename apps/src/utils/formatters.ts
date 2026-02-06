/**
 * Shared formatters for bigint/number conversions
 * Used across Escrow, Dashboard, Trade components
 */

// Default Stellar decimal places
export const STELLAR_DECIMALS = 7;

/**
 * Format bigint to display string with localized formatting
 * @param amount - The bigint amount to format
 * @param decimals - Number of decimal places (default: 7 for Stellar)
 * @returns Formatted string like "1,234.56"
 */
export const formatAmount = (amount: bigint, decimals: number = STELLAR_DECIMALS): string => {
  const divisor = BigInt(10 ** decimals);
  const intPart = amount / divisor;
  const fracPart = amount % divisor;
  const fracStr = fracPart.toString().padStart(decimals, '0').slice(0, 2);
  return `${intPart.toLocaleString()}.${fracStr}`;
};

/**
 * Format bigint to a number (loses precision for very large values)
 * @param amount - The bigint amount to convert
 * @param decimals - Number of decimal places (default: 7 for Stellar)
 * @returns Number representation
 */
export const formatBigint = (amount: bigint, decimals: number = STELLAR_DECIMALS): number => {
  return Number(amount) / 10 ** decimals;
};

/**
 * Parse display string to bigint
 * @param amountStr - String like "1234.56" to parse
 * @param decimals - Number of decimal places (default: 7 for Stellar)
 * @returns BigInt representation
 */
export const parseAmount = (amountStr: string, decimals: number = STELLAR_DECIMALS): bigint => {
  const parts = amountStr.split('.');
  const intPart = BigInt(parts[0] || '0');
  let fracPart = BigInt(0);
  if (parts[1]) {
    const fracStr = parts[1].slice(0, decimals).padEnd(decimals, '0');
    fracPart = BigInt(fracStr);
  }
  return intPart * BigInt(10 ** decimals) + fracPart;
};

/**
 * Format a number as USD currency
 * @param value - Number to format
 * @param showSymbol - Whether to show $ symbol (default: true)
 * @returns Formatted string like "$1,234.56"
 */
export const formatUSD = (value: number, showSymbol: boolean = true): string => {
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return showSymbol ? `$${formatted}` : formatted;
};

/**
 * Format a percentage value
 * @param value - Number to format as percentage
 * @param decimals - Decimal places (default: 2)
 * @returns Formatted string like "+2.50%" or "-1.25%"
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

/**
 * Truncate an address or hash for display
 * @param address - Full address string
 * @param startChars - Characters to show at start (default: 6)
 * @param endChars - Characters to show at end (default: 4)
 * @returns Truncated string like "GABCD...WXYZ"
 */
export const truncateAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};
