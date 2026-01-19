import React from 'react';
import { WalletRole } from '@/types';

interface RoleBadgeProps {
  role: WalletRole;
  confidence: number;
}

export function RoleBadge({ role, confidence }: RoleBadgeProps) {
  const config: Record<WalletRole, { icon: string; label: string; color: string }> = {
    [WalletRole.DEV_WALLET]: {
      icon: '👨‍💻',
      label: 'Dev Wallet',
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    },
    [WalletRole.TOP_HOLDER]: {
      icon: '💎',
      label: 'Top Holder',
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    [WalletRole.MARKET_MAKER]: {
      icon: '📊',
      label: 'Market Maker',
      color: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    [WalletRole.EARLY_SUPPORTER]: {
      icon: '🌟',
      label: 'Early Supporter',
      color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    },
    [WalletRole.SNIPER]: {
      icon: '⚡',
      label: 'Sniper',
      color: 'bg-red-500/20 text-red-400 border-red-500/30'
    },
    [WalletRole.UNKNOWN]: {
      icon: '❓',
      label: 'Unknown',
      color: 'bg-gray-600/20 text-gray-500 border-gray-600/30'
    }
  };
  
  const { icon, label, color } = config[role] || config[WalletRole.UNKNOWN];
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${color}`}>
      <span className="text-sm">{icon}</span>
      <span>{label}</span>
      {confidence > 0 && confidence < 100 && (
        <span className="text-xs opacity-70">({confidence}%)</span>
      )}
    </div>
  );
}
