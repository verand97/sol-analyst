'use client';

import React from 'react';

interface Props {
  symbol: string;
  size?: number;
  className?: string;
}

export function SolanaLogo({ size = 28, className = '' }: { size?: number; className?: string }) {
  const rawId = React.useId();
  const gradId = `sol-grad-${rawId.replace(/:/g, '')}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 397 312"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="390" y1="20" x2="10" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="50%" stopColor="#03E1FF" />
          <stop offset="100%" stopColor="#DC1FFF" />
        </linearGradient>
      </defs>
      {/* Top Bar */}
      <path
        d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"
        fill={`url(#${gradId})`}
      />
      {/* Middle Bar */}
      <path
        d="M332.4 116.3c-2.4-2.4-5.7-3.8-9.2-3.8H5.8c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"
        fill={`url(#${gradId})`}
      />
      {/* Bottom Bar */}
      <path
        d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"
        fill={`url(#${gradId})`}
      />
    </svg>
  );
}

export function JupiterLogo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <circle cx="50" cy="50" r="46" fill="#131722" stroke="#252D3D" strokeWidth="2" />
      <circle cx="50" cy="50" r="32" fill="url(#jup-grad)" />
      <ellipse cx="50" cy="50" rx="42" ry="14" fill="none" stroke="#FFA726" strokeWidth="3" transform="rotate(-25 50 50)" />
      <defs>
        <linearGradient id="jup-grad" x1="20" y1="20" x2="80" y2="80">
          <stop offset="0%" stopColor="#FF7043" />
          <stop offset="100%" stopColor="#FFA726" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function RaydiumLogo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <circle cx="50" cy="50" r="46" fill="#131722" stroke="#252D3D" strokeWidth="2" />
      <path d="M50 16L78 68H56L50 56L44 68H22L50 16Z" fill="#38BDF8" />
      <path d="M50 40L62 64H38L50 40Z" fill="#818CF8" />
    </svg>
  );
}

export function BonkLogo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-gradient-to-tr from-[#EA580C] to-[#FBBF24] flex items-center justify-center font-bold text-black shadow ${className}`}
    >
      <span style={{ fontSize: size * 0.55 }}>🐕</span>
    </div>
  );
}

export function WifLogo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full bg-gradient-to-tr from-[#92400E] to-[#F59E0B] flex items-center justify-center font-bold text-white shadow ${className}`}
    >
      <span style={{ fontSize: size * 0.55 }}>🎩</span>
    </div>
  );
}

export default function TokenLogo({ symbol, size = 28, className = '' }: Props) {
  const sym = symbol?.toUpperCase() || '';

  if (sym === 'SOL' || sym === 'WSOL') {
    return (
      <div
        style={{ width: size + 8, height: size + 8 }}
        className="rounded-xl bg-[#0B0D14] border border-[#1E2430] p-1.5 flex items-center justify-center shadow-md"
      >
        <SolanaLogo size={size} className={className} />
      </div>
    );
  }

  if (sym === 'JUP') {
    return <JupiterLogo size={size + 6} className={className} />;
  }

  if (sym === 'RAY') {
    return <RaydiumLogo size={size + 6} className={className} />;
  }

  if (sym === 'BONK') {
    return <BonkLogo size={size + 6} className={className} />;
  }

  if (sym === 'WIF') {
    return <WifLogo size={size + 6} className={className} />;
  }

  return (
    <div
      style={{ width: size + 8, height: size + 8 }}
      className={`rounded-xl bg-gradient-to-br from-[#1E2430] to-[#121620] border border-[#252D3D] flex items-center justify-center font-mono font-bold text-white text-xs ${className}`}
    >
      {sym.slice(0, 3)}
    </div>
  );
}
