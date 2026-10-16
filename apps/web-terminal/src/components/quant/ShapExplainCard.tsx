'use client';

import React from 'react';
import { ShapDriver } from '@/types/quant';

interface Props {
  drivers: ShapDriver[];
}

export default function ShapExplainCard({ drivers }: Props) {
  const maxAbs = Math.max(...drivers.map((d) => Math.abs(d.impactPct)), 1);

  return (
    <div className="p-4 border-b border-[#1E222B]">
      <div className="flex justify-between items-center text-[10px] text-[#7D8590] mb-3 tracking-widest">
        <span>SHAP LOCAL FEATURE IMPORTANCE</span>
        <span>IMPACT ON P(BULLISH)</span>
      </div>

      <div className="space-y-2">
        {drivers.map((d) => {
          const isBull = d.impactPct >= 0;
          const barWidth = (Math.abs(d.impactPct) / maxAbs) * 100;
          const barColor = isBull ? '#00C853' : '#FF3B30';

          return (
            <div
              key={d.featureKey}
              className="bg-[#090A0C] border border-[#1E222B] p-2.5 group hover:border-[#2A2F3C] transition-colors duration-150"
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] text-[#ECECEF] font-mono leading-tight">{d.featureName}</span>
                <span
                  className="text-[11px] font-bold font-mono ml-2 flex-shrink-0"
                  style={{ color: barColor }}
                >
                  {isBull ? '+' : ''}{d.impactPct.toFixed(1)}%
                </span>
              </div>

              {/* SHAP bar */}
              <div className="w-full h-[3px] bg-[#1E222B] rounded-none overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${barWidth}%`, backgroundColor: barColor + 'CC' }}
                />
              </div>

              <div className="text-[9px] text-[#4A5060] mt-1.5 font-mono tracking-wider">
                VALUE: <span className="text-[#7D8590]">{d.featureValue.toFixed(3)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-[9px] text-[#3A3F4C] font-mono text-center tracking-widest">
        TREE SHAP PRED_CONTRIB · LightGBM-Microstructure-v3.0
      </div>
    </div>
  );
}
