'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import QuantTvChart from '@/components/chart/QuantTvChart';
import MlProbabilityCard from '@/components/quant/MlProbabilityCard';
import ShapExplainCard from '@/components/quant/ShapExplainCard';
import BacktestAuditBar from '@/components/quant/BacktestAuditBar';
import OnChainSurvivalCard from '@/components/quant/OnChainSurvivalCard';
import { QuantAnalysisResponse, Timeframe } from '@/types/quant';
import {
  generateRealisticCandles,
  fetchQuantAnalysis,
  getMockQuantResponse,
} from '@/lib/api-client';
import { formatPrice, shortenAddress } from '@/lib/formatters';

// Known tokens for demo routing
const KNOWN_TOKENS: Record<string, { symbol: string; name: string; price: number; liq: string }> = {
  So11111111111111111111111111111111111111112: { symbol: 'SOL', name: 'Solana', price: 184.5, liq: '$42.5M' },
  JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: { symbol: 'JUP', name: 'Jupiter', price: 0.82, liq: '$18.2M' },
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: { symbol: 'BONK', name: 'Bonk', price: 0.0000248, liq: '$9.1M' },
  EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm: { symbol: 'WIF', name: 'dogwifhat', price: 1.24, liq: '$22.4M' },
};

type AnalysisStatus = 'idle' | 'loading' | 'done' | 'error';

export default function QuantTerminalPage() {
  const routeParams = useParams();
  const address = (routeParams?.address as string) || 'So11111111111111111111111111111111111111112';
  const tokenMeta = KNOWN_TOKENS[address];
  const basePrice = tokenMeta?.price ?? 100.0;

  const [timeframe, setTimeframe] = useState<Timeframe>('5m');
  const [status, setStatus] = useState<AnalysisStatus>('done');
  const [showBarriers, setShowBarriers] = useState(true);

  // Generate candles whenever timeframe or address changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const candles = useMemo(() => generateRealisticCandles(200, basePrice, timeframe), [timeframe, address]);

  const latest = candles[candles.length - 1];

  // Mock quant response (production: call fetchQuantAnalysis)
  const [quantData, setQuantData] = useState<QuantAnalysisResponse>(() =>
    getMockQuantResponse(address, timeframe, latest.close, basePrice * 0.0077)
  );

  const runAnalysis = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await fetchQuantAnalysis(address, timeframe, candles);
      setQuantData(result);
      setStatus('done');
    } catch {
      // Fallback to mock if backend not available
      setQuantData(getMockQuantResponse(address, timeframe, latest.close, basePrice * 0.0077));
      setStatus('done');
    }
  }, [address, timeframe, candles, latest.close, basePrice]);

  const { directional, onchainSurvival } = quantData;

  const regimeColors: Record<string, string> = {
    STRONG_BULLISH: '#00C853',
    BULLISH_EDGE: '#69F0AE',
    NEUTRAL_NO_EDGE: '#F59E0B',
    BEARISH_EDGE: '#FF6B47',
    STRONG_BEARISH: '#FF3B30',
  };
  const regimeColor = regimeColors[directional.regime] ?? '#7D8590';

  return (
    <main className="h-screen w-screen bg-[#090A0C] text-[#ECECEF] flex flex-col overflow-hidden select-none font-mono">
      {/* ─── TOP BAR ─── */}
      <header className="h-11 shrink-0 border-b border-[#1E222B] bg-[#101216] px-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-[0.2em] text-sm text-white">VORTEX</span>
            <span className="text-[#1E222B] text-lg font-thin">/</span>
            <span className="font-bold tracking-[0.2em] text-sm text-[#38BDF8]">QUANT</span>
          </div>
          <div className="h-4 w-px bg-[#1E222B]" />
          {/* Token symbol */}
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-base">{tokenMeta?.symbol ?? 'TOKEN'}</span>
            <span className="text-[#7D8590]">/USDC</span>
            <span className="text-white font-bold">${formatPrice(latest.close)}</span>
          </div>
          <div className="h-4 w-px bg-[#1E222B]" />
          {/* Model version */}
          <span className="px-2 py-0.5 bg-[#0D1117] border border-[#1E222B] text-[#38BDF8] text-[10px] tracking-wider">
            {quantData.modelVersion}
          </span>
        </div>

        <div className="flex items-center gap-5 text-[11px]">
          {/* Regime badge */}
          <span
            className="px-2 py-0.5 font-bold text-[10px] tracking-wider"
            style={{
              color: regimeColor,
              borderColor: regimeColor + '50',
              backgroundColor: regimeColor + '12',
              border: `1px solid ${regimeColor}50`,
            }}
          >
            {directional.regime.replace(/_/g, ' ')}
          </span>

          {/* Win rate */}
          <div>
            <span className="text-[#7D8590] mr-1.5">OOS WIN RATE</span>
            <span className="text-[#00C853] font-bold">
              {directional.walkForwardAudit.outOfSampleWinRate}%
            </span>
            <span className="text-[#3A3F4C] ml-1">
              ({directional.walkForwardAudit.sampleSignals} signals)
            </span>
          </div>

          {/* Address */}
          <span className="text-[#3A3F4C] hover:text-[#7D8590] cursor-pointer transition-colors">
            {shortenAddress(address, 6)}
          </span>

          {/* Run analysis button */}
          <button
            onClick={runAnalysis}
            disabled={status === 'loading'}
            className="px-3 py-1 border border-[#38BDF840] text-[#38BDF8] hover:bg-[#38BDF808] transition-colors text-[10px] tracking-wider disabled:opacity-40"
          >
            {status === 'loading' ? '⟳ COMPUTING...' : '⚡ RE-ANALYZE'}
          </button>
        </div>
      </header>

      {/* ─── MAIN GRID ─── */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden min-h-0">
        {/* LEFT: Chart column (8 cols) */}
        <section className="col-span-12 lg:col-span-8 border-r border-[#1E222B] flex flex-col overflow-hidden">
          {/* Chart toolbar */}
          <div className="h-9 shrink-0 border-b border-[#1E222B] bg-[#101216] px-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              {(['1m', '5m', '15m', '1h', '4h'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 text-[11px] transition-all duration-150 ${
                    timeframe === tf
                      ? 'bg-[#1E222B] text-white font-bold'
                      : 'text-[#7D8590] hover:text-[#ECECEF]'
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}

              <div className="h-4 w-px bg-[#1E222B] mx-2" />

              {/* Show barriers toggle */}
              <button
                onClick={() => setShowBarriers((v) => !v)}
                className={`px-2.5 py-1 text-[11px] transition-colors ${
                  showBarriers
                    ? 'text-[#38BDF8] border border-[#38BDF840] bg-[#38BDF808]'
                    : 'text-[#7D8590]'
                }`}
              >
                {showBarriers ? '◈' : '◇'} ML BARRIERS
              </button>
            </div>

            <div className="flex items-center gap-4 text-[10px] text-[#7D8590]">
              <span>
                HORIZON:{' '}
                <strong className="text-white">{directional.barriers.horizonCandles} BARS</strong>
              </span>
              <span>
                ATR(14):{' '}
                <strong className="text-white">${formatPrice(directional.barriers.atrValue)}</strong>
              </span>
              <span>
                LIQ:{' '}
                <strong className="text-[#38BDF8]">{tokenMeta?.liq ?? 'N/A'}</strong>
              </span>
            </div>
          </div>

          {/* Chart area */}
          <div className="flex-1 bg-[#101216] min-h-0">
            <QuantTvChart
              data={candles}
              targetBarrier={showBarriers ? directional.barriers.targetBarrier : undefined}
              stopBarrier={showBarriers ? directional.barriers.stopBarrier : undefined}
            />
          </div>

          {/* Walk-forward audit bar */}
          <div className="shrink-0">
            <BacktestAuditBar audit={directional.walkForwardAudit} />
          </div>
        </section>

        {/* RIGHT: ML panel column (4 cols) */}
        <aside className="col-span-12 lg:col-span-4 bg-[#101216] flex flex-col overflow-y-auto scrollbar-hide">
          {/* Asset header */}
          <div className="shrink-0 h-9 border-b border-[#1E222B] px-4 flex items-center justify-between text-[10px]">
            <span className="text-[#7D8590] tracking-widest">
              {tokenMeta?.name ?? 'UNKNOWN TOKEN'} · QUANT ML ENGINE A
            </span>
            <span
              className="font-bold"
              style={{ color: regimeColor }}
            >
              {directional.bullishProbability.toFixed(1)}% BULL
            </span>
          </div>

          {/* ML Probability */}
          <MlProbabilityCard data={directional} />

          {/* SHAP Explain */}
          <ShapExplainCard drivers={directional.shapDrivers} />

          {/* On-Chain Survival (Engine B) */}
          <div className="border-t border-[#1E222B]">
            <OnChainSurvivalCard data={onchainSurvival} />
          </div>
        </aside>
      </div>
    </main>
  );
}
