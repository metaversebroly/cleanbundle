import React, { useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

function App() {
  const [walletInput, setWalletInput] = useState('');
  const [wallets, setWallets] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const analyzeWallets = async () => {
    const addresses = walletInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (addresses.length === 0) {
      alert('Please enter at least one wallet address');
      return;
    }

    const parsedWallets = addresses.map((address, index) => ({
      id: index + 1,
      address,
      data: null,
      loading: true,
      error: null
    }));

    setWallets(parsedWallets);
    setAnalyzing(true);
    setProgress(0);

    const connection = new Connection('https://quiet-purple-bridge.solana-mainnet.quiknode.pro/3b4934557503f620e41bed833c53fc753d1917e4/', 'confirmed');
    const updatedWallets = [];

    for (let i = 0; i < parsedWallets.length; i++) {
      const wallet = parsedWallets[i];
      
      try {
        const pubKey = new PublicKey(wallet.address);
        const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 1000 });
        
        const now = Math.floor(Date.now() / 1000);
        const firstTx = signatures.length > 0 ? signatures[signatures.length - 1].blockTime : null;
        const lastTx = signatures.length > 0 ? signatures[0].blockTime : null;
        const ageInDays = firstTx ? Math.floor((now - firstTx) / 86400) : 0;
        
        const sevenDaysAgo = now - (7 * 86400);
        const recentTxs = signatures.filter(sig => sig.blockTime >= sevenDaysAgo).length;

        const balance = await connection.getBalance(pubKey);
        const solBalance = balance / 1000000000;

        updatedWallets.push({
          ...wallet,
          data: {
            totalTransactions: signatures.length,
            recentTransactions: recentTxs,
            ageInDays,
            balance: solBalance.toFixed(4)
          },
          loading: false,
          error: null
        });
      } catch (error) {
        updatedWallets.push({
          ...wallet,
          loading: false,
          error: error.message
        });
      }

      setProgress(Math.round(((i + 1) / parsedWallets.length) * 100));
      setWallets([...updatedWallets]);
    }

    setAnalyzing(false);
  };

  const getScore = (wallet) => {
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

  const getBadge = (score) => {
    if (score >= 80) return { emoji: '🟢', color: 'text-green-400' };
    if (score >= 50) return { emoji: '🟡', color: 'text-yellow-400' };
    return { emoji: '🔴', color: 'text-red-400' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            CleanBundle
          </h1>
          <p className="text-gray-300 text-lg">
            Automated bundle health checker for Solana launches
          </p>
          <p className="text-gray-400 text-sm mt-2">
            No more CSV exports • No more Python scripts • Just results
          </p>
        </div>

        {wallets.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-8 border border-purple-500/20">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Import Your Wallet Bundle
            </h2>
            <p className="text-gray-400 mb-6">
              Paste wallet addresses (one per line). No limit.
            </p>

            <textarea
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              placeholder="7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU&#10;EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&#10;Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
              className="w-full h-64 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 font-mono text-sm resize-none"
            />

            <button
              onClick={analyzeWallets}
              disabled={analyzing || !walletInput.trim()}
              className={`mt-6 w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                analyzing || !walletInput.trim()
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg'
              }`}
            >
              {analyzing ? `Analyzing... ${progress}%` : '🔍 Analyze Bundle'}
            </button>

            <div className="mt-6 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-purple-400">Day 1 MVP:</span> Basic analysis. More features tomorrow!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-purple-500/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-white">Results</h2>
                <button
                  onClick={() => { setWallets([]); setWalletInput(''); }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  ← New Analysis
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Total</div>
                  <div className="text-2xl font-bold text-white">{wallets.length}</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Clean</div>
                  <div className="text-2xl font-bold text-green-400">
                    {wallets.filter(w => w.data && getScore(w) >= 80).length}
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Medium</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {wallets.filter(w => w.data && getScore(w) >= 50 && getScore(w) < 80).length}
                  </div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Risky</div>
                  <div className="text-2xl font-bold text-red-400">
                    {wallets.filter(w => w.data && getScore(w) < 50).length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-2xl border border-purple-500/20 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Address</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Score</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">TXs</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Recent</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Age</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {wallets.map((wallet) => {
                    const score = getScore(wallet);
                    const badge = getBadge(score);
                    return (
                      <tr key={wallet.id} className="hover:bg-gray-700/30">
                        <td className="px-4 py-3 text-sm text-gray-400">{wallet.id}</td>
                        <td className="px-4 py-3 font-mono text-xs text-purple-400">
                          {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
                        </td>
                        <td className="px-4 py-3">
                          {wallet.loading ? (
                            <span className="text-gray-400 text-sm">...</span>
                          ) : wallet.error ? (
                            <span className="text-red-400 text-sm">Error</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{badge.emoji}</span>
                              <span className={`font-semibold ${badge.color}`}>{score}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {wallet.data ? wallet.data.totalTransactions : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {wallet.data ? (
                            <span className={wallet.data.recentTransactions >= 3 ? 'text-green-400' : 'text-yellow-400'}>
                              {wallet.data.recentTransactions}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {wallet.data ? `${wallet.data.ageInDays}d` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {wallet.data ? `${wallet.data.balance} SOL` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;