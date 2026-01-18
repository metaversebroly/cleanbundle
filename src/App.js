import React, { useState } from 'react';
import './App.css';

function App() {
  const [wallets, setWallets] = useState(['']);
  const [analyzing, setAnalyzing] = useState(false);

  const addWallet = () => {
    setWallets([...wallets, '']);
  };

  const updateWallet = (index, value) => {
    const newWallets = [...wallets];
    newWallets[index] = value;
    setWallets(newWallets);
  };

  const removeWallet = (index) => {
    const newWallets = wallets.filter((_, i) => i !== index);
    setWallets(newWallets);
  };

  const analyzeBundle = async () => {
    setAnalyzing(true);
    // On va implémenter ça demain
    setTimeout(() => {
      setAnalyzing(false);
      alert('Analysis coming soon! 🚀');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            CleanBundle
          </h1>
          <p className="text-gray-300 text-lg">
            Check your wallet bundle health before launch 🧪
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Detect red flags • Optimize funding • Launch with confidence
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-purple-500/20">
          <h2 className="text-2xl font-semibold mb-6 text-white">
            Enter Your Wallet Addresses
          </h2>

          {/* Wallet Inputs */}
          <div className="space-y-3 mb-6">
            {wallets.map((wallet, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={wallet}
                  onChange={(e) => updateWallet(index, e.target.value)}
                  placeholder="Solana wallet address (e.g., 7xKX...)"
                  className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
                {wallets.length > 1 && (
                  <button
                    onClick={() => removeWallet(index)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-3 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Wallet Button */}
          <button
            onClick={addWallet}
            className="w-full bg-gray-700/50 hover:bg-gray-700/70 text-gray-300 py-3 rounded-lg mb-6 transition-colors border border-gray-600"
          >
            + Add Another Wallet
          </button>

          {/* Analyze Button */}
          <button
            onClick={analyzeBundle}
            disabled={analyzing || wallets.every(w => !w.trim())}
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
              analyzing || wallets.every(w => !w.trim())
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/50'
            }`}
          >
            {analyzing ? 'Analyzing Bundle...' : '🔍 Analyze Bundle Health'}
          </button>

          {/* Info Box */}
          <div className="mt-6 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-purple-400">Free Tier:</span> Analyze up to 5 wallets. 
              Get bundle health score and basic recommendations.
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-semibold text-white mb-2">Funding Analysis</h3>
            <p className="text-sm text-gray-400">Detect suspicious funding patterns</p>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-white mb-2">Pattern Detection</h3>
            <p className="text-sm text-gray-400">Find risky wallet relationships</p>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <div className="text-3xl mb-3">✅</div>
            <h3 className="font-semibold text-white mb-2">Health Score</h3>
            <p className="text-sm text-gray-400">Get actionable recommendations</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Built for Solana devs who care about clean launches 🌊</p>
        </div>
      </div>
    </div>
  );
}

export default App;