import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, WalletRole } from '@/types';
import { getScore } from '@/lib/utils/scoring';
import { GlassCard } from '@/components/ui/GlassCard';
import { TrendingUp, Users, Shield, AlertTriangle, Award, Zap } from 'lucide-react';

interface InsightsCardProps {
  wallets: Wallet[];
}

export function InsightsCard({ wallets }: InsightsCardProps) {
  const validWallets = wallets.filter(w => w.data && w.role && w.funding);
  
  if (validWallets.length === 0) return null;

  // Calculate insights
  const avgScore = Math.round(
    validWallets.reduce((sum, w) => sum + getScore(w), 0) / validWallets.length
  );

  const roleDistribution = validWallets.reduce((acc, w) => {
    if (w.role) {
      acc[w.role.role] = (acc[w.role.role] || 0) + 1;
    }
    return acc;
  }, {} as Record<WalletRole, number>);

  const fundingDistribution = validWallets.reduce((acc, w) => {
    if (w.funding) {
      const source = w.funding.source;
      acc[source] = (acc[source] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topRole = Object.entries(roleDistribution)
    .sort(([, a], [, b]) => b - a)[0];
  
  const topFunding = Object.entries(fundingDistribution)
    .sort(([, a], [, b]) => b - a)[0];

  const cexFunded = validWallets.filter(w => 
    w.funding && ['binance', 'bybit', 'coinbase', 'okx', 'kraken', 'htx', 'kucoin', 'coinex', 'changenow'].includes(w.funding.source)
  ).length;

  const cexPercentage = Math.round((cexFunded / validWallets.length) * 100);

  const avgAge = Math.round(
    validWallets.reduce((sum, w) => sum + (w.data?.ageInDays || 0), 0) / validWallets.length
  );

  const avgBalance = (
    validWallets.reduce((sum, w) => sum + parseFloat(w.data?.balance || '0'), 0) / validWallets.length
  ).toFixed(2);

  // Risk assessment
  const riskCount = validWallets.filter(w => getScore(w) < 50).length;
  const riskLevel = riskCount / validWallets.length;
  const riskColor = riskLevel > 0.5 ? 'text-red-400' : riskLevel > 0.2 ? 'text-yellow-400' : 'text-green-400';
  const riskLabel = riskLevel > 0.5 ? 'High Risk' : riskLevel > 0.2 ? 'Medium Risk' : 'Low Risk';

  // Key recommendations
  const recommendations: string[] = [];
  
  if (avgScore < 70) {
    recommendations.push('⚠️ Bundle average score is below 70 - consider wallet optimization');
  }
  
  if (cexPercentage < 50) {
    recommendations.push('🏦 Less than 50% CEX-funded - may appear less legitimate');
  }
  
  if (avgAge < 60) {
    recommendations.push('⏰ Average wallet age is low - consider building more history');
  }
  
  if (riskCount > validWallets.length * 0.3) {
    recommendations.push('🚨 Over 30% risky wallets - high chance of detection');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Bundle looks solid! Ready for launch');
  }

  const roleIcons: Record<string, string> = {
    'dev_wallet': '👨‍💻',
    'top_holder': '💎',
    'market_maker': '📊',
    'early_supporter': '🌟',
    'sniper': '⚡',
    'unknown': '❓'
  };

  return (
    <GlassCard className="p-6 mb-6" animate>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-purple-400" />
        <h2 className="text-2xl font-semibold text-white">Bundle Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Average Score */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-purple-400" />
            <p className="text-sm text-gray-400">Avg Score</p>
          </div>
          <p className="text-3xl font-bold text-white">{avgScore}</p>
          <p className="text-xs text-gray-500 mt-1">
            {avgScore >= 80 ? '🎉 Excellent' : avgScore >= 60 ? '👍 Good' : '⚠️ Needs Work'}
          </p>
        </div>

        {/* CEX Funding */}
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-gray-400">CEX Funded</p>
          </div>
          <p className="text-3xl font-bold text-white">{cexPercentage}%</p>
          <p className="text-xs text-gray-500 mt-1">
            {cexFunded}/{validWallets.length} wallets
          </p>
        </div>

        {/* Average Age */}
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-green-400" />
            <p className="text-sm text-gray-400">Avg Age</p>
          </div>
          <p className="text-3xl font-bold text-white">{avgAge}d</p>
          <p className="text-xs text-gray-500 mt-1">
            Avg Balance: {avgBalance} SOL
          </p>
        </div>

        {/* Risk Level */}
        <div className={`bg-gradient-to-br ${
          riskLevel > 0.5 ? 'from-red-500/20 to-orange-500/20 border-red-500/30' :
          riskLevel > 0.2 ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' :
          'from-green-500/20 to-emerald-500/20 border-green-500/30'
        } border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className={`w-5 h-5 ${riskColor}`} />
            <p className="text-sm text-gray-400">Risk Level</p>
          </div>
          <p className={`text-3xl font-bold ${riskColor}`}>{riskLabel}</p>
          <p className="text-xs text-gray-500 mt-1">
            {riskCount} risky wallets
          </p>
        </div>
      </div>

      {/* Distribution Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Role Distribution */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Role Distribution</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(roleDistribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([role, count]) => {
                const percentage = Math.round((count / validWallets.length) * 100);
                const roleName = role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                return (
                  <div key={role} className="flex items-center gap-2">
                    <span className="text-lg">{roleIcons[role] || '❓'}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">{roleName}</span>
                        <span className="text-gray-500">{count} ({percentage}%)</span>
                      </div>
                      <div className="bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Funding Distribution */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Funding Sources</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(fundingDistribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([source, count]) => {
                const percentage = Math.round((count / validWallets.length) * 100);
                const sourceName = source.toUpperCase();
                return (
                  <div key={source} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">{sourceName}</span>
                        <span className="text-gray-500">{count} ({percentage}%)</span>
                      </div>
                      <div className="bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/30 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">💡 Key Recommendations</h3>
        <ul className="space-y-2">
          {recommendations.map((rec, idx) => (
            <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </GlassCard>
  );
}
