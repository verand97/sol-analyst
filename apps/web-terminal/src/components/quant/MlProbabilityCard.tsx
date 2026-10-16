'use client';

import React from 'react';
import { QuantAnalysisResponse } from '@/types/quant';
import { formatPrice, getProbabilityColor, getRegimeLabel } from '@/lib/formatters';

interface Props {
  data: QuantAnalysisResponse['directional'];
}

export default function MlProbabilityCard({ data }: Props) {
  const { bullishProbability, bearishProbability, regime, barriers } = data;
  const isBull = bullishProbability >= 55;
  const probColor = getProbabilityColor(bullishProbability);
  const regimeLabel = getRegimeLabel(regime);

  return (
    <div className="p-4 border-b border-[#1E222B]">
      {/* Header */}
      <div className="flex justify-between items-center text-[10px] text-[#7D8590] mb-3 tracking-widest">
        <span>TRIPLE-BARRIER ML PROBABILITY</span>
        <span
          className="font-mono text-[10px] px-1.5 py-0.5 border"
          style={{
            color: probColor,
            borderColor: probColor + '40',
            backgroundColor: probColor + '0D',
          }}
        >
          {regimeLabel}
        </span>
      </div>

      {/* Big probability number */}
      <div className="flex items-end justify-between mb-3 font-mono">
        <div>
          <span className="text-4xl font-bold tracking-tight" style={{ color: probColor }}>
            {bullishProbability.toFixed(1)}%
          </span>
          <span className="text-[11px] text-[#7D8590] ml-2">BULLISH HIT TP FIRST</span>
        </div>
        <div className="text-right">
          <span className="text-lg text-[#FF3B30] font-semibold">{bearishProbability.toFixed(1)}%</span>
          <span className="text-[10px] text-[#7D8590] block">SL HIT FIRST</span>
        </div>
      </div>

      {/* Probability bar */}
      <div className="w-full h-[6px] bg-[#FF3B30]/25 rounded-none overflow-hidden flex mb-4">
        <div
          className="h-full transition-all duration-700 ease-out"
          style={{ width: `${bullishProbability}%`, backgroundColor: probColor }}
        />
      </div>

      {/* Barrier levels */}
      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
        <div className="bg-[#090A0C] p-2.5 border border-[#1E222B]">
          <span className="text-[#7D8590] text-[9px] block tracking-widest mb-1">UPPER BARRIER (+1.5 ATR)</span>
          <span className="text-[#00C853] font-bold text-sm">${formatPrice(barriers.targetBarrier)}</span>
          <span className="text-[#7D8590] text-[9px] block">
            {((barriers.targetBarrier - barriers.entryReference) / barriers.entryReference * 100).toFixed(2)}% from entry
          </span>
        </div>
        <div className="bg-[#090A0C] p-2.5 border border-[#1E222B]">
          <span className="text-[#7D8590] text-[9px] block tracking-widest mb-1">LOWER BARRIER (−1.0 ATR)</span>
          <span className="text-[#FF3B30] font-bold text-sm">${formatPrice(barriers.stopBarrier)}</span>
          <span className="text-[#7D8590] text-[9px] block">
            {((barriers.stopBarrier - barriers.entryReference) / barriers.entryReference * 100).toFixed(2)}% from entry
          </span>
        </div>
      </div>

      {/* Setup info */}
      <div className="mt-3 flex justify-between text-[10px] font-mono text-[#7D8590]">
        <span>ATR(14): <strong className="text-white">${formatPrice(barriers.atrValue)}</strong></span>
        <span>HORIZON: <strong className="text-white">{barriers.horizonCandles} bars</strong></span>
        <span>R:R <strong className="text-[#38BDF8]">{barriers.rewardRiskRatio}x</strong></span>
      </div>
    </div>
  );
}
