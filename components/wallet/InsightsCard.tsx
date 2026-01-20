import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, WalletRole } from '@/types';
import { getScore } from '@/lib/utils/scoring';
import { GlassCard } from '@/components/ui/GlassCard';
import { TrendingUp, Users, Shield, AlertTriangle, Award, Zap } from 'lucide-react';
import { detectPatterns, PatternAnalysis } from '@/lib/analysis/patternDetector';
import { PatternWarnings } from '@/components/wallet/PatternWarnings';
import { getSolanaConnection } from '@/lib/solana/connection';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { WalletConnection } from '@/lib/analysis/patternDetector';

interface InsightsCardProps {
  wallets: Wallet[];
  onConnectionsDetected?: (connectedAddresses: Set<string>, connections: WalletConnection[]) => void;
}

export function InsightsCard({ wallets, onConnectionsDetected }: InsightsCardProps) {
  console.log('\n🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨');
  console.log('🚨 INSIGHTS CARD RENDERED!');
  console.log(`🚨 Total wallets: ${wallets.length}`);
  console.log('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\n');
  
  wallets.forEach((w, i) => {
    console.log(`Wallet ${i + 1}: ${w.address.slice(0, 8)}...`);
    console.log(`  ✓ Has data? ${!!w.data}`);
    console.log(`  ✓ Has role? ${!!w.role}`);
    console.log(`  ✓ Has funding? ${!!w.funding}`);
    if (w.data) {
      console.log(`    - TXs: ${w.data.totalTransactions}, Age: ${w.data.ageInDays}d`);
    }
    if (w.role) {
      console.log(`    - Role: ${w.role.role} (${w.role.confidence}%)`);
    }
    if (w.funding) {
      console.log(`    - Funding: ${w.funding.source}`);
    }
  });
  
  const [patternAnalysis, setPatternAnalysis] = React.useState<PatternAnalysis | null>(null);
  const [analyzingPatterns, setAnalyzingPatterns] = React.useState(false);
  
  // ✅ FIX: Only require data, not funding (pattern detection works without it!)
  const validWallets = wallets.filter(w => w.data);
  
  console.log(`\n✅ Valid wallets count: ${validWallets.length}/${wallets.length}`);
  
  // ✅ NEW: Check if wallets are still loading
  const hasLoadingWallets = wallets.some(w => w.loading);
  const hasAnyWallets = wallets.length > 0;
  
  console.log(`⏳ Has loading wallets? ${hasLoadingWallets}`);
  console.log(`📊 Has any wallets? ${hasAnyWallets}`);
  
  // ✅ NEW: If no wallets at all, return null
  if (!hasAnyWallets) {
    console.log('❌ NO WALLETS AT ALL - InsightsCard returning null!\n');
    return null;
  }
  
  // ✅ NEW: If wallets are still loading AND no valid wallets yet, show loading state
  if (hasLoadingWallets && validWallets.length === 0) {
    console.log('⏳ WALLETS STILL LOADING - Showing loading state...\n');
    return (
      <GlassCard className="p-6 mb-8">
        <div className="flex items-center justify-center gap-3 text-gray-400 py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
          <span>Loading wallet data for pattern analysis...</span>
        </div>
      </GlassCard>
    );
  }
  
  // ✅ NEW: Only return null if wallets finished loading but all failed
  if (validWallets.length === 0 && !hasLoadingWallets) {
    console.log('❌ NO VALID WALLETS (after loading finished) - InsightsCard returning null!\n');
    return null;
  }
  
  console.log('✅ InsightsCard will render (valid wallets found)\n');
  
  // Run pattern detection
  React.useEffect(() => {
    console.log('\n🔥 useEffect TRIGGERED!');
    console.log(`🔥 validWallets.length: ${validWallets.length}`);
    console.log(`🔥 wallets.length: ${wallets.length}\n`);
    
    async function analyzePatterns() {
      console.log('🚨 analyzePatterns() function called!');
      
      if (validWallets.length < 2) {
        console.log(`❌ NOT ENOUGH VALID WALLETS: ${validWallets.length}/2 needed`);
        console.log('⚠️ Skipping pattern detection\n');
        return;
      }
      
      console.log('✅ Enough valid wallets, proceeding...');
      
      setAnalyzingPatterns(true);
      try {
        console.log('🚨 ABOUT TO CALL detectPatterns()...');
        const connection = getSolanaConnection();
        // ✅ Pass ALL wallets, not just validWallets, to scan all combinations
        const analysis = await detectPatterns(connection, wallets);
        console.log('🚨 detectPatterns() RETURNED!');
        console.log('🚨 Analysis result:', analysis);
        setPatternAnalysis(analysis);
        
        // ✅ Notify parent about connected wallet addresses and connections
        if (onConnectionsDetected) {
          const connectedAddresses = new Set<string>();
          analysis.connections.forEach(conn => {
            connectedAddresses.add(conn.from);
            connectedAddresses.add(conn.to);
          });
          console.log('🔗 Notifying parent of connected addresses:', Array.from(connectedAddresses));
          onConnectionsDetected(connectedAddresses, analysis.connections);
        }
      } catch (error) {
        console.error('❌ [Pattern] Error analyzing patterns:', error);
        // Show error in UI
        setPatternAnalysis({
          warnings: [{
            id: 'error',
            severity: 'HIGH',
            type: 'connection',
            title: 'Pattern detection failed',
            description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            affectedWallets: [],
            details: error
          }],
          connections: [],
          fundingClusters: new Map(),
          suspicionScore: 0
        });
      } finally {
        setAnalyzingPatterns(false);
      }
    }
    
    analyzePatterns();
  }, [wallets.map(w => w.address).join(',')]);

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

      {/* Pattern Analysis Section */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-orange-400" />
          <h2 className="text-xl font-semibold text-white">🕵️ Pattern Detection</h2>
        </div>
        
        {analyzingPatterns ? (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center">
            <LoadingSpinner size="md" />
            <p className="text-gray-400 mt-3">Analyzing cross-wallet patterns...</p>
            <p className="text-xs text-gray-500 mt-1">Checking funding sources, connections, timing, and amounts</p>
          </div>
        ) : patternAnalysis ? (
          <PatternWarnings 
            warnings={patternAnalysis.warnings}
            connections={patternAnalysis.connections}
          />
        ) : null}
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/30 rounded-lg p-4 mt-6">
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
