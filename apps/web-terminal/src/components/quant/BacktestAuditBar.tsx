'use client';

import React from 'react';
import { QuantAnalysisResponse } from '@/types/quant';
import { formatBrier } from '@/lib/formatters';
import { Award, TrendingUp, CheckCircle2, History } from 'lucide-react';

interface Props {
  audit: QuantAnalysisResponse['directional']['walkForwardAudit'];
}

export default function BacktestAuditBar({ audit }: Props) {
  const { outOfSampleWinRate, profitFactor, brierScore, sampleSignals } = audit;

  const winRateColor =
    outOfSampleWinRate >= 60 ? '#00E676' : outOfSampleWinRate >= 50 ? '#F59E0B' : '#FF453A';
  const pfColor = profitFactor >= 1.5 ? '#00E676' : profitFactor >= 1.0 ? '#F59E0B' : '#FF453A';

  return (
    <div className="border-t border-[#1E2430] bg-[#0B0D12] px-4 py-3 sm:px-6 pl-14 sm:pl-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 font-mono text-xs">
        {/* Metric 1 */}
        <div className="bg-[#101318] border border-[#171B24] rounded-lg p-2.5 sm:p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#8B949E] uppercase tracking-wider block font-medium mb-0.5">
              OOS Win Rate
            </span>
            <span className="text-base font-extrabold tracking-tight" style={{ color: winRateColor }}>
              {outOfSampleWinRate.toFixed(1)}%
            </span>
          </div>
          <Award className="w-5 h-5 text-[#8B949E]/40" />
        </div>

        {/* Metric 2 */}
        <div className="bg-[#101318] border border-[#171B24] rounded-lg p-2.5 sm:p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#8B949E] uppercase tracking-wider block font-medium mb-0.5">
              Profit Factor
            </span>
            <span className="text-base font-extrabold tracking-tight" style={{ color: pfColor }}>
              {profitFactor.toFixed(2)}x
            </span>
          </div>
          <TrendingUp className="w-5 h-5 text-[#8B949E]/40" />
        </div>

        {/* Metric 3 */}
        <div className="bg-[#101318] border border-[#171B24] rounded-lg p-2.5 sm:p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#8B949E] uppercase tracking-wider block font-medium mb-0.5">
              Brier Score
            </span>
            <span className="text-sm font-bold text-[#38BDF8]">
              {formatBrier(brierScore)}
            </span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-[#38BDF8]/40" />
        </div>

        {/* Metric 4 */}
        <div className="bg-[#101318] border border-[#171B24] rounded-lg p-2.5 sm:p-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#8B949E] uppercase tracking-wider block font-medium mb-0.5">
              Verified Signals
            </span>
            <span className="text-base font-bold text-[#F0F2F5]">
              {sampleSignals} Trades
            </span>
          </div>
          <History className="w-5 h-5 text-[#8B949E]/40" />
        </div>
      </div>
    </div>
  );
}
