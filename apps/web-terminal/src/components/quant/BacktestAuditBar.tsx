'use client';

import React from 'react';
import { QuantAnalysisResponse } from '@/types/quant';
import { formatBrier } from '@/lib/formatters';

interface Props {
  audit: QuantAnalysisResponse['directional']['walkForwardAudit'];
}

export default function BacktestAuditBar({ audit }: Props) {
  const { outOfSampleWinRate, profitFactor, brierScore, sampleSignals } = audit;

  const winRateColor =
    outOfSampleWinRate >= 60 ? '#00C853' : outOfSampleWinRate >= 50 ? '#F59E0B' : '#FF3B30';
  const pfColor = profitFactor >= 1.5 ? '#00C853' : profitFactor >= 1.0 ? '#F59E0B' : '#FF3B30';

  return (
    <div className="h-14 border-t border-[#1E222B] bg-[#090A0C] px-4 grid grid-cols-4 items-center font-mono">
      <div className="border-r border-[#1E222B] pr-3">
        <span className="text-[9px] text-[#7D8590] block tracking-widest mb-0.5">
          WALK-FORWARD WIN RATE
        </span>
        <span className="text-sm font-bold" style={{ color: winRateColor }}>
          {outOfSampleWinRate.toFixed(1)}%
        </span>
      </div>
      <div className="border-r border-[#1E222B] px-3">
        <span className="text-[9px] text-[#7D8590] block tracking-widest mb-0.5">PROFIT FACTOR</span>
        <span className="text-sm font-bold" style={{ color: pfColor }}>
          {profitFactor.toFixed(2)}
        </span>
      </div>
      <div className="border-r border-[#1E222B] px-3">
        <span className="text-[9px] text-[#7D8590] block tracking-widest mb-0.5">BRIER CALIBRATION</span>
        <span className="text-xs font-bold text-[#38BDF8]">{formatBrier(brierScore)}</span>
      </div>
      <div className="pl-3">
        <span className="text-[9px] text-[#7D8590] block tracking-widest mb-0.5">VERIFIED SIGNALS</span>
        <span className="text-sm font-bold text-white">{sampleSignals}</span>
      </div>
    </div>
  );
}
