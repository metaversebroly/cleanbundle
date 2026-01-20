'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet } from '@/types';
import { getScore } from '@/lib/utils/scoring';
import { WalletConnection } from '@/lib/analysis/patternDetector';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, CheckCircle, TrendingDown, Clock, Link as LinkIcon } from 'lucide-react';

interface CriticalIssuesBoxProps {
  wallets: Wallet[];
  connections: WalletConnection[];
}

interface Issue {
  severity: 'critical' | 'warning' | 'info';
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function CriticalIssuesBox({ wallets, connections }: CriticalIssuesBoxProps) {
  const issues: Issue[] = [];
  const validWallets = wallets.filter(w => w.data);

  if (validWallets.length === 0) return null;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. CHECK FOR WALLET CONNECTIONS (CRITICAL)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (connections.length > 0) {
    // Find hub wallet (most connections)
    const connectionCount = new Map<string, number>();
    connections.forEach(conn => {
      connectionCount.set(conn.from, (connectionCount.get(conn.from) || 0) + 1);
      connectionCount.set(conn.to, (connectionCount.get(conn.to) || 0) + 1);
    });

    const hubEntries = Array.from(connectionCount.entries())
      .sort(([, a], [, b]) => b - a);
    
    const [hubAddress, hubCount] = hubEntries[0];
    const hubWallet = wallets.find(w => w.address === hubAddress);

    issues.push({
      severity: 'critical',
      icon: <LinkIcon className="w-5 h-5 text-red-400" />,
      title: `${connections.length} wallet connection${connections.length > 1 ? 's' : ''} detected`,
      description: hubWallet && hubCount >= 2
        ? `Wallet #${hubWallet.id} (${hubAddress.slice(0, 4)}...${hubAddress.slice(-4)}) is connected to ${hubCount} other wallet${hubCount > 1 ? 's' : ''} in bundle. This will be visible on bubble maps!`
        : `Wallets have sent SOL to each other. These connections will be visible on bubble maps and could flag your bundle.`,
      action: {
        label: 'View Bubble Map',
        onClick: () => {
          const bubbleMap = document.querySelector('.bubble-map-container');
          bubbleMap?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. CHECK AVERAGE AGE (WARNING)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const avgAge = Math.round(
    validWallets.reduce((sum, w) => sum + (w.data?.ageInDays || 0), 0) / validWallets.length
  );

  if (avgAge < 30) {
    const daysNeeded = 30 - avgAge;
    issues.push({
      severity: 'warning',
      icon: <Clock className="w-5 h-5 text-yellow-400" />,
      title: 'Young wallets detected',
      description: `Average wallet age: ${avgAge} days (recommended: 30+). Consider waiting ${daysNeeded} more days before launch for better credibility.`,
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. CHECK FOR LOW SCORES (WARNING)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const lowScoreWallets = validWallets.filter(w => getScore(w) < 50);
  if (lowScoreWallets.length > 0) {
    const percentage = Math.round((lowScoreWallets.length / validWallets.length) * 100);
    issues.push({
      severity: 'warning',
      icon: <TrendingDown className="w-5 h-5 text-orange-400" />,
      title: `${lowScoreWallets.length} wallet${lowScoreWallets.length > 1 ? 's' : ''} with poor health`,
      description: `${percentage}% of your bundle has scores below 50. These wallets need more transactions, age, or better balance to look legitimate.`,
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. CHECK AVERAGE SCORE (INFO)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const avgScore = Math.round(
    validWallets.reduce((sum, w) => sum + getScore(w), 0) / validWallets.length
  );

  if (avgScore < 70 && lowScoreWallets.length === 0) {
    issues.push({
      severity: 'info',
      icon: <TrendingDown className="w-5 h-5 text-blue-400" />,
      title: 'Average bundle health could be improved',
      description: `Bundle average score: ${avgScore}/100. While no critical issues, consider improving wallet activity and age for stronger credibility.`,
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. CHECK FOR SHARED FUNDING (INFO)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const fundingSources = new Map<string, number>();
  validWallets.forEach(w => {
    if (w.funding?.source && w.funding.source !== 'unknown') {
      fundingSources.set(w.funding.source, (fundingSources.get(w.funding.source) || 0) + 1);
    }
  });

  const dominantFunding = Array.from(fundingSources.entries())
    .find(([, count]) => count >= validWallets.length * 0.7); // 70%+ from same source

  if (dominantFunding) {
    const [source, count] = dominantFunding;
    const percentage = Math.round((count / validWallets.length) * 100);
    issues.push({
      severity: 'info',
      icon: <AlertTriangle className="w-5 h-5 text-blue-400" />,
      title: 'Most wallets funded from same source',
      description: `${percentage}% of wallets funded via ${source}. While CEX funding is acceptable, extreme concentration might raise flags.`,
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // IF NO ISSUES - SHOW SUCCESS MESSAGE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (issues.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-green-400 mb-1">
                Bundle Looks Great! 🎉
              </h3>
              <p className="text-gray-300">
                No critical issues detected. Your bundle has good health scores, no suspicious connections, and decent wallet age. Ready for launch! 🚀
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SHOW ISSUES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'from-red-500/10 to-orange-500/10 border-red-500/30';
      case 'warning':
        return 'from-yellow-500/10 to-orange-500/10 border-yellow-500/30';
      default:
        return 'from-blue-500/10 to-cyan-500/10 border-blue-500/30';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">
              ⚠️ Issues Detected
            </h3>
            <p className="text-gray-400 text-sm">
              {criticalCount > 0 && (
                <span className="text-red-400 font-semibold">
                  {criticalCount} critical
                </span>
              )}
              {criticalCount > 0 && warningCount > 0 && <span className="text-gray-500"> • </span>}
              {warningCount > 0 && (
                <span className="text-yellow-400 font-semibold">
                  {warningCount} warning{warningCount > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-3xl">
              {criticalCount > 0 ? '🔴' : warningCount > 0 ? '🟡' : '🔵'}
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-3">
          {issues.map((issue, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className={`bg-gradient-to-r ${getSeverityColor(issue.severity)} border rounded-xl p-4`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {issue.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${getSeverityBadge(issue.severity)}`}>
                        {issue.severity.toUpperCase()}
                      </span>
                      <h4 className="font-semibold text-white text-sm">
                        {issue.title}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>
                </div>
                {issue.action && (
                  <Button
                    onClick={issue.action.onClick}
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 text-xs hover:bg-white/10"
                  >
                    {issue.action.label} →
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Suggestions */}
        {criticalCount > 0 && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <h4 className="text-sm font-semibold text-red-400 mb-2">
              🚨 Action Required
            </h4>
            <p className="text-sm text-gray-300 mb-3">
              Critical issues detected. Your bundle needs attention before launch:
            </p>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              {connections.length > 0 && (
                <li>Remove connected wallets or use them in separate bundles</li>
              )}
              {lowScoreWallets.length > 0 && (
                <li>Improve low-score wallets with more transactions and activity</li>
              )}
            </ul>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
