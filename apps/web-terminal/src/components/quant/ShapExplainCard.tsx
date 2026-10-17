'use client';

import React from 'react';
import { ShapDriver } from '@/types/quant';
import { Cpu, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Props {
  drivers: ShapDriver[];
}

export default function ShapExplainCard({ drivers }: Props) {
  const maxAbs = Math.max(...drivers.map((d) => Math.abs(d.impactPct)), 1);

  return (
    <div className="p-4 sm:p-5 border-b border-[#1E2430] bg-[#101318]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="text-[11px] font-semibold tracking-wider text-[#8B949E] uppercase">
            SHAP Feature Drivers
          </span>
        </div>
        <span className="text-[10px] text-[#4B5565] font-mono">
          LightGBM Tree-SHAP
        </span>
      </div>

      <p className="text-[11px] text-[#8B949E] mb-3 leading-relaxed">
        Faktor mikrostruktur pasar yang paling kuat mendorong sinyal model saat ini:
      </p>

      {/* Feature List */}
      <div className="space-y-2.5">
        {drivers.map((d) => {
          const isBull = d.impactPct >= 0;
          const barWidth = Math.min(100, Math.max(8, (Math.abs(d.impactPct) / maxAbs) * 100));
          const barColor = isBull ? '#00E676' : '#FF453A';

          return (
            <div
              key={d.featureKey}
              className="bg-[#0D1015] border border-[#171B24] hover:border-[#232936] rounded-lg p-3 transition-colors duration-150"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#F0F2F5] font-medium leading-tight">
                  {d.featureName}
                </span>
                <div className="flex items-center gap-1 font-bold text-xs shrink-0 ml-3" style={{ color: barColor }}>
                  {isBull ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  <span>{isBull ? '+' : ''}{d.impactPct.toFixed(1)}%</span>
                </div>
              </div>

              {/* SHAP Bar */}
              <div className="w-full h-1.5 bg-[#171B24] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%`, backgroundColor: barColor }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-[#4B5565] font-mono">
                <span>METRIC VALUE</span>
                <span className="text-[#8B949E] font-medium">{d.featureValue.toFixed(3)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
