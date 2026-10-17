'use client';

import React from 'react';
import { QuantAnalysisResponse } from '@/types/quant';
import { formatPrice, getProbabilityColor, getRegimeLabel } from '@/lib/formatters';
import { Target, ShieldAlert, Clock, BarChart3, Scale } from 'lucide-react';

interface Props {
  data: QuantAnalysisResponse['directional'];
}

export default function MlProbabilityCard({ data }: Props) {
  const { bullishProbability, bearishProbability, regime, barriers } = data;
  const probColor = getProbabilityColor(bullishProbability);
  const regimeLabel = getRegimeLabel(regime);

  const tpDistPct = barriers.entryReference > 0
    ? ((barriers.targetBarrier - barriers.entryReference) / barriers.entryReference * 100).toFixed(2)
    : '1.50';
  const slDistPct = barriers.entryReference > 0
    ? ((barriers.stopBarrier - barriers.entryReference) / barriers.entryReference * 100).toFixed(2)
    : '-1.00';

  return (
    <div className="p-4 sm:p-5 border-b border-[#1E2430] bg-[#101318]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wider text-[#8B949E] uppercase">
            Triple-Barrier Directional ML
          </span>
        </div>
        <span
          className="text-[11px] font-bold px-2.5 py-0.5 rounded border"
          style={{
            color: probColor,
            borderColor: probColor + '40',
            backgroundColor: probColor + '12',
          }}
        >
          {regimeLabel}
        </span>
      </div>

      {/* Probability Display Grid */}
      <div className="bg-[#0D1015] border border-[#171B24] rounded-lg p-3.5 mb-3.5">
        <div className="flex items-baseline justify-between mb-2.5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#8B949E] font-medium mb-0.5">
              Target (TP) Probability
            </div>
            <div className="text-3xl font-extrabold tracking-tight" style={{ color: probColor }}>
              {bullishProbability.toFixed(1)}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-[#8B949E] font-medium mb-0.5">
              Stop (SL) Risk
            </div>
            <div className="text-xl font-bold text-[#FF453A]">
              {bearishProbability.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Dual-color Progress Bar */}
        <div className="w-full h-2 bg-[#201518] rounded-full overflow-hidden flex">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{ width: `${bullishProbability}%`, backgroundColor: probColor }}
          />
          <div
            className="h-full bg-[#FF453A] transition-all duration-700 ease-out"
            style={{ width: `${bearishProbability}%` }}
          />
        </div>
      </div>

      {/* Volatility Barriers Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3.5">
        {/* Upper Barrier (TP) */}
        <div className="bg-[#0D1015] border border-[#00E676]/25 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#00E676] tracking-wider uppercase mb-1">
            <Target className="w-3 h-3" />
            <span>Target (+1.5× ATR)</span>
          </div>
          <div className="text-base font-bold text-[#00E676]">
            ${formatPrice(barriers.targetBarrier)}
          </div>
          <div className="text-[10px] text-[#8B949E] mt-0.5 font-medium">
            +{tpDistPct}% from entry
          </div>
        </div>

        {/* Lower Barrier (SL) */}
        <div className="bg-[#0D1015] border border-[#FF453A]/25 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#FF453A] tracking-wider uppercase mb-1">
            <ShieldAlert className="w-3 h-3" />
            <span>Stop (−1.0× ATR)</span>
          </div>
          <div className="text-base font-bold text-[#FF453A]">
            ${formatPrice(barriers.stopBarrier)}
          </div>
          <div className="text-[10px] text-[#8B949E] mt-0.5 font-medium">
            {slDistPct}% from entry
          </div>
        </div>
      </div>

      {/* Model Horizon & Risk Parameters */}
      <div className="grid grid-cols-3 gap-2 text-[10px] text-[#8B949E] bg-[#0D1015]/70 border border-[#171B24] rounded-md p-2.5">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-[#38BDF8]" />
          <div>
            <span className="block text-[9px] text-[#4B5565]">HORIZON</span>
            <strong className="text-[#F0F2F5] font-semibold">{barriers.horizonCandles} Bars</strong>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <BarChart3 className="w-3 h-3 text-[#38BDF8]" />
          <div>
            <span className="block text-[9px] text-[#4B5565]">ATR(14)</span>
            <strong className="text-[#F0F2F5] font-semibold">${formatPrice(barriers.atrValue)}</strong>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Scale className="w-3 h-3 text-[#38BDF8]" />
          <div>
            <span className="block text-[9px] text-[#4B5565]">REWARD/RISK</span>
            <strong className="text-[#38BDF8] font-semibold">{barriers.rewardRiskRatio}x</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
