import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';
import { checkKnownCEX, formatCEXName } from '@/lib/data/knownAddresses';
import { FundingAnalysis } from '@/types';

interface FirstDeposit {
  from: string;
  amount: number;
  timestamp: number;
  signature: string;
}

/**
 * Detect the funding source of a wallet
 */
export async function detectFundingSource(
  connection: Connection,
  walletAddress: string,
  signatures: any[]
): Promise<FundingAnalysis> {
  try {
    // Get first significant deposit
    const firstDeposit = await findFirstDeposit(connection, walletAddress, signatures);
    
    if (!firstDeposit) {
      return {
        source: 'unknown',
        sourceName: 'Unknown',
        confidence: 0,
        evidence: ['No significant deposits found (> 0.5 SOL)'],
        details: null
      };
    }
    
    const senderAddress = firstDeposit.from;
    
    // Check against known CEX addresses
    const knownCEX = checkKnownCEX(senderAddress);
    if (knownCEX) {
      return {
        source: knownCEX.cex,
        sourceName: formatCEXName(knownCEX.cex),
        confidence: knownCEX.confidence,
        evidence: [
          `First deposit from verified ${formatCEXName(knownCEX.cex)} wallet`,
          `Amount: ${firstDeposit.amount.toFixed(2)} SOL`,
          `Date: ${new Date(firstDeposit.timestamp * 1000).toLocaleDateString()}`
        ],
        details: firstDeposit
      };
    }
    
    // Heuristic analysis for likely CEX
    const patterns = analyzePatterns(firstDeposit);
    
    if (patterns.likelyCEX) {
      return {
        source: 'likely_cex',
        sourceName: 'Likely CEX',
        confidence: patterns.confidence,
        evidence: patterns.evidence,
        details: firstDeposit
      };
    }
    
    // Direct transfer from another wallet
    return {
      source: 'direct_transfer',
      sourceName: 'Direct Transfer',
      confidence: 70,
      evidence: [
        `Funded from wallet ${senderAddress.slice(0, 4)}...${senderAddress.slice(-4)}`,
        `Amount: ${firstDeposit.amount.toFixed(2)} SOL`,
        `Date: ${new Date(firstDeposit.timestamp * 1000).toLocaleDateString()}`
      ],
      details: firstDeposit
    };
    
  } catch (error) {
    console.error('Error detecting funding source:', error);
    return {
      source: 'unknown',
      sourceName: 'Unknown',
      confidence: 0,
      evidence: ['Error analyzing funding source'],
      details: null
    };
  }
}

/**
 * Find the first significant SOL deposit (> 0.5 SOL)
 */
async function findFirstDeposit(
  connection: Connection,
  walletAddress: string,
  signatures: any[]
): Promise<FirstDeposit | null> {
  // Sort oldest first (reverse chronological order)
  const sorted = signatures.slice().reverse();
  
  // Check first 20 transactions to find funding
  const toCheck = sorted.slice(0, Math.min(20, sorted.length));
  
  for (const sig of toCheck) {
    try {
      const tx = await connection.getParsedTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0
      });
      
      if (!tx || !tx.meta) continue;
      
      // Look for SOL transfers to this wallet
      const transfer = findSOLTransferToWallet(tx, walletAddress);
      
      if (transfer && transfer.amount > 0.5) {
        return {
          from: transfer.from,
          amount: transfer.amount,
          timestamp: sig.blockTime || 0,
          signature: sig.signature
        };
      }
    } catch (error) {
      // Skip failed transactions
      continue;
    }
  }
  
  return null;
}

/**
 * Find SOL transfer TO the target wallet in a parsed transaction
 */
function findSOLTransferToWallet(
  tx: ParsedTransactionWithMeta,
  targetWallet: string
): { from: string; amount: number } | null {
  if (!tx.meta || !tx.transaction.message.accountKeys) return null;
  
  // Check pre and post balances
  const accountKeys = tx.transaction.message.accountKeys;
  const preBalances = tx.meta.preBalances;
  const postBalances = tx.meta.postBalances;
  
  // Find the target wallet in account keys
  const targetIndex = accountKeys.findIndex(
    key => key.pubkey.toString() === targetWallet
  );
  
  if (targetIndex === -1) return null;
  
  // Calculate balance change
  const preBalance = preBalances[targetIndex] || 0;
  const postBalance = postBalances[targetIndex] || 0;
  const change = (postBalance - preBalance) / 1e9; // Convert lamports to SOL
  
  if (change <= 0) return null;
  
  // Find the sender (account with negative balance change)
  for (let i = 0; i < accountKeys.length; i++) {
    if (i === targetIndex) continue;
    
    const senderChange = (postBalances[i] - preBalances[i]) / 1e9;
    if (senderChange < 0 && Math.abs(senderChange) >= change * 0.9) {
      // Found the sender
      return {
        from: accountKeys[i].pubkey.toString(),
        amount: change
      };
    }
  }
  
  return null;
}

/**
 * Analyze patterns to determine if sender is likely a CEX
 */
function analyzePatterns(deposit: FirstDeposit): {
  likelyCEX: boolean;
  confidence: number;
  evidence: string[];
} {
  const evidence: string[] = [];
  let confidence = 0;
  
  // Check for round amount (common in CEX withdrawals)
  const isRound = Math.abs(deposit.amount - Math.round(deposit.amount)) < 0.01;
  if (isRound) {
    evidence.push(`Round amount (${deposit.amount} SOL) - typical of CEX withdrawal`);
    confidence += 30;
  }
  
  // Check for amounts in common CEX ranges (1, 2, 5, 10, 50, 100 SOL)
  const commonAmounts = [1, 2, 5, 10, 20, 50, 100, 200, 500];
  const isCommonAmount = commonAmounts.some(amt => Math.abs(deposit.amount - amt) < 0.1);
  if (isCommonAmount) {
    evidence.push('Amount matches common CEX withdrawal patterns');
    confidence += 20;
  }
  
  // Add general info
  evidence.push(
    `First deposit: ${deposit.amount.toFixed(2)} SOL`,
    `From: ${deposit.from.slice(0, 4)}...${deposit.from.slice(-4)}`
  );
  
  return {
    likelyCEX: confidence >= 40,
    confidence: Math.min(confidence, 75), // Max 75% for heuristics
    evidence
  };
}
