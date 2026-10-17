import { DexTokenInfo, OHLCVCandle, QuantAnalysisResponse, Timeframe } from '@/types/quant';

const QUANT_API_BASE = process.env.NEXT_PUBLIC_QUANT_API_URL ?? 'http://localhost:8000';

export const VERIFIED_SOL_MINT = 'So11111111111111111111111111111111111111112';

// Known popular Solana tokens
export const KNOWN_SOLANA_TOKENS: Record<string, { symbol: string; name: string; fallbackPrice: number; icon: string }> = {
  So11111111111111111111111111111111111111112: { symbol: 'SOL', name: 'Solana (Wrapped SOL)', fallbackPrice: 104.2, icon: '◎' },
  JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: { symbol: 'JUP', name: 'Jupiter', fallbackPrice: 0.85, icon: '🪐' },
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': { symbol: 'RAY', name: 'Raydium', fallbackPrice: 1.82, icon: '⚡' },
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: { symbol: 'BONK', name: 'Bonk', fallbackPrice: 0.00000301, icon: '🐕' },
  EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm: { symbol: 'WIF', name: 'dogwifhat', fallbackPrice: 1.25, icon: '🎩' },
};

function getSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 12345;
}

/**
 * Mengambil live token metadata & harga langsung dari DexScreener Solana DEX API.
 */
export async function fetchTokenDexData(address: string): Promise<DexTokenInfo> {
  const isSol = address === VERIFIED_SOL_MINT;
  const known = KNOWN_SOLANA_TOKENS[address];

  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 15 },
    });

    if (!res.ok) {
      throw new Error(`DexScreener HTTP error: ${res.status}`);
    }

    const data = await res.json();
    const pairs: Array<Record<string, any>> = data.pairs || [];

    if (pairs.length > 0) {
      // Prioritize pairs with USDC / USDT / SOL quote and highest liquidity
      const filtered = pairs.filter((p) =>
        ['USDC', 'USDT', 'SOL', 'WSOL'].includes(p.quoteToken?.symbol?.toUpperCase())
      );
      const sorted = (filtered.length > 0 ? filtered : pairs).sort(
        (a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
      );
      const best = sorted[0];

      const price = parseFloat(best.priceUsd) || (isSol ? 104.2 : known?.fallbackPrice ?? 1.0);
      const change = typeof best.priceChange?.h24 === 'number' ? best.priceChange.h24 : -1.2;
      const vol = best.volume?.h24 || 1250000;
      const liq = best.liquidity?.usd || 500000;
      const fdv = best.fdv || liq * 5;

      return {
        address,
        symbol: isSol ? 'SOL' : best.baseToken?.symbol || known?.symbol || 'TOKEN',
        name: isSol ? 'Solana (Wrapped SOL)' : best.baseToken?.name || known?.name || 'Solana Token',
        priceUsd: price,
        change24h: change,
        volume24h: vol,
        liquidity: liq,
        fdv,
        pairAddress: best.pairAddress,
        dexId: best.dexId ? best.dexId.toUpperCase() : 'RAYDIUM',
        quoteSymbol: best.quoteToken?.symbol || 'USDC',
        url: best.url,
        isVerifiedSol: isSol,
      };
    }
  } catch (err) {
    console.warn(`DexScreener fetch failed for ${address}, using fallback:`, err);
  }

  // Fallback data
  return {
    address,
    symbol: known?.symbol || (isSol ? 'SOL' : 'TOKEN'),
    name: known?.name || (isSol ? 'Solana (Wrapped SOL)' : 'Solana Asset'),
    priceUsd: isSol ? 104.2 : known?.fallbackPrice ?? 1.0,
    change24h: -1.72,
    volume24h: isSol ? 93900000 : 1500000,
    liquidity: isSol ? 28600000 : 650000,
    fdv: isSol ? 61200000000 : 5000000,
    dexId: isSol ? 'ORCA' : 'RAYDIUM',
    quoteSymbol: 'USDC',
    isVerifiedSol: isSol,
  };
}

/**
 * Menghasilkan candle OHLCV realistis yang terikat pada waktu riil saat ini (bukan tahun 2024)
 * dan berakhir tepat pada live market price token saat ini.
 */
export function generateRealisticCandles(
  count = 180,
  basePrice = 104.2,
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

  // Waktu terkini, di-round ke interval
  const nowSec = Math.floor(Date.now() / 1000);
  const currentIntervalEnd = Math.floor(nowSec / interval) * interval;
  const startTime = currentIntervalEnd - count * interval;

  let seed = getSeed(seedKey + timeframe + Math.floor(nowSec / 600)); // update seed every 10 min
  const nextRand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  // Walk backward from basePrice to create historical path ending at basePrice
  const rawCloses: number[] = new Array(count + 1);
  rawCloses[count] = basePrice;

  const volatility = Math.min(0.015, Math.max(0.003, (basePrice < 0.1 ? 0.02 : 0.007)));

  for (let i = count - 1; i >= 0; i--) {
    const changePct = (nextRand() - 0.495) * volatility;
    const prev = rawCloses[i + 1] / (1 + changePct);
    rawCloses[i] = Math.max(0.0000001, prev);
  }

  const list: OHLCVCandle[] = [];
  for (let i = 0; i <= count; i++) {
    const open = i === 0 ? rawCloses[0] * (1 - (nextRand() - 0.5) * 0.003) : rawCloses[i - 1];
    const close = rawCloses[i];
    const maxOC = Math.max(open, close);
    const minOC = Math.min(open, close);

    const high = +(maxOC + nextRand() * maxOC * volatility * 0.8).toFixed(basePrice < 0.01 ? 8 : 4);
    const low = +(Math.max(0.0000001, minOC - nextRand() * minOC * volatility * 0.7)).toFixed(basePrice < 0.01 ? 8 : 4);
    const volume = Math.floor(25000 + nextRand() * 140000);

    list.push({
      time: startTime + i * interval,
      open: +open.toFixed(basePrice < 0.01 ? 8 : 4),
      high,
      low,
      close: +close.toFixed(basePrice < 0.01 ? 8 : 4),
      volume,
    });
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
 * Mock response untuk mode quant analysis (deterministik & proporsional terhadap harga riil).
 */
export function getMockQuantResponse(
  address: string,
  timeframe: Timeframe,
  latestClose: number,
  customAtr?: number
): QuantAnalysisResponse {
  let seed = getSeed(address + timeframe);
  const nextRand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const isSol = address === VERIFIED_SOL_MINT;
  const atr = customAtr ?? Math.max(0.000001, +(latestClose * (isSol ? 0.014 : 0.022)).toFixed(latestClose < 0.01 ? 8 : 4));

  const bullishProbability = +(64 + nextRand() * 11).toFixed(1);
  const bearishProbability = +(100 - bullishProbability).toFixed(1);

  return {
    tokenAddress: address,
    timeframe,
    modelVersion: 'LightGBM-Microstructure-v3.0',
    directional: {
      bullishProbability,
      bearishProbability,
      regime: bullishProbability >= 70 ? 'STRONG_BULLISH' : 'BULLISH_EDGE',
      barriers: {
        entryReference: latestClose,
        targetBarrier: +(latestClose + 1.5 * atr).toFixed(latestClose < 0.01 ? 8 : 4),
        stopBarrier: +(Math.max(0.000001, latestClose - 1.0 * atr)).toFixed(latestClose < 0.01 ? 8 : 4),
        atrValue: atr,
        horizonCandles: 12,
        rewardRiskRatio: 1.5,
      },
      walkForwardAudit: {
        outOfSampleWinRate: +(61.5 + nextRand() * 4).toFixed(1),
        profitFactor: +(1.82 + nextRand() * 0.25).toFixed(2),
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
      rugPullProbability: isSol ? 0.1 : 3.8,
      survivalScore: isSol ? 99.8 : 96.2,
      securityStatus: 'SAFE_STRUCTURE',
      metrics: {
        mintAuthorityDisabled: true,
        freezeAuthorityDisabled: true,
        lpBurnedPercent: isSol ? 100 : 99.4,
        top10HoldersPercent: isSol ? 8.4 : 11.8,
        firstBlockBundlerPercent: isSol ? 0.0 : 2.1,
      },
    },
  };
}
