export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h';

export interface OHLCVCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ShapDriver {
  featureKey: string;
  featureName: string;
  featureValue: number;
  impactPct: number; // Positif mendorong Bullish, Negatif mendorong Bearish
}

export interface QuantAnalysisResponse {
  tokenAddress: string;
  timeframe: Timeframe;
  modelVersion: string;
  directional: {
    bullishProbability: number;
    bearishProbability: number;
    regime: 'STRONG_BULLISH' | 'BULLISH_EDGE' | 'NEUTRAL_NO_EDGE' | 'BEARISH_EDGE' | 'STRONG_BEARISH';
    barriers: {
      entryReference: number;
      targetBarrier: number;
      stopBarrier: number;
      atrValue: number;
      horizonCandles: number;
      rewardRiskRatio: number;
    };
    walkForwardAudit: {
      outOfSampleWinRate: number;
      profitFactor: number;
      brierScore: number;
      sampleSignals: number;
    };
    shapDrivers: ShapDriver[];
  };
  onchainSurvival: {
    rugPullProbability: number;
    survivalScore: number;
    securityStatus: 'SAFE_STRUCTURE' | 'ELEVATED_CONCENTRATION_RISK' | 'CRITICAL_RUG_RISK';
    metrics: {
      mintAuthorityDisabled: boolean;
      freezeAuthorityDisabled: boolean;
      lpBurnedPercent: number;
      top10HoldersPercent: number;
      firstBlockBundlerPercent: number;
    };
  };
}

export interface TokenMeta {
  address: string;
  symbol: string;
  name: string;
  liquidity: number;
  volume24h: number;
  tier: 'Tier-1' | 'Liquid SPL' | 'New Launch' | 'Micro-Cap';
}
