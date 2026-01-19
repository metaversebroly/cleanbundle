import { Wallet, WalletRole, RoleRecommendation } from '@/types';

/**
 * Recommend the best role for a wallet based on its characteristics
 */
export function recommendRole(
  wallet: Wallet,
  fundingSource: string
): RoleRecommendation {
  if (!wallet.data) {
    return {
      role: WalletRole.UNKNOWN,
      confidence: 0,
      score: 0,
      reasons: ['No data available'],
      concerns: ['Wallet analysis incomplete']
    };
  }
  
  const scores = {
    dev_wallet: calculateDevScore(wallet, fundingSource),
    top_holder: calculateHolderScore(wallet, fundingSource),
    market_maker: calculateMMScore(wallet, fundingSource),
    early_supporter: calculateSupporterScore(wallet, fundingSource),
    sniper: calculateSniperScore(wallet, fundingSource)
  };
  
  // Find best role
  const [role, score] = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])[0];
  
  const walletRole = role as WalletRole;
  
  return {
    role: walletRole,
    confidence: Math.round(score),
    score: Math.round(score),
    reasons: generateReasons(wallet, walletRole, fundingSource),
    concerns: findConcerns(wallet, walletRole)
  };
}

/**
 * Calculate score for Dev Wallet role
 * Ideal: Old, CEX-funded, low activity, moderate balance
 */
function calculateDevScore(wallet: Wallet, funding: string): number {
  if (!wallet.data) return 0;
  
  let score = 0;
  const { ageInDays, totalTransactions, recentTransactions, balance } = wallet.data;
  const balanceNum = parseFloat(balance);
  
  // Age factor (max 30 points) - older is better
  if (ageInDays > 180) score += 30;
  else if (ageInDays > 90) score += 20;
  else if (ageInDays > 30) score += 10;
  
  // Balance factor (max 25 points) - sweet spot 5-100 SOL
  if (balanceNum >= 5 && balanceNum <= 100) score += 25;
  else if (balanceNum >= 2 && balanceNum <= 200) score += 15;
  else if (balanceNum >= 1) score += 5;
  
  // Transaction count (max 20 points) - not too much
  if (totalTransactions >= 20 && totalTransactions <= 100) score += 20;
  else if (totalTransactions >= 10 && totalTransactions <= 200) score += 10;
  else if (totalTransactions >= 5) score += 5;
  
  // Recent activity (max 15 points) - LOW is GOOD for dev
  if (recentTransactions <= 3) score += 15;
  else if (recentTransactions <= 10) score += 7;
  else if (recentTransactions <= 20) score += 3;
  
  // Funding source (max 10 points) - CEX is best
  if (['binance', 'bybit', 'coinbase', 'okx', 'kraken', 'htx', 'kucoin', 'coinex', 'changenow'].includes(funding)) {
    score += 10;
  } else if (funding === 'likely_cex') {
    score += 5;
  }
  
  return Math.min(100, score);
}

/**
 * Calculate score for Top Holder role
 * Ideal: Large balance, moderate activity, mature
 */
function calculateHolderScore(wallet: Wallet, funding: string): number {
  if (!wallet.data) return 0;
  
  let score = 0;
  const { ageInDays, totalTransactions, recentTransactions, balance } = wallet.data;
  const balanceNum = parseFloat(balance);
  
  // Balance factor (max 40 points) - BIG is key
  if (balanceNum >= 50) score += 40;
  else if (balanceNum >= 20) score += 30;
  else if (balanceNum >= 10) score += 20;
  else if (balanceNum >= 5) score += 10;
  
  // Age factor (max 25 points)
  if (ageInDays > 90) score += 25;
  else if (ageInDays > 60) score += 15;
  else if (ageInDays > 30) score += 10;
  
  // Transaction count (max 20 points) - moderate activity
  if (totalTransactions >= 50 && totalTransactions <= 500) score += 20;
  else if (totalTransactions >= 20 && totalTransactions <= 1000) score += 10;
  else if (totalTransactions >= 10) score += 5;
  
  // Recent activity (max 15 points) - some activity is good
  if (recentTransactions >= 5 && recentTransactions <= 30) score += 15;
  else if (recentTransactions >= 1 && recentTransactions <= 50) score += 8;
  
  return Math.min(100, score);
}

/**
 * Calculate score for Market Maker role
 * Ideal: Very high activity, good balance, recent trades
 */
function calculateMMScore(wallet: Wallet, funding: string): number {
  if (!wallet.data) return 0;
  
  let score = 0;
  const { ageInDays, totalTransactions, recentTransactions, balance } = wallet.data;
  const balanceNum = parseFloat(balance);
  
  // Transaction count (max 40 points) - VERY HIGH is key
  if (totalTransactions >= 500) score += 40;
  else if (totalTransactions >= 200) score += 30;
  else if (totalTransactions >= 100) score += 20;
  else if (totalTransactions >= 50) score += 10;
  
  // Recent activity (max 30 points) - HIGH recent activity
  if (recentTransactions >= 50) score += 30;
  else if (recentTransactions >= 20) score += 20;
  else if (recentTransactions >= 10) score += 10;
  else if (recentTransactions >= 5) score += 5;
  
  // Balance factor (max 20 points) - needs capital
  if (balanceNum >= 10 && balanceNum <= 100) score += 20;
  else if (balanceNum >= 5 && balanceNum <= 200) score += 10;
  else if (balanceNum >= 2) score += 5;
  
  // Age factor (max 10 points)
  if (ageInDays > 60) score += 10;
  else if (ageInDays > 30) score += 5;
  
  return Math.min(100, score);
}

/**
 * Calculate score for Early Supporter role
 * Ideal: Good history, medium balance, consistent activity
 */
function calculateSupporterScore(wallet: Wallet, funding: string): number {
  if (!wallet.data) return 0;
  
  let score = 0;
  const { ageInDays, totalTransactions, recentTransactions, balance } = wallet.data;
  const balanceNum = parseFloat(balance);
  
  // Age factor (max 30 points) - needs history
  if (ageInDays > 120) score += 30;
  else if (ageInDays > 60) score += 20;
  else if (ageInDays > 30) score += 10;
  
  // Transaction count (max 25 points) - moderate
  if (totalTransactions >= 100 && totalTransactions <= 300) score += 25;
  else if (totalTransactions >= 50 && totalTransactions <= 500) score += 15;
  else if (totalTransactions >= 20) score += 8;
  
  // Balance factor (max 25 points) - medium bag
  if (balanceNum >= 5 && balanceNum <= 50) score += 25;
  else if (balanceNum >= 2 && balanceNum <= 100) score += 15;
  else if (balanceNum >= 1) score += 8;
  
  // Recent activity (max 20 points) - consistent
  if (recentTransactions >= 5 && recentTransactions <= 20) score += 20;
  else if (recentTransactions >= 1 && recentTransactions <= 30) score += 10;
  
  return Math.min(100, score);
}

/**
 * Calculate score for Sniper role
 * Ideal: High activity, quick trades, recent wallet
 */
function calculateSniperScore(wallet: Wallet, funding: string): number {
  if (!wallet.data) return 0;
  
  let score = 0;
  const { ageInDays, totalTransactions, recentTransactions, balance } = wallet.data;
  const balanceNum = parseFloat(balance);
  
  // Recent activity (max 35 points) - VERY active recently
  if (recentTransactions >= 100) score += 35;
  else if (recentTransactions >= 50) score += 25;
  else if (recentTransactions >= 20) score += 15;
  else if (recentTransactions >= 10) score += 8;
  
  // Transaction count (max 30 points) - high volume
  if (totalTransactions >= 200) score += 30;
  else if (totalTransactions >= 100) score += 20;
  else if (totalTransactions >= 50) score += 10;
  
  // Balance factor (max 20 points) - operational balance
  if (balanceNum >= 2 && balanceNum <= 20) score += 20;
  else if (balanceNum >= 1 && balanceNum <= 50) score += 10;
  else if (balanceNum >= 0.5) score += 5;
  
  // Age factor (max 15 points) - can be newer
  if (ageInDays >= 30 && ageInDays <= 180) score += 15;
  else if (ageInDays >= 7 && ageInDays <= 365) score += 8;
  
  return Math.min(100, score);
}

/**
 * Generate human-readable reasons for role recommendation
 */
function generateReasons(
  wallet: Wallet,
  role: WalletRole,
  funding: string
): string[] {
  if (!wallet.data) return [];
  
  const reasons: string[] = [];
  const { ageInDays, totalTransactions, recentTransactions, balance } = wallet.data;
  const balanceNum = parseFloat(balance);
  
  switch (role) {
    case WalletRole.DEV_WALLET:
      if (ageInDays > 180) reasons.push(`✅ Mature wallet (${ageInDays} days old)`);
      if (['binance', 'bybit', 'coinbase', 'okx', 'kraken'].includes(funding)) {
        reasons.push(`✅ CEX funded (${funding.toUpperCase()}) - legitimate`);
      }
      if (recentTransactions <= 3) reasons.push(`✅ Low recent activity (not overused)`);
      if (balanceNum >= 5) reasons.push(`✅ Adequate balance (${balance} SOL)`);
      if (totalTransactions >= 20 && totalTransactions <= 100) {
        reasons.push(`✅ Moderate transaction history`);
      }
      break;
      
    case WalletRole.TOP_HOLDER:
      if (balanceNum >= 20) reasons.push(`✅ Large balance (${balance} SOL)`);
      if (ageInDays > 90) reasons.push(`✅ Established wallet (${ageInDays} days)`);
      if (totalTransactions >= 50) reasons.push(`✅ Active participant`);
      if (recentTransactions >= 5) reasons.push(`✅ Currently active`);
      break;
      
    case WalletRole.MARKET_MAKER:
      if (totalTransactions >= 500) reasons.push(`✅ Very high activity (${totalTransactions} TXs)`);
      if (recentTransactions >= 50) reasons.push(`✅ Constantly trading`);
      if (balanceNum >= 10) reasons.push(`✅ Good liquidity (${balance} SOL)`);
      break;
      
    case WalletRole.EARLY_SUPPORTER:
      if (ageInDays > 120) reasons.push(`✅ Long-term holder (${ageInDays} days)`);
      if (balanceNum >= 5 && balanceNum <= 50) reasons.push(`✅ Medium bag holder`);
      if (totalTransactions >= 100) reasons.push(`✅ Consistent activity`);
      break;
      
    case WalletRole.SNIPER:
      if (recentTransactions >= 20) reasons.push(`✅ Very active recently`);
      if (totalTransactions >= 100) reasons.push(`✅ High-frequency trader`);
      if (balanceNum >= 2) reasons.push(`✅ Operational balance`);
      break;
  }
  
  return reasons.slice(0, 3); // Max 3 reasons
}

/**
 * Find concerns/red flags for the recommended role
 */
function findConcerns(wallet: Wallet, role: WalletRole): string[] {
  if (!wallet.data) return [];
  
  const concerns: string[] = [];
  const { ageInDays, totalTransactions, recentTransactions, balance } = wallet.data;
  const balanceNum = parseFloat(balance);
  
  switch (role) {
    case WalletRole.DEV_WALLET:
      if (ageInDays < 30) concerns.push(`⚠️ Wallet too new (${ageInDays} days)`);
      if (recentTransactions > 20) concerns.push(`⚠️ High recent activity`);
      if (balanceNum < 1) concerns.push(`⚠️ Low balance`);
      if (totalTransactions < 10) concerns.push(`⚠️ Very little history`);
      break;
      
    case WalletRole.TOP_HOLDER:
      if (balanceNum < 10) concerns.push(`⚠️ Balance could be higher`);
      if (ageInDays < 60) concerns.push(`⚠️ Relatively new wallet`);
      break;
      
    case WalletRole.MARKET_MAKER:
      if (totalTransactions < 200) concerns.push(`⚠️ Activity could be higher`);
      if (balanceNum < 5) concerns.push(`⚠️ Low liquidity`);
      break;
      
    case WalletRole.EARLY_SUPPORTER:
      if (ageInDays < 60) concerns.push(`⚠️ Not enough history`);
      if (recentTransactions === 0) concerns.push(`⚠️ No recent activity`);
      break;
      
    case WalletRole.SNIPER:
      if (recentTransactions < 10) concerns.push(`⚠️ Low recent activity for sniper`);
      break;
  }
  
  return concerns.slice(0, 2); // Max 2 concerns
}
