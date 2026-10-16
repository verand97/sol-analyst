'use client';

import React from 'react';
import { QuantAnalysisResponse } from '@/types/quant';
import { getSecurityStatusColor } from '@/lib/formatters';

interface Props {
  data: QuantAnalysisResponse['onchainSurvival'];
}

function StatusBadge({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div className="bg-[#090A0C] border border-[#1E222B] p-2 flex items-center justify-between">
      <span className="text-[10px] text-[#7D8590] font-mono">{label}</span>
      <span
        className="text-[10px] font-bold font-mono px-1.5 py-0.5"
        style={{
          color: passed ? '#00C853' : '#FF3B30',
          backgroundColor: passed ? '#00C85312' : '#FF3B3012',
        }}
      >
        {passed ? '✓ PASS' : '✗ FAIL'}
      </span>
    </div>
  );
}

function MetricRow({
  label,
  value,
  suffix = '%',
  warningThreshold,
  higherIsBetter = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  warningThreshold?: number;
  higherIsBetter?: boolean;
}) {
  let color = '#ECECEF';
  if (warningThreshold !== undefined) {
    const isWarning = higherIsBetter ? value < warningThreshold : value > warningThreshold;
    color = isWarning ? '#FF3B30' : '#00C853';
  }
  return (
    <div className="bg-[#090A0C] border border-[#1E222B] p-2 flex justify-between items-center">
      <span className="text-[10px] text-[#7D8590] font-mono">{label}</span>
      <span className="text-[11px] font-bold font-mono" style={{ color }}>
        {value.toFixed(1)}{suffix}
      </span>
    </div>
  );
}

export default function OnChainSurvivalCard({ data }: Props) {
  const { rugPullProbability, survivalScore, securityStatus, metrics } = data;
  const statusColor = getSecurityStatusColor(securityStatus);
  const statusLabels: Record<string, string> = {
    SAFE_STRUCTURE: 'SAFE STRUCTURE',
    ELEVATED_CONCENTRATION_RISK: 'ELEVATED RISK',
    CRITICAL_RUG_RISK: 'CRITICAL RUG RISK',
  };

  return (
    <div className="p-4 space-y-3 font-mono">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-[#7D8590] tracking-widest">ENGINE B · ON-CHAIN SURVIVAL</span>
        <span
          className="text-[10px] font-bold px-2 py-0.5"
          style={{
            color: statusColor,
            backgroundColor: statusColor + '15',
            border: `1px solid ${statusColor}40`,
          }}
        >
          {statusLabels[securityStatus] ?? securityStatus}
        </span>
      </div>

      {/* Survival score big display */}
      <div className="flex items-center justify-between bg-[#090A0C] border border-[#1E222B] p-3">
        <div>
          <div className="text-[9px] text-[#7D8590] tracking-widest mb-1">RUG PULL PROBABILITY</div>
          <div
            className="text-2xl font-bold"
            style={{ color: rugPullProbability < 20 ? '#00C853' : rugPullProbability < 50 ? '#F59E0B' : '#FF3B30' }}
          >
            {rugPullProbability.toFixed(1)}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-[#7D8590] tracking-widest mb-1">SURVIVAL SCORE</div>
          <div className="text-2xl font-bold text-[#00C853]">{survivalScore.toFixed(1)}</div>
        </div>
      </div>

      {/* Survival bar */}
      <div className="w-full h-[4px] bg-[#FF3B30]/25 overflow-hidden">
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${survivalScore}%`, backgroundColor: statusColor }}
        />
      </div>

      {/* Authority checks */}
      <div className="grid grid-cols-2 gap-1.5">
        <StatusBadge passed={metrics.mintAuthorityDisabled} label="Mint Auth" />
        <StatusBadge passed={metrics.freezeAuthorityDisabled} label="Freeze Auth" />
      </div>

      {/* Numeric metrics */}
      <div className="grid grid-cols-2 gap-1.5">
        <MetricRow label="LP Burned" value={metrics.lpBurnedPercent} higherIsBetter warningThreshold={80} />
        <MetricRow label="Top-10 Hold" value={metrics.top10HoldersPercent} warningThreshold={25} />
        <MetricRow label="Block-0 Bundler" value={metrics.firstBlockBundlerPercent} warningThreshold={15} />
        <MetricRow label="Rug Risk" value={rugPullProbability} warningThreshold={30} suffix="%" />
      </div>
    </div>
  );
}
