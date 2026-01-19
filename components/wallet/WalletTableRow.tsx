import React from 'react';
import { Wallet } from '@/types';
import { getScore, getBadge } from '@/lib/utils/scoring';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { RoleBadge } from '@/components/wallet/RoleBadge';
import { FundingBadge } from '@/components/wallet/FundingBadge';
import { ChevronDown } from 'lucide-react';

interface WalletTableRowProps {
  wallet: Wallet;
  onRetry: (walletId: number) => void;
  isExpanded?: boolean;
}

export function WalletTableRow({ wallet, onRetry, isExpanded = false }: WalletTableRowProps) {
  const score = getScore(wallet);
  const badge = getBadge(score);
  const canExpand = wallet.data && wallet.role && wallet.funding;

  return (
    <>
      <td className="px-4 py-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          {canExpand && (
            <ChevronDown 
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          )}
          <span>{wallet.id}</span>
        </div>
      </td>
      <td className="px-4 py-4 font-mono text-xs text-purple-400 group-hover:text-purple-300 transition-colors">
        {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
      </td>
      <td className="px-4 py-4">
        {wallet.loading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-gray-400 text-sm">Loading...</span>
          </div>
        ) : wallet.error ? (
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-sm" title={wallet.error}>⚠️ Error</span>
            <Button
              onClick={() => onRetry(wallet.id)}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              🔄 Retry
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 animate-pop-in">
            <span className="text-xl">{badge.emoji}</span>
            <span className={`font-semibold ${badge.color}`}>{score}</span>
          </div>
        )}
      </td>
      <td className="px-4 py-4">
        {wallet.role ? (
          <RoleBadge role={wallet.role.role} confidence={wallet.role.confidence} />
        ) : (
          <span className="text-gray-500 text-xs">-</span>
        )}
      </td>
      <td className="px-4 py-4">
        {wallet.funding ? (
          <FundingBadge 
            source={wallet.funding.source} 
            sourceName={wallet.funding.sourceName}
            confidence={wallet.funding.confidence}
          />
        ) : (
          <span className="text-gray-500 text-xs">-</span>
        )}
      </td>
      <td className="px-4 py-4 text-sm text-gray-300 group-hover:text-white transition-colors">
        {wallet.data ? wallet.data.totalTransactions : '-'}
      </td>
      <td className="px-4 py-4 text-sm">
        {wallet.data ? (
          <span className={wallet.data.recentTransactions >= 3 ? 'text-green-400' : 'text-yellow-400'}>
            {wallet.data.recentTransactions}
          </span>
        ) : '-'}
      </td>
      <td className="px-4 py-4 text-sm text-gray-300 group-hover:text-white transition-colors">
        {wallet.data ? `${wallet.data.ageInDays}d` : '-'}
      </td>
      <td className="px-4 py-4 text-sm text-gray-300 group-hover:text-white transition-colors">
        {wallet.data ? `${wallet.data.balance} SOL` : '-'}
      </td>
    </>
  );
}
