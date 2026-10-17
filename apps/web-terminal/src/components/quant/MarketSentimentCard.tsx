'use client';

import React from 'react';
import {
  MessageSquare,
  TrendingDown,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';

interface Props {
  symbol?: string;
  price?: number;
}

export default function MarketSentimentCard({ symbol = 'SOL', price = 104.2 }: Props) {
  const sentimentScore = 76; // 76% Bullish
  const mindshareCount = '128.57K';
  const mindshareChange = '-1.08%';

  const influencers = [
    {
      name: 'CZ 🔶 BNB',
      role: 'Top Influencer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop',
      sentiment: 'Bullish',
      score: '4.80',
      isBull: true,
    },
    {
      name: 'Solana Official',
      role: 'Core Foundation',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=60&h=60&fit=crop',
      sentiment: 'Very Bullish',
      score: '4.95',
      isBull: true,
    },
    {
      name: 'CoinDesk Research',
      role: 'Crypto Media',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop',
      sentiment: 'Neutral',
      score: '4.00',
      isBull: false,
    },
  ];

  const communityPosts = [
    {
      id: '1',
      author: 'Sir Abdoul',
      handle: '@abdoul_crypto',
      time: '1h lalu',
      influence: '107.4K Follower',
      text: '$SOL: Can Solana Bounce Back from $103 support? On-chain DEX volume is dominating Ethereum L1 for 3 consecutive weeks. Breakout above $106 incoming.',
      sentiment: 'Bullish',
      likes: 342,
    },
    {
      id: '2',
      author: 'Solana Legend',
      handle: '@sol_analyst',
      time: '3h lalu',
      influence: '89.2K Follower',
      text: 'Firedancer v0.2 testnet throughput benchmarked at 1M TPS. Institutional staking net inflows via Jito & Marinade hit 3-month highs today.',
      sentiment: 'Bullish',
      likes: 512,
    },
    {
      id: '3',
      author: 'Macro DeFi Monitor',
      handle: '@macro_defi',
      time: '5h lalu',
      influence: '45.1K Follower',
      text: 'Healthy consolidation between $103 - $105 after strong multi-week run. Orderbook depth shows solid buy walls protecting $102.',
      sentiment: 'Neutral',
      likes: 198,
    },
  ];

  return (
    <div className="p-4 sm:p-5 border-b border-[#1E2430] bg-[#101318]">
      {/* Header (CoinMarketCap style) */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-[11px] font-bold tracking-wider text-white uppercase">
            Data Sentimen Pasar {symbol} (${price.toFixed(2)})
          </span>
        </div>
        <span className="text-[10px] text-[#38BDF8] font-mono px-2 py-0.5 rounded bg-[#38BDF8]/10 border border-[#38BDF8]/20">
          CMC Aggregated
        </span>
      </div>

      {/* Top 24h Mindshare & Sentiment Meter Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* 24h Mindshare */}
        <div className="bg-[#0D1015] border border-[#1E2430] rounded-lg p-3">
          <span className="text-[10px] text-[#8B949E] uppercase font-medium block mb-1">
            24h Social Mindshare
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-white tracking-tight">{mindshareCount}</span>
            <span className="text-[10px] font-bold text-[#FF453A] flex items-center">
              <TrendingDown className="w-3 h-3 mr-0.5" />
              {mindshareChange}
            </span>
          </div>
          <span className="text-[9px] text-[#4B5565] mt-1 block">Total sebutan di X & Discord</span>
        </div>

        {/* 24h Sentiment Index */}
        <div className="bg-[#0D1015] border border-[#1E2430] rounded-lg p-3">
          <span className="text-[10px] text-[#8B949E] uppercase font-medium block mb-1">
            24h Sentiment Index
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-[#00E676] tracking-tight">{sentimentScore}%</span>
            <span className="text-[10px] font-bold text-[#00E676] px-1.5 py-0.2 rounded bg-[#00E676]/15">
              BULLISH
            </span>
          </div>
          <span className="text-[9px] text-[#4B5565] mt-1 block">Skor sentimen positif komunitas</span>
        </div>
      </div>

      {/* Sentiment Distribution Bar */}
      <div className="bg-[#0D1015] border border-[#1E2430] rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1.5 text-[#00E676] font-bold">
            <Smile className="w-4 h-4" />
            <span>Bullish: 76%</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#F59E0B] font-bold">
            <Meh className="w-4 h-4" />
            <span>Neutral: 15%</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#FF453A] font-bold">
            <Frown className="w-4 h-4" />
            <span>Bearish: 9%</span>
          </div>
        </div>

        {/* Multi-segment Bar */}
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-[#171B24]">
          <div style={{ width: '76%' }} className="h-full bg-[#00E676]" />
          <div style={{ width: '15%' }} className="h-full bg-[#F59E0B]" />
          <div style={{ width: '9%' }} className="h-full bg-[#FF453A]" />
        </div>
      </div>

      {/* Top Influencers Consensus (CMC Feature) */}
      <div className="mb-4">
        <span className="text-[10px] uppercase tracking-wider text-[#8B949E] font-semibold block mb-2">
          Konsensus Top Influencer & Analis
        </span>
        <div className="space-y-2">
          {influencers.map((inf, i) => (
            <div
              key={i}
              className="bg-[#0D1015] border border-[#1E2430] hover:border-[#252D3D] rounded-lg p-2.5 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#1E2430] border border-[#38BDF8]/30 flex items-center justify-center text-xs font-bold text-white">
                  {inf.name[0]}
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">{inf.name}</div>
                  <div className="text-[9px] text-[#8B949E]">{inf.role}</div>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    inf.isBull ? 'bg-[#00E676]/15 text-[#00E676]' : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                  }`}
                >
                  {inf.sentiment}
                </span>
                <span className="text-[9px] text-[#4B5565] block mt-0.5">Skor: {inf.score} / 5</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Community Feed (CMC Live Discussions) */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-[#8B949E] font-semibold block mb-2">
          Diskusi Komunitas Terbaru (Community Feed)
        </span>
        <div className="space-y-2.5">
          {communityPosts.map((post) => (
            <div
              key={post.id}
              className="bg-[#0D1015] border border-[#1E2430] rounded-lg p-3 hover:border-[#38BDF8]/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{post.author}</span>
                  <span className="text-[10px] text-[#4B5565]">{post.handle}</span>
                  <span className="text-[10px] text-[#4B5565]">· {post.time}</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00E676]/15 text-[#00E676]">
                  {post.sentiment}
                </span>
              </div>

              <p className="text-xs text-[#C5CCD6] leading-relaxed mb-2 font-sans">
                {post.text}
              </p>

              <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
                <span>❤️ {post.likes} menyukai</span>
                <span className="text-[#38BDF8]">{post.influence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
