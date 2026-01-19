import { Wallet, ScoreBadge } from '@/types';

export const getScore = (wallet: Wallet): number => {
  if (!wallet.data) return 0;
  const { totalTransactions, recentTransactions, ageInDays } = wallet.data;
  
  let score = 0;
  if (totalTransactions > 100) score += 40;
  else if (totalTransactions > 50) score += 30;
  else if (totalTransactions > 10) score += 20;
  else if (totalTransactions > 0) score += 10;

  if (recentTransactions >= 3) score += 40;
  else if (recentTransactions >= 1) score += 20;

  if (ageInDays > 30) score += 20;
  else if (ageInDays > 7) score += 10;

  return score;
};

export const getBadge = (score: number): ScoreBadge => {
  if (score >= 80) return { emoji: '🟢', color: 'text-green-400' };
  if (score >= 50) return { emoji: '🟡', color: 'text-yellow-400' };
  return { emoji: '🔴', color: 'text-red-400' };
};
