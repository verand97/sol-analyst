/**
 * Format harga dengan presisi dinamis berdasarkan magnitude.
 * Mendukung micro-cap token dengan harga < $0.01
 */
export function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  if (price >= 0.0001) return price.toFixed(6);
  return price.toExponential(3);
}

/**
 * Singkat alamat dompet Solana: ABC...XYZ
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Format angka besar ke notasi K/M/B
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

/**
 * Warna semantik berdasarkan probabilitas bullish
 */
export function getProbabilityColor(prob: number): string {
  if (prob >= 65) return '#00C853';
  if (prob >= 55) return '#69F0AE';
  if (prob >= 45) return '#F59E0B';
  if (prob >= 35) return '#FF6B47';
  return '#FF3B30';
}

/**
 * Label teks regime ML
 */
export function getRegimeLabel(regime: string): string {
  const labels: Record<string, string> = {
    STRONG_BULLISH: '▲ STRONG BULLISH',
    BULLISH_EDGE: '↗ BULLISH EDGE',
    NEUTRAL_NO_EDGE: '— NEUTRAL / NO EDGE',
    BEARISH_EDGE: '↘ BEARISH EDGE',
    STRONG_BEARISH: '▼ STRONG BEARISH',
  };
  return labels[regime] ?? regime;
}

/**
 * Warna berdasarkan security status on-chain
 */
export function getSecurityStatusColor(status: string): string {
  if (status === 'SAFE_STRUCTURE') return '#00C853';
  if (status === 'ELEVATED_CONCENTRATION_RISK') return '#F59E0B';
  return '#FF3B30';
}

/**
 * Format Brier Score dengan interpretasi
 */
export function formatBrier(score: number): string {
  if (score <= 0.15) return `${score} ✓ Well-Calibrated`;
  if (score <= 0.22) return `${score} ≈ Calibrated`;
  return `${score} ⚠ Needs Calib.`;
}
