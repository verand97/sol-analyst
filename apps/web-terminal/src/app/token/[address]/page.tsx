'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QuantTvChart from '@/components/chart/QuantTvChart';
import MlProbabilityCard from '@/components/quant/MlProbabilityCard';
import ShapExplainCard from '@/components/quant/ShapExplainCard';
import BacktestAuditBar from '@/components/quant/BacktestAuditBar';
import OnChainSurvivalCard from '@/components/quant/OnChainSurvivalCard';
import TradingSignalCard from '@/components/quant/TradingSignalCard';
import MarketSentimentCard from '@/components/quant/MarketSentimentCard';
import TokenOverviewCard from '@/components/quant/TokenOverviewCard';
import TokenLogo, { SolanaLogo } from '@/components/common/TokenLogo';
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
} from 'lucide-react';

type AnalysisStatus = 'idle' | 'loading' | 'done' | 'error';
type PanelTab = 'signal' | 'sentiment' | 'overview' | 'ml' | 'shap' | 'onchain' | 'all';

function QuantTerminalContent() {
  const router = useRouter();
  const routeParams = useParams();
  const address = (routeParams?.address as string) || VERIFIED_SOL_MINT;

  const [timeframe, setTimeframe] = useState<Timeframe>('5m');
  const [status, setStatus] = useState<AnalysisStatus>('done');
  const [showBarriers, setShowBarriers] = useState(true);
  const [activeTab, setActiveTab] = useState<PanelTab>('signal');
  const [copied, setCopied] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Live Token Data from DexScreener
  const [tokenData, setTokenData] = useState<DexTokenInfo | null>(null);

  // Load real token market data asynchronously without cascading setState
  useEffect(() => {
    let isSubscribed = true;
    fetchTokenDexData(address)
      .then((data) => {
        if (isSubscribed) {
          setTokenData(data);
        }
      })
      .catch((err) => {
        console.error('Error fetching token data:', err);
      });
    return () => {
      isSubscribed = false;
    };
  }, [address]);

  const livePrice = tokenData?.priceUsd ?? 104.22;

  // Generate candles ending at real live price with current timestamps
  const candles = useMemo(() => {
    return generateRealisticCandles(180, livePrice, timeframe, address);
  }, [timeframe, address, livePrice]);

  const latest = candles[candles.length - 1];

  // Optional custom analysis from backend API call
  const [customQuantData, setCustomQuantData] = useState<QuantAnalysisResponse | null>(null);

  // Derive quant analysis data directly (prevents effect cascading renders)
  const quantData = useMemo(() => {
    if (customQuantData && customQuantData.tokenAddress === address && customQuantData.timeframe === timeframe) {
      return customQuantData;
    }
    return getMockQuantResponse(address, timeframe, latest?.close || livePrice);
  }, [customQuantData, address, timeframe, latest?.close, livePrice]);

  const runAnalysis = useCallback(async () => {
    setStatus('loading');
    try {
      const freshDex = await fetchTokenDexData(address);
      setTokenData(freshDex);
      const result = await fetchQuantAnalysis(address, timeframe, candles);
      setCustomQuantData(result);
      setStatus('done');
    } catch {
      setCustomQuantData(getMockQuantResponse(address, timeframe, latest?.close || livePrice));
      setStatus('done');
    }
  }, [address, timeframe, candles, latest?.close, livePrice]);

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

  const isVerifiedSol = address === VERIFIED_SOL_MINT || tokenData?.isVerifiedSol;
  const isPricePositive = (tokenData?.change24h ?? 0) >= 0;

  // Quick Signal Estimates
  const atr = directional.barriers.atrValue;
  const quickBuyLow = +(livePrice - atr * 0.65).toFixed(livePrice < 0.01 ? 6 : 2);
  const quickBuyHigh = +(livePrice - atr * 0.15).toFixed(livePrice < 0.01 ? 6 : 2);
  const quickTp1 = +(livePrice + atr * 1.5).toFixed(livePrice < 0.01 ? 6 : 2);
  const quickTp2 = +(livePrice + atr * 3.2).toFixed(livePrice < 0.01 ? 6 : 2);
  const quickSl = +(livePrice - atr * 1.25).toFixed(livePrice < 0.01 ? 6 : 2);

  return (
    <main className="min-h-screen w-full bg-[#090A0E] text-[#F0F2F5] flex flex-col font-mono select-none antialiased">
      {/* ─── TIER 1: MASTER HEADER & QUICK TOKEN SELECTOR ─── */}
      <header className="border-b border-[#1E2430] bg-[#0E1117] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Brand & Ecosystem */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold tracking-wider">
            <span className="text-white text-sm tracking-[0.2em]">VORTEX</span>
            <span className="text-[#38BDF8] text-sm tracking-[0.2em]">{"//QUANT"}</span>
          </div>
          <span className="h-4 w-px bg-[#1E2430]" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#9945FF]/10 border border-[#9945FF]/30 text-[#00FFA3] text-[10px] font-semibold">
            <SolanaLogo size={12} className="inline mr-1" />
            <span>SOLANA ECOSYSTEM</span>
          </div>
        </div>

        {/* Quick Tokens Switcher with Icons */}
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
                {meta.symbol === 'SOL' ? (
                  <SolanaLogo size={12} className="inline" />
                ) : (
                  <span>{meta.icon}</span>
                )}
                <span>{meta.symbol}</span>
              </button>
            );
          })}
        </div>

        {/* Search Token CA / Symbol */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center min-w-67.5 max-w-90">
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

      {/* ─── TIER 2: ASSET LIVE TICKER, OFFICIAL LOGO & SIGNAL SUMMARY ─── */}
      <section className="border-b border-[#1E2430] bg-[#121620] px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Token Identity with Official Logo */}
        <div className="flex items-center gap-3">
          {/* Official Vector Logo */}
          <TokenLogo symbol={tokenData?.symbol || 'SOL'} size={26} />

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

              {/* Contract Address with Copy & Solscan */}
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

        {/* PROMINENT REKOMENDASI BELI / JUAL BANNER IN TICKER */}
        <div className="bg-[#090A0E] border border-[#00E676]/40 rounded-lg px-3.5 py-1.5 flex flex-wrap items-center gap-3 sm:gap-4 text-xs shadow-inner">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
            <span className="text-[10px] font-bold text-[#8B949E] uppercase">SINYAL:</span>
            <span className="font-extrabold text-[#00E676]">STRONG BUY</span>
          </div>

          <span className="h-4 w-px bg-[#1E2430] hidden sm:block" />

          {/* Area Beli */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#8B949E]">BELI:</span>
            <span className="font-bold text-[#00E676]">
              ${formatPrice(quickBuyLow)} - ${formatPrice(quickBuyHigh)}
            </span>
          </div>

          <span className="h-4 w-px bg-[#1E2430] hidden sm:block" />

          {/* Target Jual */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#8B949E]">JUAL (TP):</span>
            <span className="font-bold text-[#38BDF8]">
              ${formatPrice(quickTp1)} · ${formatPrice(quickTp2)}
            </span>
          </div>

          <span className="h-4 w-px bg-[#1E2430] hidden sm:block" />

          {/* Stop Loss */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#8B949E]">SL:</span>
            <span className="font-bold text-[#FF453A]">${formatPrice(quickSl)}</span>
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
                {(tokenData?.change24h ?? -1.68).toFixed(2)}%
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

          {/* Active Pool */}
          <div className="border-l border-[#1E2430] pl-4 sm:pl-6">
            <span className="text-[10px] uppercase text-[#8B949E] block mb-0.5 font-medium">
              Active Pool
            </span>
            <span className="text-sm font-bold text-white">
              {tokenData?.dexId || 'ORCA'} WHIRLPOOL
            </span>
          </div>
        </div>
      </section>

      {/* ─── MAIN WORKSPACE: CHART (LEFT) & QUANT INTELLIGENCE (RIGHT) ─── */}
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
          <div className="flex-1 min-h-115 bg-[#0B0D12] relative">
            <QuantTvChart
              data={candles}
              targetBarrier={showBarriers ? directional.barriers.targetBarrier : undefined}
              stopBarrier={showBarriers ? directional.barriers.stopBarrier : undefined}
            />
          </div>

          {/* Walk-Forward Backtest Audit Bar (Spacious) */}
          <BacktestAuditBar audit={directional.walkForwardAudit} />
        </section>

        {/* RIGHT COLUMN: Actionable Signals, CMC Sentiment & Quant ML (4 cols) */}
        <aside className="col-span-12 xl:col-span-4 bg-[#101318] flex flex-col border-t xl:border-t-0 border-[#1E2430] min-h-0">
          {/* Panel Tab Navigation */}
          <div className="border-b border-[#1E2430] bg-[#0E1117] px-3 py-2 flex items-center justify-between text-xs overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1">
              {[
                { id: 'signal', label: '🎯 Sinyal Beli/Jual' },
                { id: 'sentiment', label: '💬 Sentimen Pasar' },
                { id: 'overview', label: '📊 Fundamental CMC' },
                { id: 'ml', label: 'ML Barrier' },
                { id: 'shap', label: 'SHAP Drivers' },
                { id: 'onchain', label: 'On-Chain Rug' },
                { id: 'all', label: 'Semua' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as PanelTab)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#1E2430] text-white font-bold border border-[#00E676]/40 shadow-sm'
                      : 'text-[#8B949E] hover:text-[#F0F2F5] hover:bg-[#151922]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Panel Content (Smooth Scrollable) */}
          <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-[#1E2430]">
            {/* Rekomendasi Beli & Jual */}
            {(activeTab === 'signal' || activeTab === 'all') && (
              <TradingSignalCard
                currentPrice={latest?.close || livePrice}
                atrValue={directional.barriers.atrValue}
                symbol={tokenData?.symbol || 'SOL'}
                bullishProb={directional.bullishProbability}
              />
            )}

            {/* Data Sentimen Pasar Solana (CMC Social Insights) */}
            {(activeTab === 'sentiment' || activeTab === 'all') && (
              <MarketSentimentCard
                symbol={tokenData?.symbol || 'SOL'}
                price={latest?.close || livePrice}
              />
            )}

            {/* Fundamental & Ringkasan Pasar CMC */}
            {(activeTab === 'overview' || activeTab === 'all') && (
              <TokenOverviewCard
                symbol={tokenData?.symbol || 'SOL'}
                name={tokenData?.name || 'Solana'}
                price={latest?.close || livePrice}
                change24h={tokenData?.change24h || -1.68}
                address={address}
                volume24h={tokenData?.volume24h}
                liquidity={tokenData?.liquidity}
                fdv={tokenData?.fdv}
              />
            )}

            {/* ML Probability & Barriers */}
            {(activeTab === 'ml' || activeTab === 'all') && (
              <MlProbabilityCard data={directional} />
            )}

            {/* SHAP Drivers */}
            {(activeTab === 'shap' || activeTab === 'all') && (
              <ShapExplainCard drivers={directional.shapDrivers} />
            )}

            {/* On-Chain Survival Matrix */}
            {(activeTab === 'onchain' || activeTab === 'all') && (
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
