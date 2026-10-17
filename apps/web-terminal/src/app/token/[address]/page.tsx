'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QuantTvChart from '@/components/chart/QuantTvChart';
import MlProbabilityCard from '@/components/quant/MlProbabilityCard';
import ShapExplainCard from '@/components/quant/ShapExplainCard';
import BacktestAuditBar from '@/components/quant/BacktestAuditBar';
import OnChainSurvivalCard from '@/components/quant/OnChainSurvivalCard';
import { DexTokenInfo, QuantAnalysisResponse, Timeframe } from '@/types/quant';
import {
  generateRealisticCandles,
  fetchQuantAnalysis,
  getMockQuantResponse,
  fetchTokenDexData,
  VERIFIED_SOL_MINT,
  KNOWN_SOLANA_TOKENS,
} from '@/lib/api-client';
import { formatCompact, formatPrice, shortenAddress } from '@/lib/formatters';
import {
  Search,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  BarChart2,
} from 'lucide-react';

type AnalysisStatus = 'idle' | 'loading' | 'done' | 'error';
type PanelTab = 'all' | 'ml' | 'shap' | 'onchain';

function QuantTerminalContent() {
  const router = useRouter();
  const routeParams = useParams();
  const address = (routeParams?.address as string) || VERIFIED_SOL_MINT;

  const [timeframe, setTimeframe] = useState<Timeframe>('5m');
  const [status, setStatus] = useState<AnalysisStatus>('done');
  const [showBarriers, setShowBarriers] = useState(true);
  const [activeTab, setActiveTab] = useState<PanelTab>('all');
  const [copied, setCopied] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Live Token Data from DexScreener
  const [tokenData, setTokenData] = useState<DexTokenInfo | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(true);

  // Load real token market data
  const loadTokenData = useCallback(async (tokenAddr: string) => {
    setIsLoadingToken(true);
    try {
      const data = await fetchTokenDexData(tokenAddr);
      setTokenData(data);
    } catch (e) {
      console.error('Error fetching token data:', e);
    } finally {
      setIsLoadingToken(false);
    }
  }, []);

  useEffect(() => {
    loadTokenData(address);
  }, [address, loadTokenData]);

  const livePrice = tokenData?.priceUsd ?? 104.2;

  // Generate candles ending at real live price with current timestamps
  const candles = useMemo(() => {
    return generateRealisticCandles(180, livePrice, timeframe, address);
  }, [timeframe, address, livePrice]);

  const latest = candles[candles.length - 1];

  // Quant analysis data (proportional to actual live price)
  const [quantData, setQuantData] = useState<QuantAnalysisResponse>(() =>
    getMockQuantResponse(address, timeframe, latest?.close || livePrice)
  );

  // Update quant response when price or timeframe changes
  useEffect(() => {
    if (latest?.close) {
      setQuantData(getMockQuantResponse(address, timeframe, latest.close));
    }
  }, [address, timeframe, latest?.close]);

  const runAnalysis = useCallback(async () => {
    setStatus('loading');
    await loadTokenData(address);
    try {
      const result = await fetchQuantAnalysis(address, timeframe, candles);
      setQuantData(result);
      setStatus('done');
    } catch {
      // Fallback
      setQuantData(getMockQuantResponse(address, timeframe, latest.close));
      setStatus('done');
    }
  }, [address, timeframe, candles, latest.close, loadTokenData]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    // Check if query is a known symbol
    const upper = query.toUpperCase();
    for (const [mint, meta] of Object.entries(KNOWN_SOLANA_TOKENS)) {
      if (meta.symbol === upper) {
        router.push(`/token/${mint}`);
        setSearchInput('');
        return;
      }
    }

    // Otherwise assume it's a mint address
    router.push(`/token/${query}`);
    setSearchInput('');
  };

  const { directional, onchainSurvival } = quantData;

  const regimeColors: Record<string, string> = {
    STRONG_BULLISH: '#00E676',
    BULLISH_EDGE: '#69F0AE',
    NEUTRAL_NO_EDGE: '#F59E0B',
    BEARISH_EDGE: '#FF8A80',
    STRONG_BEARISH: '#FF453A',
  };
  const regimeColor = regimeColors[directional.regime] ?? '#8B949E';

  const isVerifiedSol = address === VERIFIED_SOL_MINT || tokenData?.isVerifiedSol;
  const isPricePositive = (tokenData?.change24h ?? 0) >= 0;

  return (
    <main className="min-h-screen w-full bg-[#090A0E] text-[#F0F2F5] flex flex-col font-mono select-none antialiased">
      {/* ─── TIER 1: MASTER HEADER & QUICK TOKEN SELECTOR ─── */}
      <header className="border-b border-[#1E2430] bg-[#0E1117] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Brand & Ecosystem */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-wider">
            <span className="text-white text-sm tracking-[0.2em]">VORTEX</span>
            <span className="text-[#38BDF8] text-sm tracking-[0.2em]">//QUANT</span>
          </div>
          <span className="h-4 w-px bg-[#1E2430]" />
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#9945FF]/10 border border-[#9945FF]/30 text-[#9945FF] text-[10px] font-semibold">
            <span>◎</span>
            <span>SOLANA ECOSYSTEM</span>
          </div>
        </div>

        {/* Quick Tokens Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
          {Object.entries(KNOWN_SOLANA_TOKENS).map(([mint, meta]) => {
            const isActive = mint === address;
            return (
              <button
                key={mint}
                onClick={() => router.push(`/token/${mint}`)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1E2430] text-white border border-[#38BDF8]/60 shadow-sm'
                    : 'bg-[#101318] text-[#8B949E] hover:text-[#F0F2F5] hover:bg-[#151922] border border-[#171B24]'
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.symbol}</span>
              </button>
            );
          })}
        </div>

        {/* Search Token CA / Symbol */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center min-w-[270px] max-w-[360px]">
          <Search className="w-3.5 h-3.5 absolute left-3 text-[#8B949E]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search symbol / paste Solana CA..."
            className="w-full bg-[#101318] border border-[#1E2430] focus:border-[#38BDF8] rounded-md pl-9 pr-14 py-1.5 text-[11px] text-[#F0F2F5] placeholder-[#4B5565] outline-none transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-2.5 py-0.5 bg-[#1E2430] hover:bg-[#252D3D] text-[10px] font-semibold text-[#38BDF8] rounded transition-colors"
          >
            Load
          </button>
        </form>

        {/* Action Controls & Feed Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#00E676]/10 border border-[#00E676]/25 text-[#00E676] text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
            <span>LIVE DEX FEED</span>
          </div>

          <button
            onClick={runAnalysis}
            disabled={status === 'loading'}
            className="flex items-center gap-1.5 px-3 py-1 rounded border border-[#38BDF8]/40 bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 text-[#38BDF8] text-[11px] font-medium transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3 h-3 ${status === 'loading' ? 'animate-spin' : ''}`} />
            <span>{status === 'loading' ? 'COMPUTING...' : 'RE-ANALYZE'}</span>
          </button>
        </div>
      </header>

      {/* ─── TIER 2: ASSET LIVE TICKER & VERIFICATION BAR ─── */}
      <section className="border-b border-[#1E2430] bg-[#121620] px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Token Identity */}
        <div className="flex items-center gap-3">
          {/* Avatar Icon */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#9945FF] to-[#14F195] p-0.5 flex items-center justify-center font-bold text-black shadow-md">
            <span className="text-sm font-mono">{tokenData?.symbol?.slice(0, 3) || 'SOL'}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-white tracking-wide">
                {tokenData?.symbol || 'SOL'}
              </span>
              <span className="text-xs text-[#8B949E]">/ {tokenData?.quoteSymbol || 'USDC'}</span>

              {/* Verified Solana Pill */}
              {isVerifiedSol ? (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-[10px] font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>SOLANA ASLI (CANONICAL WSOL)</span>
                </div>
              ) : (
                <span className="px-2 py-0.5 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/25 text-[#38BDF8] text-[10px]">
                  SPL TOKEN
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#8B949E] mt-0.5">
              <span>{tokenData?.name || 'Solana'}</span>
              <span className="text-[#3A3F4C]">·</span>

              {/* Contract Address with Copy & External Explorer Link */}
              <button
                onClick={handleCopyAddress}
                className="flex items-center gap-1 hover:text-[#F0F2F5] transition-colors"
                title="Click to copy Contract Address (CA)"
              >
                <span>CA: {shortenAddress(address, 5)}</span>
                {copied ? (
                  <Check className="w-3 h-3 text-[#00E676]" />
                ) : (
                  <Copy className="w-3 h-3 text-[#4B5565] hover:text-[#8B949E]" />
                )}
              </button>

              <a
                href={`https://solscan.io/token/${address}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#38BDF8] transition-colors"
                title="View on Solscan Explorer"
              >
                <ExternalLink className="w-3 h-3" />
              </a>

              {tokenData?.url && (
                <a
                  href={tokenData.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#38BDF8] transition-colors text-[10px] text-[#38BDF8] underline decoration-dotted"
                >
                  DexScreener
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Live Price & Key Metrics */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
          {/* Real-time Price */}
          <div>
            <span className="text-[10px] uppercase text-[#8B949E] block mb-0.5 font-medium">
              Live Price (USD)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">
                ${formatPrice(latest?.close || livePrice)}
              </span>
              <span
                className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${
                  isPricePositive
                    ? 'text-[#00E676] bg-[#00E676]/15'
                    : 'text-[#FF453A] bg-[#FF453A]/15'
                }`}
              >
                {isPricePositive ? (
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5" />
                )}
                {isPricePositive ? '+' : ''}
                {(tokenData?.change24h ?? -1.72).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* 24h Volume */}
          <div className="border-l border-[#1E2430] pl-4 sm:pl-6">
            <span className="text-[10px] uppercase text-[#8B949E] block mb-0.5 font-medium">
              24h Volume
            </span>
            <span className="text-sm font-bold text-white">
              {formatCompact(tokenData?.volume24h || 93900000)}
            </span>
          </div>

          {/* Liquidity */}
          <div className="border-l border-[#1E2430] pl-4 sm:pl-6">
            <span className="text-[10px] uppercase text-[#8B949E] block mb-0.5 font-medium">
              Liquidity (TVL)
            </span>
            <span className="text-sm font-bold text-[#38BDF8]">
              {formatCompact(tokenData?.liquidity || 28600000)}
            </span>
          </div>

          {/* DEX Pool */}
          <div className="border-l border-[#1E2430] pl-4 sm:pl-6">
            <span className="text-[10px] uppercase text-[#8B949E] block mb-0.5 font-medium">
              Active Pool
            </span>
            <span className="text-sm font-bold text-white">
              {tokenData?.dexId || 'ORCA'} WHIRLPOOL
            </span>
          </div>

          {/* Regime Badge */}
          <div className="border-l border-[#1E2430] pl-4 sm:pl-6">
            <span className="text-[10px] uppercase text-[#8B949E] block mb-0.5 font-medium">
              ML Regime
            </span>
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded border inline-block"
              style={{
                color: regimeColor,
                borderColor: regimeColor + '40',
                backgroundColor: regimeColor + '15',
              }}
            >
              {directional.regime.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </section>

      {/* ─── MAIN WORKSPACE: CHART (LEFT) & QUANT ML PANEL (RIGHT) ─── */}
      <div className="flex-1 grid grid-cols-12 min-h-0 bg-[#090A0E]">
        {/* LEFT COLUMN: Chart + Toolbar + Backtest Audit Bar (8 cols) */}
        <section className="col-span-12 xl:col-span-8 border-r border-[#1E2430] flex flex-col min-h-0 bg-[#0B0D12]">
          {/* Chart Controls Bar */}
          <div className="border-b border-[#1E2430] bg-[#101318] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Timeframes */}
            <div className="flex items-center gap-1">
              {(['1m', '5m', '15m', '1h', '4h'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    timeframe === tf
                      ? 'bg-[#1E2430] text-white border border-[#38BDF8]/40 shadow-sm'
                      : 'text-[#8B949E] hover:text-[#F0F2F5] hover:bg-[#151922]'
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}

              <span className="h-4 w-px bg-[#1E2430] mx-2" />

              {/* Show Barriers Toggle */}
              <button
                onClick={() => setShowBarriers((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                  showBarriers
                    ? 'text-[#38BDF8] border border-[#38BDF8]/40 bg-[#38BDF8]/10'
                    : 'text-[#8B949E] hover:text-[#F0F2F5] border border-transparent'
                }`}
              >
                <span>{showBarriers ? '◈' : '◇'}</span>
                <span>ML VOLATILITY BARRIERS</span>
              </button>
            </div>

            {/* Quick Chart Info */}
            <div className="flex items-center gap-4 text-xs text-[#8B949E]">
              <span>
                HORIZON: <strong className="text-white">{directional.barriers.horizonCandles} BARS</strong>
              </span>
              <span>
                ATR(14): <strong className="text-white">${formatPrice(directional.barriers.atrValue)}</strong>
              </span>
              <span>
                DATA: <strong className="text-[#00E676]">180 CANDLES</strong>
              </span>
            </div>
          </div>

          {/* Interactive Lightweight Chart Container */}
          <div className="flex-1 min-h-[460px] bg-[#0B0D12] relative">
            <QuantTvChart
              data={candles}
              targetBarrier={showBarriers ? directional.barriers.targetBarrier : undefined}
              stopBarrier={showBarriers ? directional.barriers.stopBarrier : undefined}
            />
          </div>

          {/* Walk-Forward Backtest Audit Bar (Spacious) */}
          <BacktestAuditBar audit={directional.walkForwardAudit} />
        </section>

        {/* RIGHT COLUMN: Quant Intelligence & SHAP Panel (4 cols) */}
        <aside className="col-span-12 xl:col-span-4 bg-[#101318] flex flex-col border-t xl:border-t-0 border-[#1E2430] min-h-0">
          {/* Panel Tab Navigation (Fixes cramped stacked cards) */}
          <div className="border-b border-[#1E2430] bg-[#0E1117] px-3.5 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'All Panels' },
                { id: 'ml', label: 'ML Direction' },
                { id: 'shap', label: 'SHAP Drivers' },
                { id: 'onchain', label: 'On-Chain Rug' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as PanelTab)}
                  className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#1E2430] text-white font-semibold border border-[#38BDF8]/40 shadow-sm'
                      : 'text-[#8B949E] hover:text-[#F0F2F5] hover:bg-[#151922]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-[10px] text-[#38BDF8] font-mono px-2 py-0.5 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/20">
              Engine A & B Active
            </span>
          </div>

          {/* Panel Content (Smooth Scrollable) */}
          <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-[#1E2430]">
            {(activeTab === 'all' || activeTab === 'ml') && (
              <MlProbabilityCard data={directional} />
            )}

            {(activeTab === 'all' || activeTab === 'shap') && (
              <ShapExplainCard drivers={directional.shapDrivers} />
            )}

            {(activeTab === 'all' || activeTab === 'onchain') && (
              <OnChainSurvivalCard data={onchainSurvival} />
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function QuantTerminalPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#090A0E] text-[#8B949E] flex items-center justify-center font-mono text-xs tracking-wider">
          <div className="flex items-center gap-3 bg-[#101318] border border-[#1E2430] rounded-lg p-5 shadow-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] animate-ping" />
            <span>CONNECTING TO SOLANA QUANT ML ENGINE...</span>
          </div>
        </div>
      }
    >
      <QuantTerminalContent />
    </React.Suspense>
  );
}
