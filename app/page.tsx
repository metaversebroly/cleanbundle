import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            CleanBundle
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            Automated bundle health checker for Solana launches
          </p>
          <p className="text-lg text-gray-400">
            Stop getting flagged. Launch with confidence. 🚀
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 border border-purple-500/20 mb-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                The Problem
              </h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                When bundling wallets for token launches on Solana, suspicious patterns get you flagged instantly by on-chain analysis tools. Your launch dies before it starts.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-red-400 text-xl">❌</span>
                  <p className="text-gray-300">All wallets funded from the same source</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-400 text-xl">❌</span>
                  <p className="text-gray-300">Perfect round amounts (0.5 SOL, 1.0 SOL...)</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-400 text-xl">❌</span>
                  <p className="text-gray-300">Zero transaction history on bundled wallets</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-400 text-xl">❌</span>
                  <p className="text-gray-300">All wallets created on the same day</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                The Solution
              </h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                CleanBundle automatically analyzes your wallet bundle <strong className="text-purple-400">before launch</strong> and provides actionable insights.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">🔍</span>
                  <p className="text-gray-300"><strong>Funding Pattern Analysis</strong> - Detect suspicious patterns</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">⚡</span>
                  <p className="text-gray-300"><strong>Relationship Detection</strong> - Identify risky connections</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">📊</span>
                  <p className="text-gray-300"><strong>Health Score System</strong> - Clear ratings for each wallet</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">💡</span>
                  <p className="text-gray-300"><strong>Actionable Recommendations</strong> - Know what to fix</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-16">
          <Link
            href="/analyze"
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold text-xl px-12 py-5 rounded-xl shadow-2xl transition-all transform hover:scale-105"
          >
            🔍 Analyze Your Bundle Now
          </Link>
          <p className="text-gray-400 mt-4 text-sm">
            No signup required • Free to use • Open source
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gray-800/30 rounded-2xl p-6 border border-purple-500/10">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
            <p className="text-gray-400">
              Analyze hundreds of wallets in seconds. No more manual CSV exports or Python scripts.
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-2xl p-6 border border-purple-500/10">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-3">Accurate Scoring</h3>
            <p className="text-gray-400">
              Advanced algorithms analyze transaction history, wallet age, and activity patterns.
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-2xl p-6 border border-purple-500/10">
            <div className="text-4xl mb-4">🔓</div>
            <h3 className="text-xl font-bold text-white mb-3">100% Open Source</h3>
            <p className="text-gray-400">
              Fully transparent. No black boxes. Every check is auditable on GitHub.
            </p>
          </div>
        </div>

        {/* Status Banner */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 text-center">
          <p className="text-gray-300">
            <span className="font-semibold text-purple-400">🚀 MVP in Active Development</span>
            <span className="mx-3">•</span>
            Built in public
            <span className="mx-3">•</span>
            Follow progress on <a href="https://twitter.com/metaversebroly" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">Twitter</a>
          </p>
        </div>
      </div>
    </div>
  )
}
