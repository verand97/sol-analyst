'use client';

import React from 'react';
import { QuantAnalysisResponse } from '@/types/quant';
import { getSecurityStatusColor } from '@/lib/formatters';
import { ShieldCheck, Flame, Users, Crosshair, Lock } from 'lucide-react';

interface Props {
  data: QuantAnalysisResponse['onchainSurvival'];
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
    <div className="p-4 sm:p-5 bg-[#101318]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#00E676]" />
          <span className="text-[11px] font-semibold tracking-wider text-[#8B949E] uppercase">
            Engine B · On-Chain Survival
          </span>
        </div>
        <span
          className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
          style={{
            color: statusColor,
            backgroundColor: statusColor + '15',
            border: `1px solid ${statusColor}40`,
          }}
        >
          {statusLabels[securityStatus] ?? securityStatus}
        </span>
      </div>

      {/* Survival & Rug Risk Score Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0D1015] border border-[#171B24] rounded-lg p-3.5">
          <div className="text-[10px] font-medium text-[#8B949E] tracking-wider uppercase mb-1">
            Rug-Pull Risk
          </div>
          <div
            className="text-2xl font-black"
            style={{
              color: rugPullProbability < 10 ? '#00E676' : rugPullProbability < 40 ? '#F59E0B' : '#FF453A',
            }}
          >
            {rugPullProbability.toFixed(1)}%
          </div>
          <div className="text-[10px] text-[#4B5565] mt-0.5">
            {rugPullProbability < 10 ? 'Minimal risk' : 'Exercise caution'}
          </div>
        </div>

        <div className="bg-[#0D1015] border border-[#171B24] rounded-lg p-3.5">
          <div className="text-[10px] font-medium text-[#8B949E] tracking-wider uppercase mb-1">
            Survival Score
          </div>
          <div className="text-2xl font-black text-[#00E676]">
            {survivalScore.toFixed(1)}
          </div>
          <div className="text-[10px] text-[#4B5565] mt-0.5">
            Scale 0 - 100 Index
          </div>
        </div>
      </div>

      {/* Authority Badges */}
      <div className="grid grid-cols-2 gap-2.5 mb-3.5">
        <div className="bg-[#0D1015] border border-[#171B24] rounded-md p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#8B949E]">
            <Lock className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Mint Auth</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              metrics.mintAuthorityDisabled
                ? 'bg-[#00E676]/15 text-[#00E676]'
                : 'bg-[#FF453A]/15 text-[#FF453A]'
            }`}
          >
            {metrics.mintAuthorityDisabled ? '✓ REVOKED' : '✗ ACTIVE'}
          </span>
        </div>

        <div className="bg-[#0D1015] border border-[#171B24] rounded-md p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#8B949E]">
            <Lock className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Freeze Auth</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              metrics.freezeAuthorityDisabled
                ? 'bg-[#00E676]/15 text-[#00E676]'
                : 'bg-[#FF453A]/15 text-[#FF453A]'
            }`}
          >
            {metrics.freezeAuthorityDisabled ? '✓ REVOKED' : '✗ ACTIVE'}
          </span>
        </div>
      </div>

      {/* Metric Breakdown Rows */}
      <div className="space-y-2 text-xs">
        <div className="bg-[#0D1015] border border-[#171B24] rounded-md p-2.5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#8B949E]">
            <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>LP Burned / Locked</span>
          </div>
          <span className="font-bold text-[#00E676]">
            {metrics.lpBurnedPercent.toFixed(1)}%
          </span>
        </div>

        <div className="bg-[#0D1015] border border-[#171B24] rounded-md p-2.5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#8B949E]">
            <Users className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Top-10 Holders Supply</span>
          </div>
          <span
            className="font-bold"
            style={{ color: metrics.top10HoldersPercent > 30 ? '#FF453A' : '#00E676' }}
          >
            {metrics.top10HoldersPercent.toFixed(1)}%
          </span>
        </div>

        <div className="bg-[#0D1015] border border-[#171B24] rounded-md p-2.5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#8B949E]">
            <Crosshair className="w-3.5 h-3.5 text-[#FF453A]" />
            <span>Block-0 Sniper Bundler</span>
          </div>
          <span
            className="font-bold"
            style={{ color: metrics.firstBlockBundlerPercent > 10 ? '#FF453A' : '#00E676' }}
          >
            {metrics.firstBlockBundlerPercent.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
