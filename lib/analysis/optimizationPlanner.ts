import { Wallet } from '@/types';
import { getScore } from '@/lib/utils/scoring';

export interface OptimizationAction {
  id: string;
  icon: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  priority: number;
}

export interface OptimizationPlan {
  currentScore: number;
  targetScore: number;
  gap: number;
  estimatedDays: number;
  actions: OptimizationAction[];
  summary: string;
}

/**
 * Generate an optimization plan to reach target score (default 100)
 */
export function generateOptimizationPlan(
  wallet: Wallet,
  targetScore: number = 100
): OptimizationPlan | null {
  if (!wallet.data) return null;

  const currentScore = getScore(wallet);
  const gap = targetScore - currentScore;

  if (gap <= 0) {
    return {
      currentScore,
      targetScore,
      gap: 0,
      estimatedDays: 0,
      actions: [],
      summary: '🎉 Perfect! This wallet already meets or exceeds the target score.'
    };
  }

  const actions: OptimizationAction[] = [];
  let estimatedDays = 0;

  const { totalTransactions, recentTransactions, ageInDays, balance } = wallet.data;
  const balanceNum = parseFloat(balance);

  // Analyze what needs improvement
  
  // 1. Age Factor (if wallet is too new)
  if (ageInDays < 30) {
    actions.push({
      id: 'wait-age-30',
      icon: '⏰',
      title: 'Wait for Wallet Maturity',
      description: `Wallet is only ${ageInDays} days old. Wait ${30 - ageInDays} more days to reach 30-day minimum.`,
      impact: 'high',
      timeframe: `${30 - ageInDays} days`,
      priority: 1
    });
    estimatedDays = Math.max(estimatedDays, 30 - ageInDays);
  } else if (ageInDays < 90) {
    actions.push({
      id: 'wait-age-90',
      icon: '⏰',
      title: 'Build Wallet History',
      description: `Wallet age is ${ageInDays} days. Reaching 90+ days will significantly boost score.`,
      impact: 'medium',
      timeframe: `${90 - ageInDays} days`,
      priority: 2
    });
    estimatedDays = Math.max(estimatedDays, 90 - ageInDays);
  }

  // 2. Transaction Count (if too low)
  if (totalTransactions < 20) {
    const needed = 20 - totalTransactions;
    actions.push({
      id: 'add-transactions',
      icon: '📊',
      title: 'Increase Transaction History',
      description: `Add ${needed} more transactions. Perform natural swaps, transfers, or DeFi interactions.`,
      impact: 'high',
      timeframe: '1-2 weeks',
      priority: 1
    });
    estimatedDays = Math.max(estimatedDays, 7);
  } else if (totalTransactions < 50) {
    const needed = 50 - totalTransactions;
    actions.push({
      id: 'boost-transactions',
      icon: '📈',
      title: 'Boost Transaction Count',
      description: `Increase to 50+ transactions (need ${needed} more) for optimal score.`,
      impact: 'medium',
      timeframe: '2-3 weeks',
      priority: 3
    });
    estimatedDays = Math.max(estimatedDays, 14);
  }

  // 3. Balance (if too low)
  if (balanceNum < 1) {
    actions.push({
      id: 'add-balance-min',
      icon: '💰',
      title: 'Add Minimum Balance',
      description: `Current balance is ${balance} SOL. Add at least ${(1 - balanceNum).toFixed(2)} SOL to reach minimum threshold.`,
      impact: 'high',
      timeframe: 'Immediate',
      priority: 1
    });
  } else if (balanceNum < 5) {
    actions.push({
      id: 'increase-balance',
      icon: '💎',
      title: 'Increase Balance',
      description: `Boost balance to 5+ SOL (currently ${balance} SOL) for better credibility.`,
      impact: 'medium',
      timeframe: 'Immediate',
      priority: 2
    });
  }

  // 4. Recent Activity (if too high - overused wallet)
  if (recentTransactions > 50) {
    actions.push({
      id: 'reduce-activity',
      icon: '🛑',
      title: 'Reduce Recent Activity',
      description: `Wallet has ${recentTransactions} transactions in last 7 days. Let it cool down to avoid looking overused.`,
      impact: 'medium',
      timeframe: '1-2 weeks',
      priority: 3
    });
    estimatedDays = Math.max(estimatedDays, 7);
  } else if (recentTransactions === 0 && totalTransactions > 0) {
    actions.push({
      id: 'add-recent-activity',
      icon: '⚡',
      title: 'Add Recent Activity',
      description: 'No recent transactions. Perform 2-5 transactions in the next week to show wallet is active.',
      impact: 'low',
      timeframe: '1 week',
      priority: 4
    });
    estimatedDays = Math.max(estimatedDays, 7);
  }

  // 5. Transaction Pattern Optimization
  if (totalTransactions >= 20 && totalTransactions < 100) {
    actions.push({
      id: 'diversify-interactions',
      icon: '🎯',
      title: 'Diversify Interactions',
      description: 'Interact with different protocols (DEXs, NFTs, staking) to build organic-looking history.',
      impact: 'low',
      timeframe: '2-4 weeks',
      priority: 5
    });
  }

  // 6. Funding Source (if unknown or suspicious)
  if (wallet.funding && wallet.funding.source === 'unknown') {
    actions.push({
      id: 'cex-funding',
      icon: '🏦',
      title: 'Fund from Reputable CEX',
      description: 'Consider funding future wallets from major CEXs (Binance, Coinbase, etc.) for better legitimacy.',
      impact: 'low',
      timeframe: 'For next launch',
      priority: 6
    });
  }

  // Sort actions by priority
  actions.sort((a, b) => a.priority - b.priority);

  // Generate summary
  const highPriorityCount = actions.filter(a => a.impact === 'high').length;
  const summary = gap <= 10
    ? `You're close! ${actions.length} small improvement${actions.length > 1 ? 's' : ''} needed.`
    : gap <= 30
    ? `${actions.length} action${actions.length > 1 ? 's' : ''} required. Focus on ${highPriorityCount} high-priority item${highPriorityCount > 1 ? 's' : ''} first.`
    : `Major improvements needed. Start with the ${highPriorityCount} critical action${highPriorityCount > 1 ? 's' : ''}.`;

  return {
    currentScore,
    targetScore,
    gap,
    estimatedDays: Math.max(1, estimatedDays),
    actions: actions.slice(0, 6), // Max 6 actions for readability
    summary
  };
}
