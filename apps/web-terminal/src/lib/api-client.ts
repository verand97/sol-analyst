import { OHLCVCandle, QuantAnalysisResponse, Timeframe } from '@/types/quant';

const QUANT_API_BASE = process.env.NEXT_PUBLIC_QUANT_API_URL ?? 'http://localhost:8000';

function getSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 12345;
}

/**
 * Menghasilkan candle OHLCV sintetis realistis untuk demo / fallback secara deterministik.
 */
export function generateRealisticCandles(
  count = 200,
  basePrice = 184.5,
  timeframe: Timeframe = '5m',
  seedKey = 'solana-default'
): OHLCVCandle[] {
  const tfSeconds: Record<Timeframe, number> = {
    '1m': 60,
    '5m': 300,
    '15m': 900,
    '1h': 3600,
    '4h': 14400,
  };
  const interval = tfSeconds[timeframe] ?? 300;
  // Waktu referensi tetap ter-kuantisasi untuk mencegah SSR hydration drift
  const baseTime = 1718000000;

  let seed = getSeed(seedKey + timeframe);
  const nextRand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  let price = basePrice;
  const list: OHLCVCandle[] = [];

  for (let i = count; i >= 0; i--) {
    const move = (nextRand() - 0.485) * (basePrice * 0.008);
    const open = price;
    const close = Math.max(0.000001, +(open + move).toFixed(4));
    const high = +(Math.max(open, close) + nextRand() * basePrice * 0.004).toFixed(4);
    const low = +(Math.min(open, close) - nextRand() * basePrice * 0.003).toFixed(4);
    const volume = Math.floor(15000 + nextRand() * 110000);
    list.push({ time: baseTime + (count - i) * interval, open, high, low, close, volume });
    price = close;
  }
  return list;
}

/**
 * Memanggil FastAPI Quant ML Engine untuk analisa token.
 */
export async function fetchQuantAnalysis(
  tokenAddress: string,
  timeframe: Timeframe,
  candles: OHLCVCandle[],
  onchainMetrics: Record<string, unknown> = {}
): Promise<QuantAnalysisResponse> {
  const res = await fetch(`${QUANT_API_BASE}/api/v1/quant-analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenAddress, timeframe, candles, onchainMetrics }),
  });

  if (!res.ok) {
    throw new Error(`Quant API error ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<QuantAnalysisResponse>;
}

/**
 * Mock response untuk mode demo (deterministik berdasarkan address & timeframe).
 */
export function getMockQuantResponse(
  address: string,
  timeframe: Timeframe,
  latestClose: number,
  atr: number = 1.42
): QuantAnalysisResponse {
  let seed = getSeed(address + timeframe);
  const nextRand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const bullishProbability = +(65 + nextRand() * 9).toFixed(1);
  return {
    tokenAddress: address,
    timeframe,
    modelVersion: 'LightGBM-Microstructure-v3.0',
    directional: {
      bullishProbability: +bullishProbability.toFixed(1),
      bearishProbability: +(100 - bullishProbability).toFixed(1),
      regime: bullishProbability >= 68 ? 'STRONG_BULLISH' : 'BULLISH_EDGE',
      barriers: {
        entryReference: latestClose,
        targetBarrier: +(latestClose + 1.5 * atr).toFixed(4),
        stopBarrier: +(latestClose - 1.0 * atr).toFixed(4),
        atrValue: atr,
        horizonCandles: 12,
        rewardRiskRatio: 1.5,
      },
      walkForwardAudit: {
        outOfSampleWinRate: 63.2,
        profitFactor: 1.88,
        brierScore: 0.184,
        sampleSignals: 144,
      },
      shapDrivers: [
        { featureKey: 'orderflow_imb_6', featureName: 'Orderflow Buy/Sell Imbalance (6-Bar)', featureValue: 0.34, impactPct: 14.2 },
        { featureKey: 'cvd_zscore_24', featureName: 'Cumulative Volume Delta Z-Score', featureValue: 2.18, impactPct: 9.6 },
        { featureKey: 'vwap_dist_atr', featureName: 'Session VWAP Distance (ATR)', featureValue: 0.62, impactPct: 5.4 },
        { featureKey: 'vol_shock_ratio', featureName: 'Relative Volume Anomaly (RVOL)', featureValue: 1.85, impactPct: 3.8 },
        { featureKey: 'rsi_14', featureName: 'Momentum RSI (14) Regime', featureValue: 68.4, impactPct: -2.9 },
      ],
    },
    onchainSurvival: {
      rugPullProbability: 3.8,
      survivalScore: 96.2,
      securityStatus: 'SAFE_STRUCTURE',
      metrics: {
        mintAuthorityDisabled: true,
        freezeAuthorityDisabled: true,
        lpBurnedPercent: 99.4,
        top10HoldersPercent: 11.8,
        firstBlockBundlerPercent: 2.1,
      },
    },
  };
}
