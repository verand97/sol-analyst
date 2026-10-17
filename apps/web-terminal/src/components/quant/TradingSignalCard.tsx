'use client';

import React, { useState } from 'react';
import { formatPrice } from '@/lib/formatters';
import {
  TrendingUp,
  ShieldAlert,
  ArrowDownCircle,
  ArrowUpCircle,
  Info,
} from 'lucide-react';

interface Props {
  currentPrice: number;
  atrValue?: number;
  symbol?: string;
  bullishProb?: number;
}

export default function TradingSignalCard({
  currentPrice,
  atrValue = 1.45,
  symbol = 'SOL',
  bullishProb = 65.2,
}: Props) {
  const [strategy, setStrategy] = useState<'conservative' | 'aggressive'>('conservative');

  const atr = Math.max(0.0001, atrValue || currentPrice * 0.014);

  // Price calculation based on live price and ATR
  const buyEntryLow = +(currentPrice - atr * 0.65).toFixed(currentPrice < 0.01 ? 8 : 2);
  const buyEntryHigh = +(currentPrice - atr * 0.15).toFixed(currentPrice < 0.01 ? 8 : 2);

  // Take profit targets
  const tp1 = +(currentPrice + atr * 1.5).toFixed(currentPrice < 0.01 ? 8 : 2);
  const tp2 = +(currentPrice + atr * 3.2).toFixed(currentPrice < 0.01 ? 8 : 2);
  const tp3 = +(currentPrice + atr * 5.8).toFixed(currentPrice < 0.01 ? 8 : 2);

  // Stop loss
  const stopLoss = +(currentPrice - atr * 1.25).toFixed(currentPrice < 0.01 ? 8 : 2);

  const tp1Pct = (((tp1 - currentPrice) / currentPrice) * 100).toFixed(2);
  const tp2Pct = (((tp2 - currentPrice) / currentPrice) * 100).toFixed(2);
  const tp3Pct = (((tp3 - currentPrice) / currentPrice) * 100).toFixed(2);
  const slPct = (((stopLoss - currentPrice) / currentPrice) * 100).toFixed(2);

  const isStrongBuy = bullishProb >= 65;

  return (
    <div className="p-4 sm:p-5 border-b border-[#1E2430] bg-[#101318]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-pulse" />
          <span className="text-[11px] font-bold tracking-wider text-white uppercase">
            Rekomendasi Sinyal Trading {symbol} (Beli & Jual)
          </span>
        </div>
        <div className="flex items-center gap-1 bg-[#090A0E] p-0.5 rounded border border-[#1E2430]">
          <button
            onClick={() => setStrategy('conservative')}
            className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
              strategy === 'conservative'
                ? 'bg-[#1E2430] text-[#00E676] font-bold'
                : 'text-[#8B949E] hover:text-white'
            }`}
          >
            Swing
          </button>
          <button
            onClick={() => setStrategy('aggressive')}
            className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
              strategy === 'aggressive'
                ? 'bg-[#1E2430] text-[#38BDF8] font-bold'
                : 'text-[#8B949E] hover:text-white'
            }`}
          >
            Scalping
          </button>
        </div>
      </div>

      {/* Main Signal Badge */}
      <div className="bg-gradient-to-r from-[#00E676]/15 via-[#00E676]/5 to-transparent border border-[#00E676]/30 rounded-lg p-3.5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-medium text-[#8B949E] tracking-wider uppercase block mb-0.5">
              Status Keputusan Model
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-[#00E676] tracking-tight">
                {isStrongBuy ? 'STRONG BUY (BUY ON DIP)' : 'ACCUMULATE / HOLD'}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#00E676]/20 text-[#00E676] text-[10px] font-bold border border-[#00E676]/40">
                P(Bull): {bullishProb.toFixed(1)}%
              </span>
            </div>
          </div>
          <TrendingUp className="w-7 h-7 text-[#00E676]" />
        </div>
        <p className="text-[11px] text-[#A1AAB7] mt-2 leading-relaxed">
          Peluang kenaikan menyentuh target profit (+1.5 ATR) lebih tinggi daripada risiko penurunan. Disarankan masuk bertahap di area *pullback*.
        </p>
      </div>

      {/* REKOMENDASI AREA BELI */}
      <div className="bg-[#0D1015] border border-[#1E2430] rounded-lg p-3.5 mb-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#00E676]">
            <ArrowDownCircle className="w-4 h-4 text-[#00E676]" />
            <span>REKOMENDASI AREA BELI (BUY ZONE)</span>
          </div>
          <span className="text-[10px] text-[#8B949E] font-medium">Batas Optimal DCA</span>
        </div>

        <div className="bg-[#141822] border border-[#00E676]/20 rounded-md p-3 flex items-baseline justify-between">
          <div>
            <div className="text-[10px] text-[#8B949E] uppercase font-medium mb-0.5">
              Rentang Harga Beli Optimal
            </div>
            <div className="text-lg font-black text-white tracking-tight">
              ${formatPrice(buyEntryLow)} — ${formatPrice(buyEntryHigh)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#8B949E] block">Harga Live Saat Ini</span>
            <span className="text-sm font-bold text-[#38BDF8]">${formatPrice(currentPrice)}</span>
          </div>
        </div>

        <div className="mt-2 text-[10px] text-[#8B949E] flex items-center gap-1">
          <Info className="w-3 h-3 text-[#38BDF8]" />
          <span>Pasang Limit Order di dekat ${formatPrice(buyEntryLow)} untuk memaksimalkan rasio R:R.</span>
        </div>
      </div>

      {/* REKOMENDASI HARGA JUAL (TAKE PROFIT) */}
      <div className="bg-[#0D1015] border border-[#1E2430] rounded-lg p-3.5 mb-3.5">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#38BDF8]">
            <ArrowUpCircle className="w-4 h-4 text-[#38BDF8]" />
            <span>REKOMENDASI HARGA JUAL (TAKE PROFIT)</span>
          </div>
          <span className="text-[10px] text-[#8B949E]">3 Target Bertahap</span>
        </div>

        <div className="space-y-2">
          {/* Target 1 */}
          <div className="bg-[#141822] border border-[#1E2430] hover:border-[#00E676]/40 rounded-md p-2.5 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#00E676]/15 text-[#00E676] flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <div>
                <div className="text-xs font-bold text-white">
                  ${formatPrice(tp1)}
                </div>
                <div className="text-[9px] text-[#8B949E]">
                  Target Cepat (TP 1) · +{tp1Pct}%
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#00E676]/15 text-[#00E676] text-[10px] font-bold">
              Ambil Untung 40%
            </span>
          </div>

          {/* Target 2 */}
          <div className="bg-[#141822] border border-[#1E2430] hover:border-[#38BDF8]/40 rounded-md p-2.5 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <div>
                <div className="text-xs font-bold text-white">
                  ${formatPrice(tp2)}
                </div>
                <div className="text-[9px] text-[#8B949E]">
                  Target Swing (TP 2) · +{tp2Pct}%
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#38BDF8]/15 text-[#38BDF8] text-[10px] font-bold">
              Ambil Untung 35%
            </span>
          </div>

          {/* Target 3 */}
          <div className="bg-[#141822] border border-[#1E2430] hover:border-[#9945FF]/40 rounded-md p-2.5 flex items-center justify-between transition-colors">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#9945FF]/15 text-[#9945FF] flex items-center justify-center text-[10px] font-bold">
                3
              </span>
              <div>
                <div className="text-xs font-bold text-white">
                  ${formatPrice(tp3)}
                </div>
                <div className="text-[9px] text-[#8B949E]">
                  Target Tren Maksimal (TP 3) · +{tp3Pct}%
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#9945FF]/15 text-[#9945FF] text-[10px] font-bold">
              Sisa Runner 25%
            </span>
          </div>
        </div>
      </div>

      {/* BATAS PENGAMAN / CUT LOSS (STOP LOSS) */}
      <div className="bg-[#0D1015] border border-[#FF453A]/25 rounded-lg p-3.5 mb-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF453A]">
            <ShieldAlert className="w-4 h-4 text-[#FF453A]" />
            <span>BATAS CUT LOSS / STOP LOSS (PROTEKSI MODAL)</span>
          </div>
          <span className="text-[10px] text-[#FF453A] font-bold">Wajib Pasang</span>
        </div>

        <div className="bg-[#181214] border border-[#FF453A]/30 rounded-md p-2.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#8B949E] block mb-0.5">Harga Cut Loss Disiplin</span>
            <span className="text-base font-black text-[#FF453A] tracking-tight">
              ${formatPrice(stopLoss)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#8B949E] block mb-0.5">Toleransi Risiko</span>
            <span className="text-xs font-bold text-[#FF453A]">{slPct}% dari Entry</span>
          </div>
        </div>
      </div>

      {/* PARAMETER MANAJEMEN RISIKO */}
      <div className="grid grid-cols-3 gap-2 bg-[#0D1015] border border-[#1E2430] rounded-lg p-3 text-center text-xs">
        <div>
          <span className="text-[9px] text-[#8B949E] uppercase block mb-0.5">Risk/Reward</span>
          <span className="text-sm font-extrabold text-[#00E676]">1 : 2.45</span>
        </div>
        <div className="border-x border-[#1E2430]">
          <span className="text-[9px] text-[#8B949E] uppercase block mb-0.5">Ukuran Posisi</span>
          <span className="text-sm font-extrabold text-[#38BDF8]">5% - 8%</span>
        </div>
        <div>
          <span className="text-[9px] text-[#8B949E] uppercase block mb-0.5">Volatilitas ATR</span>
          <span className="text-sm font-extrabold text-white">${formatPrice(atr)}</span>
        </div>
      </div>
    </div>
  );
}
