import React from 'react';
import { motion } from 'framer-motion';
import { Wallet } from '@/types';
import { ChevronDown, TrendingUp, AlertTriangle, Shield, Info, Target } from 'lucide-react';
import { generateOptimizationPlan, OptimizationPlan } from '@/lib/analysis/optimizationPlanner';

interface ExpandedWalletDetailsProps {
  wallet: Wallet;
  isExpanded: boolean;
}

export function ExpandedWalletDetails({ wallet, isExpanded }: ExpandedWalletDetailsProps) {
  if (!isExpanded || !wallet.role || !wallet.funding) return null;

  const optimizationPlan = generateOptimizationPlan(wallet, 100);

  return (
    <motion.tr
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 border-t border-white/10"
    >
      <td colSpan={9} className="px-4 py-6">
        <div className="space-y-6 max-w-6xl">
          {/* Optimization Plan */}
          {optimizationPlan && optimizationPlan.gap > 0 && (
            <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/30 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-white">Optimization Plan to Reach {optimizationPlan.targetScore}</h3>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Current: {optimizationPlan.currentScore}</span>
                    <span className="text-gray-400">Target: {optimizationPlan.targetScore}</span>
                  </div>
                  <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(optimizationPlan.currentScore / optimizationPlan.targetScore) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="bg-gradient-to-r from-orange-500 to-pink-500 h-full"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Gap</p>
                  <p className="text-2xl font-bold text-orange-400">{optimizationPlan.gap}</p>
                </div>
              </div>

              <p className="text-sm text-gray-300 mb-4 italic">{optimizationPlan.summary}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {optimizationPlan.actions.map((action) => (
                  <div 
                    key={action.id}
                    className={`bg-white/5 border rounded-lg p-3 ${
                      action.impact === 'high' ? 'border-red-500/30' :
                      action.impact === 'medium' ? 'border-yellow-500/30' :
                      'border-gray-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xl">{action.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">{action.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{action.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        action.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                        action.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {action.impact.toUpperCase()} IMPACT
                      </span>
                      <span className="text-xs text-gray-500">{action.timeframe}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center text-sm text-gray-400">
                ⏱️ Estimated time to reach target: <span className="font-semibold text-orange-400">{optimizationPlan.estimatedDays} day{optimizationPlan.estimatedDays > 1 ? 's' : ''}</span>
              </div>
            </div>
          )}

          {optimizationPlan && optimizationPlan.gap === 0 && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-5 text-center">
              <p className="text-lg font-semibold text-green-400">🎉 {optimizationPlan.summary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Role Analysis */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Role Analysis</h3>
            </div>

            {/* Reasons */}
            {wallet.role.reasons && wallet.role.reasons.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Strengths
                </h4>
                <ul className="space-y-1.5">
                  {wallet.role.reasons.map((reason, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {wallet.role.concerns && wallet.role.concerns.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-1.5">
                  {wallet.role.concerns.map((concern, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Role Score Breakdown */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Role Confidence</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${wallet.role.confidence}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full"
                  />
                </div>
                <span className="text-lg font-bold text-purple-400">{wallet.role.confidence}%</span>
              </div>
            </div>
          </div>

          {/* Funding Analysis */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Funding Analysis</h3>
            </div>

            {/* Funding Evidence */}
            {wallet.funding.evidence && wallet.funding.evidence.length > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Evidence</h4>
                <ul className="space-y-1.5">
                  {wallet.funding.evidence.map((evidence, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{evidence}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Funding Confidence */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Detection Confidence</h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${wallet.funding.confidence}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full"
                  />
                </div>
                <span className="text-lg font-bold text-blue-400">{wallet.funding.confidence}%</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Total TXs</p>
                  <p className="text-lg font-semibold text-white">{wallet.data?.totalTransactions || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Recent (7d)</p>
                  <p className="text-lg font-semibold text-green-400">{wallet.data?.recentTransactions || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Wallet Age</p>
                  <p className="text-lg font-semibold text-white">{wallet.data?.ageInDays || 0}d</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Balance</p>
                  <p className="text-lg font-semibold text-white">{wallet.data?.balance || 0} SOL</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </td>
    </motion.tr>
  );
}
