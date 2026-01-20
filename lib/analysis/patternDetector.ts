import { Connection, PublicKey } from '@solana/web3.js';
import { Wallet } from '@/types';
import { checkKnownCEX } from '@/lib/data/knownAddresses';

export interface PatternWarning {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'funding' | 'connection' | 'timing' | 'amount';
  title: string;
  description: string;
  affectedWallets: string[];
  details: any;
}

export interface WalletConnection {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  signature: string;
}

export interface PatternAnalysis {
  warnings: PatternWarning[];
  connections: WalletConnection[];
  fundingClusters: Map<string, string[]>;
  suspicionScore: number;
}

/**
 * Master pattern detection - analyzes entire bundle for suspicious patterns
 * EXCLUDES: Known CEX (our database) + High-volume services (1000+ TX/day)
 * FLAGS: Private wallets funding 3+ bundle wallets
 */
export async function detectPatterns(
  connection: Connection,
  wallets: Wallet[]
): Promise<PatternAnalysis> {
  console.log('\n\n🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨');
  console.log('🚨 DETECTPATTERNS CALLED!');
  console.log(`🚨 Total wallets received: ${wallets.length}`);
  console.log('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\n');
  
  wallets.forEach((w, i) => {
    console.log(`Wallet ${i + 1}: ${w.address}`);
    console.log(`  - Has data? ${!!w.data}`);
    console.log(`  - Has funding? ${!!w.funding}`);
    console.log(`  - Has funding.details? ${!!w.funding?.details}`);
  });
  
  const warnings: PatternWarning[] = [];
  const connections: WalletConnection[] = [];
  const fundingClusters = new Map<string, string[]>();

  // ✅ FIX: Only require wallet.data, NOT funding.details
  // Pattern detection (connections) works with just wallet addresses!
  const validWallets = wallets.filter(w => w.data);
  
  console.log(`\n✅ Valid wallets for pattern detection: ${validWallets.length}/${wallets.length}`);

  if (validWallets.length < 2) {
    console.log(`❌ NOT ENOUGH VALID WALLETS (need 2+, got ${validWallets.length})`);
    console.log('⚠️ Pattern detection SKIPPED!\n');
    return { warnings, connections, fundingClusters, suspicionScore: 0 };
  }
  
  console.log(`✅ Proceeding with pattern detection...\n`);

  // 1. SHARED FUNDING SOURCE DETECTION
  console.log('\n📍 Step 1: Checking shared funding sources...');
  const fundingSources = new Map<string, string[]>();
  
  // ✅ Only check wallets that actually have funding details
  const walletsWithFunding = validWallets.filter(w => w.funding?.details?.from);
  console.log(`   Wallets with funding details: ${walletsWithFunding.length}/${validWallets.length}`);
  
  for (const wallet of walletsWithFunding) {
    if (wallet.funding?.details?.from) {
      const fundingAddress = wallet.funding.details.from;
      
      // CHECK 1: Skip known CEX addresses (Binance, ChangeNOW, etc.)
      const knownCEX = checkKnownCEX(fundingAddress);
      if (knownCEX) {
        console.log(`  ✅ Skipping known CEX: ${knownCEX.cex}`);
        continue;
      }
      
      // CHECK 2: Skip high-volume services (unlisted exchanges, swap services)
      const isService = await isHighVolumeService(connection, fundingAddress);
      if (isService) {
        console.log(`  ✅ Skipping high-volume service: ${fundingAddress.slice(0, 8)}`);
        continue;
      }
      
      // This is a private wallet - track it
      if (!fundingSources.has(fundingAddress)) {
        fundingSources.set(fundingAddress, []);
      }
      fundingSources.get(fundingAddress)!.push(wallet.address);
    }
  }

  // Flag funding clusters (3+ wallets from same PRIVATE source)
  for (const [source, walletAddresses] of fundingSources.entries()) {
    if (walletAddresses.length >= 3) {
      fundingClusters.set(source, walletAddresses);
      warnings.push({
        id: `funding-cluster-${source.slice(0, 8)}`,
        severity: 'HIGH',
        type: 'funding',
        title: `${walletAddresses.length} wallets funded from same private wallet`,
        description: `Multiple wallets funded from ${source.slice(0, 4)}...${source.slice(-4)} (private wallet). This creates a clear on-chain link that Axiom/Padre will detect.`,
        affectedWallets: walletAddresses,
        details: { source, count: walletAddresses.length }
      });
    }
  }

  // 2. CROSS-WALLET TRANSACTION DETECTION
  console.log('\n🔗 Step 2: Checking cross-wallet SOL transfers...');
  console.log(`   Scanning ALL combinations of ${wallets.length} wallets`);
  
  // ✅ CRITICAL: Create set of ALL wallet addresses (even incomplete ones)
  const allWalletAddresses = new Set(wallets.map(w => w.address));
  console.log(`   Bundle addresses: ${Array.from(allWalletAddresses).map(a => a.slice(0, 8)).join(', ')}`);
  
  // ✅ CRITICAL: Check EVERY wallet, not just validWallets
  const walletsToScan = wallets.filter(w => w.address);
  
  console.log(`\n🚨 ABOUT TO SCAN ${walletsToScan.length} WALLETS FOR CONNECTIONS\n`);
  
  // Track unique connections to avoid duplicates
  const uniqueConnections = new Map<string, WalletConnection>();
  
  let walletIndex = 0;
  for (const wallet of walletsToScan) {
    walletIndex++;
    console.log(`\n   [${walletIndex}/${walletsToScan.length}] Scanning wallet ${wallet.address.slice(0, 8)}...`);
    
    console.log(`🚨 CALLING detectCrossWalletTransfers NOW...`);
    const walletConnections = await detectCrossWalletTransfers(
      connection,
      wallet.address,
      allWalletAddresses
    );
    console.log(`🚨 RETURNED FROM detectCrossWalletTransfers: ${walletConnections.length} connections`);
    
    // Add to unique connections map
    for (const conn of walletConnections) {
      // Create unique key (sort addresses to avoid A→B and B→A duplicates)
      const [addr1, addr2] = [conn.from, conn.to].sort();
      const key = `${addr1}-${addr2}`;
      
      if (!uniqueConnections.has(key)) {
        uniqueConnections.set(key, conn);
        console.log(`     🔗 NEW CONNECTION: ${conn.from.slice(0, 8)} → ${conn.to.slice(0, 8)} (${conn.amount.toFixed(2)} SOL)`);
      }
    }
  }
  
  // Convert to array
  const allConnections = Array.from(uniqueConnections.values());
  connections.push(...allConnections);

  console.log(`\n   📊 Total unique connections found: ${connections.length}`);

  // ✅ CRITICAL: Flag even if just 1 connection
  if (connections.length > 0) {
    const chains = buildConnectionChains(connections);
    
    warnings.push({
      id: 'wallet-connections',
      severity: 'HIGH',
      type: 'connection',
      title: `${connections.length} direct wallet connection${connections.length > 1 ? 's' : ''} detected`,
      description: `Bundle contains wallets that have sent SOL to each other (even years ago). This is a MAJOR red flag for Axiom/Padre and will appear on bubble maps.`,
      affectedWallets: [...new Set(connections.flatMap(c => [c.from, c.to]))],
      details: { connections, chains }
    });
    
    console.log(`\n   🚨 WARNING CREATED: ${connections.length} connection(s) will be flagged!`);
  } else {
    console.log(`\n   ✅ No connections found between any wallets in the bundle`);
  }

  // 3. TIMING PATTERN ANALYSIS
  console.log('\n⏰ Step 3: Checking timing patterns...');
  // ✅ Filter out wallets without age data
  const walletsWithAge = validWallets.filter(w => w.data?.ageInDays);
  const creationDates = walletsWithAge
    .map(w => ({
      address: w.address,
      ageInDays: w.data!.ageInDays,
      createdAt: Date.now() - w.data!.ageInDays * 86400000
    }))
    .sort((a, b) => a.createdAt - b.createdAt);

  const clusteredCreations = findTimeClusteredWallets(creationDates, 86400000);
  if (clusteredCreations.length >= 3) {
    warnings.push({
      id: 'timing-cluster-24h',
      severity: 'MEDIUM',
      type: 'timing',
      title: `${clusteredCreations.length} wallets created within 24 hours`,
      description: 'Multiple wallets created in a short timeframe suggests batch creation.',
      affectedWallets: clusteredCreations,
      details: { timeWindow: '24h', count: clusteredCreations.length }
    });
    console.log(`   ⚠️ ${clusteredCreations.length} wallets created within 24h`);
  }

  const clusteredCreations48h = findTimeClusteredWallets(creationDates, 172800000);
  if (clusteredCreations48h.length >= 5) {
    warnings.push({
      id: 'timing-cluster-48h',
      severity: 'LOW',
      type: 'timing',
      title: `${clusteredCreations48h.length} wallets created within 48 hours`,
      description: 'Bundle shows temporal clustering pattern.',
      affectedWallets: clusteredCreations48h,
      details: { timeWindow: '48h', count: clusteredCreations48h.length }
    });
    console.log(`   ℹ️ ${clusteredCreations48h.length} wallets created within 48h`);
  }

  // 4. AMOUNT PATTERN DETECTION
  console.log('\n💰 Step 4: Checking amount patterns...');
  // ✅ Only check wallets with funding amount data
  const fundingAmounts = validWallets
    .filter(w => w.funding?.details?.amount)
    .map(w => ({
      address: w.address,
      amount: w.funding!.details!.amount
    }));
  console.log(`   Wallets with funding amounts: ${fundingAmounts.length}/${validWallets.length}`);

  const amountGroups = groupByAmount(fundingAmounts);
  for (const [amount, addresses] of amountGroups.entries()) {
    if (addresses.length >= 3) {
      const isRoundNumber = Math.abs(amount - Math.round(amount)) < 0.01;
      warnings.push({
        id: `amount-pattern-${amount}`,
        severity: isRoundNumber ? 'MEDIUM' : 'LOW',
        type: 'amount',
        title: `${addresses.length} wallets funded with identical amount (${amount.toFixed(2)} SOL)`,
        description: isRoundNumber 
          ? 'Round number and identical amounts suggest coordinated funding.'
          : 'Identical funding amounts across wallets is suspicious.',
        affectedWallets: addresses,
        details: { amount, count: addresses.length, isRound: isRoundNumber }
      });
      console.log(`   ${isRoundNumber ? '⚠️' : 'ℹ️'} ${addresses.length} wallets with ${amount} SOL`);
    }
  }

  const suspicionScore = calculateSuspicionScore(warnings);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ [Pattern Detection] COMPLETE');
  console.log(`🚨 Total Warnings: ${warnings.length}`);
  console.log(`🔗 Total Connections: ${connections.length}`);
  console.log(`📊 Suspicion Score: ${suspicionScore}/100`);
  
  if (connections.length > 0) {
    console.log('\n🔴 CRITICAL: Wallet connections detected!');
    console.log('These wallets CANNOT be in the same bundle for bubble maps:');
    connections.forEach((conn, i) => {
      console.log(`  ${i+1}. ${conn.from.slice(0, 8)} → ${conn.to.slice(0, 8)} (${conn.amount.toFixed(2)} SOL)`);
    });
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return {
    warnings: warnings.sort((a, b) => {
      const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }),
    connections,
    fundingClusters,
    suspicionScore
  };
}

/**
 * Check if a wallet is a high-volume service
 * Threshold: 1000+ TXs per day (like ChangeNOW with thousands/millions)
 */
async function isHighVolumeService(
  connection: Connection,
  address: string
): Promise<boolean> {
  try {
    const pubKey = new PublicKey(address);
    const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 1000 });
    
    if (signatures.length < 500) return false;
    
    const oldestTx = signatures[signatures.length - 1];
    const newestTx = signatures[0];
    
    if (!oldestTx.blockTime || !newestTx.blockTime) return false;
    
    const timeSpanDays = (newestTx.blockTime - oldestTx.blockTime) / 86400;
    if (timeSpanDays < 0.5) return false;
    
    const txPerDay = signatures.length / timeSpanDays;
    
    // 1000+ TX/day = likely a service (ChangeNOW-level activity)
    return txPerDay >= 1000;
  } catch (error) {
    return false; // Safer to flag if we can't determine
  }
}

/**
 * Detect SOL transfers between bundle wallets
 * 🔥 ULTRA-DEBUG MODE: Extensive logging to find the bug
 */
async function detectCrossWalletTransfers(
  connection: Connection,
  walletAddress: string,
  bundleAddresses: Set<string>
): Promise<WalletConnection[]> {
  const connections: WalletConnection[] = [];
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🔍 SCANNING WALLET: ${walletAddress}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Bundle wallets in set (${bundleAddresses.size}):`);
  Array.from(bundleAddresses).forEach((addr, i) => {
    const isSelf = addr === walletAddress;
    console.log(`  ${i + 1}. ${addr} ${isSelf ? '← (SELF)' : ''}`);
  });
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  try {
    const pubKey = new PublicKey(walletAddress);
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PHASE 1: Fetch MORE signatures (up to 3000)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log(`📡 Fetching transaction signatures...`);
    
    const MAX_PAGES = 3; // 3000 TXs max
    let allSignatures: any[] = [];
    let lastSignature: string | undefined = undefined;
    
    for (let page = 0; page < MAX_PAGES; page++) {
      const options: any = { limit: 1000 };
      if (lastSignature) {
        options.before = lastSignature;
      }
      
      const batch = await connection.getSignaturesForAddress(pubKey, options);
      console.log(`  Page ${page + 1}: ${batch.length} signatures`);
      
      if (batch.length === 0) break;
      
      allSignatures = allSignatures.concat(batch);
      lastSignature = batch[batch.length - 1].signature;
      
      if (batch.length < 1000) break;
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📊 Total signatures fetched: ${allSignatures.length}\n`);
    
    // 🎯 DEBUG: Check for specific test transaction (CREATE ACCOUNT type)
    const TEST_TX = '5HGB6PGohjqUQBBQDXEcPY7qii69DVdKZQmqtwWrL2fetrW3Nimeqt3NzLxyPEhD6RoNYtSsQb151R5FDidWaX1R';
    const testTxIndex = allSignatures.findIndex(sig => sig.signature === TEST_TX);
    if (testTxIndex !== -1) {
      console.log(`✅ TEST TX FOUND at position ${testTxIndex + 1}/${allSignatures.length}`);
      console.log(`   Signature: ${TEST_TX}\n`);
    } else {
      console.log(`ℹ️ Test TX not in fetched signatures (might be for another wallet)\n`);
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PHASE 2: Filter & Aggressive Sampling
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    const successfulSigs = allSignatures.filter(sig => !sig.err);
    console.log(`✅ ${successfulSigs.length} successful transactions`);
    
    // ✅ PRODUCTION OPTIMIZATION: Reduced sampling (300 TXs total)
    // Most connections are recent, so we prioritize recent TXs
    const recentSigs = successfulSigs.slice(0, 150);  // 150 recent (most important)
    const middleStart = Math.max(0, Math.floor(successfulSigs.length / 2) - 50);
    const middleSigs = successfulSigs.slice(middleStart, middleStart + 100);  // 100 middle
    const oldSigs = successfulSigs.slice(-50);  // 50 old
    
    const samplesToCheck = [
      ...recentSigs,
      ...middleSigs,
      ...oldSigs
    ].filter((sig, index, self) => 
      self.findIndex(s => s.signature === sig.signature) === index
    );
    
    console.log(`\n🎯 Optimized sampling (85% reduction):`);
    console.log(`   - Recent: 150 TXs (connections are usually recent)`);
    console.log(`   - Middle: 100 TXs`);
    console.log(`   - Old: 50 TXs`);
    console.log(`   - Total to parse: ${samplesToCheck.length}`);
    
    // Check if test TX is in sample
    if (testTxIndex !== -1) {
      const testInSample = samplesToCheck.find(sig => sig.signature === TEST_TX);
      if (testInSample) {
        console.log(`✅ TEST TX IS IN SAMPLE - will be parsed!\n`);
      } else {
        console.log(`❌ TEST TX NOT IN SAMPLE!`);
        console.log(`   Position: ${testTxIndex + 1}`);
        console.log(`   Sample ranges: 1-1000, ${middleStart + 1}-${middleStart + 500}, ${successfulSigs.length - 499}-${successfulSigs.length}\n`);
      }
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PHASE 3: Parse transactions with rate limiting
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    const REQUESTS_PER_SECOND = 15;
    const DELAY_BETWEEN_REQUESTS = Math.ceil(1000 / REQUESTS_PER_SECOND);
    const MIN_SOL_AMOUNT = 0.001; // ✅ Lowered to 0.001 to catch small legit transfers (e.g. 0.002 SOL)
    
    console.log(`⚡ Starting parse with ${DELAY_BETWEEN_REQUESTS}ms delay`);
    console.log(`🧹 Spam filter: Ignore transfers < ${MIN_SOL_AMOUNT} SOL\n`);
    
    let parsedCount = 0;
    let spamFiltered = 0;
    const seenConnections = new Set<string>();
    
    for (const sig of samplesToCheck) {
      try {
        if (parsedCount > 0) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
        }
        
        const isTestTx = sig.signature === TEST_TX;
        if (isTestTx) {
          console.log(`\n🎯 ═══════════════════════════════════════════`);
          console.log(`   PARSING TEST TRANSACTION NOW!`);
          console.log(`   ${TEST_TX}`);
          console.log(`═══════════════════════════════════════════\n`);
        }
        
        const tx = await connection.getParsedTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        });
        
        parsedCount++;
        
        if (!tx || !tx.meta) {
          if (isTestTx) {
            console.log(`❌ TEST TX: Transaction data is NULL!\n`);
          }
          continue;
        }
        
        // ✅ SPAM FILTER: Check if this is a native SOL transfer
        // Skip token transfers, NFTs, and other program interactions
        const instructions = tx.transaction.message.instructions;
        const hasSystemTransfer = instructions.some((ix: any) => {
          // Check for system program (native SOL transfers)
          if ('program' in ix) {
            return ix.program === 'system';
          }
          if ('programId' in ix) {
            return ix.programId.toString() === '11111111111111111111111111111111';
          }
          return false;
        });
        
        // If no system program interaction, it's likely a token/NFT transfer or other spam
        if (!hasSystemTransfer) {
          spamFiltered++;
          continue;
        }
        
        if (isTestTx) {
          console.log(`✅ TEST TX: Transaction data loaded`);
          console.log(`   Accounts in transaction: ${tx.transaction.message.accountKeys.length}`);
          console.log(`   Has system program: ${hasSystemTransfer}`);
          console.log(`\n📋 ALL INSTRUCTIONS:`);
          instructions.forEach((ix: any, idx: number) => {
            console.log(`   Instruction ${idx}:`);
            console.log(`     Type: ${ix.parsed?.type || 'Unknown'}`);
            console.log(`     Program: ${ix.program || ix.programId?.toString() || 'Unknown'}`);
            if (ix.parsed?.info) {
              console.log(`     Info:`, JSON.stringify(ix.parsed.info, null, 2));
            }
          });
        }
        
        // ✅ SPECIAL HANDLING: Check for CREATE ACCOUNT instructions
        // These transfer SOL when creating accounts but may not show up in normal balance change detection
        const createAccountIx = instructions.find((ix: any) => {
          return ix.parsed?.type === 'createAccount' || ix.parsed?.type === 'createAccountWithSeed';
        });
        
        if (createAccountIx && 'parsed' in createAccountIx && createAccountIx.parsed) {
          const parsed = createAccountIx.parsed as any;
          const source = parsed.info?.source;
          const newAccount = parsed.info?.newAccount;
          const lamports = parsed.info?.lamports || 0;
          const amount = lamports / 1e9;
          
          console.log(`\n🔍 CREATE ACCOUNT INSTRUCTION DETECTED!`);
          console.log(`   Source: ${source}`);
          console.log(`   New Account: ${newAccount}`);
          console.log(`   Amount: ${amount.toFixed(9)} SOL`);
          console.log(`   Source in bundle? ${source ? bundleAddresses.has(source) : 'N/A'}`);
          console.log(`   New account in bundle? ${newAccount ? bundleAddresses.has(newAccount) : 'N/A'}`);
          
          // Check if both accounts are in bundle
          if (source && newAccount && bundleAddresses.has(source) && bundleAddresses.has(newAccount)) {
            if (amount >= MIN_SOL_AMOUNT) {
              const connectionKey = `${source}->${newAccount}-${sig.signature}`;
              if (!seenConnections.has(connectionKey)) {
                seenConnections.add(connectionKey);
                
                console.log(`\n🚨 ═══════════════════════════════════════════`);
                console.log(`   CREATE ACCOUNT CONNECTION DETECTED!`);
                console.log(`   From: ${source}`);
                console.log(`   To: ${newAccount} (new account)`);
                console.log(`   Amount: ${amount.toFixed(4)} SOL`);
                console.log(`   TX: ${sig.signature}`);
                console.log(`═══════════════════════════════════════════\n`);
                
                connections.push({
                  from: source,
                  to: newAccount,
                  amount: amount,
                  timestamp: sig.blockTime || 0,
                  signature: sig.signature
                });
                
                console.log(`⚡ Connection found! Stopping scan early.`);
                console.log(`📊 Stats: Parsed ${parsedCount}/${samplesToCheck.length}, Spam filtered: ${spamFiltered}\n`);
                return connections;
              }
            }
          }
        }
        
        const accountKeys = tx.transaction.message.accountKeys;
        const preBalances = tx.meta.preBalances;
        const postBalances = tx.meta.postBalances;
        
        // Check EVERY account in the transaction
        for (let i = 0; i < accountKeys.length; i++) {
          const address = accountKeys[i].pubkey.toString();
          
          // ✅ Handle undefined balances (new accounts in CREATE ACCOUNT TXs)
          const preBalance = preBalances[i] ?? 0;
          const postBalance = postBalances[i] ?? 0;
          const balanceChange = (postBalance - preBalance) / 1e9;
          
          if (isTestTx) {
            const inBundle = bundleAddresses.has(address);
            console.log(`   Account[${i}]: ${address.slice(0, 8)}...${address.slice(-8)}`);
            console.log(`     Balance change: ${balanceChange > 0 ? '+' : ''}${balanceChange.toFixed(4)} SOL`);
            console.log(`     In bundle? ${inBundle ? '✅ YES' : '❌ NO'}`);
            console.log(`     Is self? ${address === walletAddress ? '✅ YES' : '❌ NO'}`);
          }
          
          // Skip self
          if (address === walletAddress) continue;
          
          // Only check bundle wallets
          if (!bundleAddresses.has(address)) continue;
          
          // ✅ SPAM FILTER: Only flag transfers >= MIN_SOL_AMOUNT
          if (Math.abs(balanceChange) >= MIN_SOL_AMOUNT) {
            let from: string, to: string;
            if (balanceChange > 0) {
              // This account received SOL
              from = walletAddress;
              to = address;
            } else {
              // This account sent SOL
              from = address;
              to = walletAddress;
            }
            
            const connectionKey = `${from}->${to}-${sig.signature}`;
            if (seenConnections.has(connectionKey)) continue;
            seenConnections.add(connectionKey);
            
            console.log(`\n🚨 ═══════════════════════════════════════════`);
            console.log(`   CONNECTION DETECTED!`);
            console.log(`   From: ${from}`);
            console.log(`   To: ${to}`);
            console.log(`   Amount: ${Math.abs(balanceChange).toFixed(4)} SOL`);
            console.log(`   TX: ${sig.signature}`);
            console.log(`═══════════════════════════════════════════\n`);
            
            connections.push({
              from,
              to,
              amount: Math.abs(balanceChange),
              timestamp: sig.blockTime || 0,
              signature: sig.signature
            });
            
            // ✅ EARLY EXIT: Stop early to save time and RPC requests
            console.log(`⚡ Connection found! Stopping scan early.`);
            console.log(`📊 Stats: Parsed ${parsedCount}/${samplesToCheck.length}, Spam filtered: ${spamFiltered}\n`);
            return connections;
          } else if (Math.abs(balanceChange) > 0 && Math.abs(balanceChange) < MIN_SOL_AMOUNT) {
            // Track micro-transfers below threshold as spam
            spamFiltered++;
          }
        }
        
        if (isTestTx) {
          console.log(`\n❌ TEST TX: No connection detected in this transaction\n`);
        }
        
        // Progress indicator
        if (parsedCount % 50 === 0) {
          console.log(`📈 Progress: ${parsedCount}/${samplesToCheck.length} TXs parsed, ${spamFiltered} spam filtered...`);
        }
        
      } catch (error: any) {
        if (error?.toString().includes('429')) {
          console.log(`⚠️ Rate limited! Waiting 5 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        continue;
      }
    }
    
    console.log(`\n✅ Scan complete:`);
    console.log(`   - Parsed: ${parsedCount} TXs`);
    console.log(`   - Spam filtered: ${spamFiltered}`);
    console.log(`   - Connections: ${connections.length}\n`);
    
  } catch (error) {
    console.error(`❌ Error scanning wallet:`, error);
  }
  
  return connections;
}

function buildConnectionChains(connections: WalletConnection[]): string[][] {
  const chains: string[][] = [];
  const graph = new Map<string, string[]>();
  
  for (const conn of connections) {
    if (!graph.has(conn.from)) {
      graph.set(conn.from, []);
    }
    graph.get(conn.from)!.push(conn.to);
  }
  
  const visited = new Set<string>();
  
  for (const [start] of graph) {
    if (visited.has(start)) continue;
    const chain = dfsChain(start, graph, visited);
    if (chain.length > 1) {
      chains.push(chain);
    }
  }
  
  return chains;
}

function dfsChain(
  node: string,
  graph: Map<string, string[]>,
  visited: Set<string>
): string[] {
  visited.add(node);
  const chain = [node];
  const neighbors = graph.get(node) || [];
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) {
      chain.push(...dfsChain(neighbor, graph, visited));
    }
  }
  return chain;
}

function findTimeClusteredWallets(
  creationDates: { address: string; createdAt: number }[],
  windowMs: number
): string[] {
  const clustered: string[] = [];
  
  for (let i = 0; i < creationDates.length; i++) {
    const clusterWallets = [creationDates[i].address];
    
    for (let j = i + 1; j < creationDates.length; j++) {
      if (creationDates[j].createdAt - creationDates[i].createdAt <= windowMs) {
        clusterWallets.push(creationDates[j].address);
      } else {
        break;
      }
    }
    
    if (clusterWallets.length >= 3) {
      clustered.push(...clusterWallets);
    }
  }
  
  return [...new Set(clustered)];
}

function groupByAmount(
  fundingAmounts: { address: string; amount: number }[]
): Map<number, string[]> {
  const groups = new Map<number, string[]>();
  
  for (const { address, amount } of fundingAmounts) {
    const roundedAmount = Math.round(amount * 100) / 100;
    if (!groups.has(roundedAmount)) {
      groups.set(roundedAmount, []);
    }
    groups.get(roundedAmount)!.push(address);
  }
  
  return groups;
}

function calculateSuspicionScore(warnings: PatternWarning[]): number {
  let score = 0;
  for (const warning of warnings) {
    score += warning.severity === 'HIGH' ? 30 : warning.severity === 'MEDIUM' ? 15 : 5;
  }
  return Math.min(100, score);
}
