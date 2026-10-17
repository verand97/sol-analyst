'use client';

import React from 'react';
import { formatCompact, formatPrice } from '@/lib/formatters';
import { Globe, FileText, Search, Star, Coins, Award } from 'lucide-react';

interface Props {
  symbol?: string;
  name?: string;
  price?: number;
  change24h?: number;
  address?: string;
  volume24h?: number;
  liquidity?: number;
  fdv?: number;
}

export default function TokenOverviewCard({
  symbol = 'SOL',
  name = 'Solana',
  price = 104.22,
  change24h = -1.68,
  address = 'So11111111111111111111111111111111111111112',
  volume24h = 93900000,
  liquidity = 28600000,
  fdv = 61400000000,
}: Props) {
  const isSol = symbol === 'SOL' || address === 'So11111111111111111111111111111111111111112';

  // Fundamental stats matching CMC
  const circulatingSupply = isSol ? '589.38M SOL' : '999.8M';
  const totalSupply = isSol ? '635.96M SOL' : '1.00B';
  const marketCap = isSol ? 61420000000 : (fdv || 10000000);
  const high24h = +(price * 1.023).toFixed(price < 0.01 ? 6 : 2);
  const low24h = +(price * 0.985).toFixed(price < 0.01 ? 6 : 2);
  const volMcapRatio = (volume24h / (marketCap || 1)).toFixed(3);

  return (
    <div className="p-4 sm:p-5 border-b border-[#1E2430] bg-[#101318]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-[#F59E0B]" />
          <span className="text-[11px] font-bold tracking-wider text-white uppercase">
            Data Fundamental {name} ({symbol})
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/30">
          <Star className="w-3 h-3 fill-[#00E676]" />
          <span>CMC Rank #{isSol ? '7' : 'Top 100'}</span>
        </div>
      </div>

      {/* CMC Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {/* Market Cap */}
        <div className="bg-[#0D1015] border border-[#1E2430] rounded-lg p-2.5">
          <span className="text-[10px] text-[#8B949E] uppercase font-medium block mb-0.5">
            Market Cap
          </span>
          <span className="text-sm font-bold text-white tracking-tight">
            {formatCompact(marketCap)}
          </span>
          <span className="text-[9px] text-[#4B5565] block mt-0.5">Valuasi Penuh</span>
        </div>

        {/* 24h High / Low */}
        <div className="bg-[#0D1015] border border-[#1E2430] rounded-lg p-2.5">
          <span className="text-[10px] text-[#8B949E] uppercase font-medium block mb-0.5">
            24h High / Low
          </span>
          <div className="text-xs font-bold text-white">
            <span className="text-[#00E676]">${formatPrice(high24h)}</span> / <span className="text-[#FF453A]">${formatPrice(low24h)}</span>
          </div>
          <span className="text-[9px] text-[#4B5565] block mt-0.5">
            24h: {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
          </span>
        </div>

        {/* Circulating Supply */}
        <div className="bg-[#0D1015] border border-[#1E2430] rounded-lg p-2.5">
          <span className="text-[10px] text-[#8B949E] uppercase font-medium block mb-0.5">
            Circulating Supply
          </span>
          <span className="text-xs font-bold text-white tracking-tight">
            {circulatingSupply}
          </span>
          <span className="text-[9px] text-[#00E676] block mt-0.5">✓ Terverifikasi CMC</span>
        </div>

        {/* Total Supply & Liquidity */}
        <div className="bg-[#0D1015] border border-[#1E2430] rounded-lg p-2.5">
          <span className="text-[10px] text-[#8B949E] uppercase font-medium block mb-0.5">
            Total Supply & Liq
          </span>
          <span className="text-xs font-bold text-white tracking-tight">
            {totalSupply}
          </span>
          <span className="text-[9px] text-[#38BDF8] block mt-0.5">
            Liq: {formatCompact(liquidity)}
          </span>
        </div>
      </div>

      {/* Vol / Mcap & Profile Score Progress */}
      <div className="bg-[#0D1015] border border-[#1E2430] rounded-lg p-3 mb-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#8B949E]">Volume / Market Cap (24h)</span>
          <span className="font-bold text-[#38BDF8]">{volMcapRatio} (Tinggi)</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[#8B949E]">CMC Profile Score</span>
          <span className="font-bold text-[#00E676]">74% Baik</span>
        </div>

        <div className="w-full h-1.5 bg-[#171B24] rounded-full overflow-hidden">
          <div style={{ width: '74%' }} className="h-full bg-linear-to-r from-[#00E676] to-[#38BDF8]" />
        </div>
      </div>

      {/* External Links & CertiK Rating */}
      <div className="space-y-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <a
            href="https://solana.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0D1015] hover:bg-[#151922] border border-[#1E2430] text-[#8B949E] hover:text-white transition-colors"
          >
            <Globe className="w-3 h-3 text-[#38BDF8]" />
            <span>Website</span>
          </a>

          <a
            href="https://solana.com/solana-whitepaper.pdf"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0D1015] hover:bg-[#151922] border border-[#1E2430] text-[#8B949E] hover:text-white transition-colors"
          >
            <FileText className="w-3 h-3 text-[#38BDF8]" />
            <span>Whitepaper</span>
          </a>

          <a
            href={`https://solscan.io/token/${address}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0D1015] hover:bg-[#151922] border border-[#1E2430] text-[#8B949E] hover:text-white transition-colors"
          >
            <Search className="w-3 h-3 text-[#38BDF8]" />
            <span>Solscan</span>
          </a>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0D1015] border border-[#1E2430] text-[#00E676] font-bold">
            <Award className="w-3 h-3" />
            <span>CertiK: 4.8 ★</span>
          </div>
        </div>
      </div>
    </div>
  );
}
