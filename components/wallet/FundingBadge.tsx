import React from 'react';

interface FundingBadgeProps {
  source: string;
  sourceName: string;
  confidence: number;
}

export function FundingBadge({ source, sourceName, confidence }: FundingBadgeProps) {
  const icons: Record<string, string> = {
    binance: '🟨',
    bybit: '🟧',
    coinbase: '🔵',
    okx: '⚫',
    kraken: '🟣',
    htx: '🔴',
    kucoin: '🟢',
    coinex: '🟡',
    changenow: '🔄',
    likely_cex: '🏦',
    direct_transfer: '↔️',
    dex_trade: '🔀',
    unknown: '❓'
  };
  
  const colors: Record<string, string> = {
    binance: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    bybit: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    coinbase: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    okx: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
    kraken: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    htx: 'bg-red-500/20 text-red-400 border-red-500/30',
    kucoin: 'bg-green-500/20 text-green-400 border-green-500/30',
    coinex: 'bg-yellow-600/20 text-yellow-500 border-yellow-600/30',
    changenow: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    likely_cex: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    direct_transfer: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    dex_trade: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    unknown: 'bg-gray-600/20 text-gray-500 border-gray-600/30'
  };
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${colors[source] || colors.unknown}`}>
      <span className="text-sm">{icons[source] || icons.unknown}</span>
      <span>{sourceName}</span>
      {confidence > 0 && confidence < 100 && (
        <span className="text-xs opacity-70">({confidence}%)</span>
      )}
    </div>
  );
}
