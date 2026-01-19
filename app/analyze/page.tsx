'use client'

import React, { useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { motion } from 'framer-motion'
import { Wallet } from '@/types'
import { getSolanaConnection } from '@/lib/solana/connection'
import { getScore, getBadge } from '@/lib/utils/scoring'
import { validateAddressList } from '@/lib/utils/validation'
import { parseError, retry } from '@/lib/utils/errors'
import { detectFundingSource } from '@/lib/analysis/fundingDetector'
import { recommendRole } from '@/lib/analysis/roleRecommender'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { DropdownButton } from '@/components/ui/DropdownButton'
import { StatsCard } from '@/components/wallet/StatsCard'
import { WalletTableRow } from '@/components/wallet/WalletTableRow'
import { ExpandedWalletDetails } from '@/components/wallet/ExpandedWalletDetails'
import { InsightsCard } from '@/components/wallet/InsightsCard'
import { BubbleMap } from '@/components/wallet/BubbleMap'
import { GlassCard } from '@/components/ui/GlassCard'
import { Navigation } from '@/components/layout/Navigation'
import { useToast } from '@/hooks/useToast'
import { exportToCSV, copyToClipboard } from '@/lib/utils/export'
import { WalletConnection } from '@/lib/analysis/patternDetector'

export default function AnalyzePage() {
  const [walletInput, setWalletInput] = useState('')
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [expandedWalletId, setExpandedWalletId] = useState<number | null>(null)
  const [patternConnections, setPatternConnections] = useState<WalletConnection[]>([])
  const toast = useToast()

  // Handle connected wallets detection
  const handleConnectionsDetected = (connectedAddresses: Set<string>, connections: WalletConnection[]) => {
    console.log('📍 Updating wallets with connection info:', Array.from(connectedAddresses));
    setWallets(prev => prev.map(w => ({
      ...w,
      isConnected: connectedAddresses.has(w.address)
    })));
    setPatternConnections(connections);
  }

  // Remove wallet from bundle
  const removeWallet = (walletId: number) => {
    setWallets(prev => prev.filter(w => w.id !== walletId))
    toast.success('Wallet removed from bundle')
    if (expandedWalletId === walletId) {
      setExpandedWalletId(null)
    }
  }

  const analyzeWallets = async () => {
    const addresses = walletInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
    
    if (addresses.length === 0) {
      toast.error('Please enter at least one wallet address')
      return
    }

    // ✅ Limit to 10 wallets for performance
    if (addresses.length > 10) {
      toast.error(`Too many wallets! Maximum is 10 addresses (you entered ${addresses.length})`)
      return
    }

    // Validate addresses before making RPC calls
    const validation = validateAddressList(addresses)
    
    if (validation.invalid.length > 0) {
      const invalidCount = validation.invalid.length
      toast.warning(`${invalidCount} invalid address${invalidCount > 1 ? 'es' : ''} detected and skipped`)
      
      if (validation.valid.length === 0) {
        toast.error('No valid addresses to analyze')
        return
      }
    }

    const parsedWallets: Wallet[] = validation.valid.map((address, index) => ({
      id: index + 1,
      address,
      data: null,
      loading: true,
      error: null
    }))

    setWallets(parsedWallets)
    setAnalyzing(true)
    setProgress(0)

    const connection = getSolanaConnection()
    const updatedWallets: Wallet[] = []

    for (let i = 0; i < parsedWallets.length; i++) {
      const wallet = parsedWallets[i]
      
      try {
        const pubKey = new PublicKey(wallet.address)
        const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 1000 })
        
        const now = Math.floor(Date.now() / 1000)
        const firstTx = signatures.length > 0 ? signatures[signatures.length - 1].blockTime : null
        const ageInDays = firstTx ? Math.floor((now - firstTx) / 86400) : 0
        
        const sevenDaysAgo = now - (7 * 86400)
        const recentTxs = signatures.filter(sig => sig.blockTime && sig.blockTime >= sevenDaysAgo).length

        const balance = await connection.getBalance(pubKey)
        const solBalance = balance / 1000000000

        // Detect funding source and recommend role
        const funding = await detectFundingSource(connection, wallet.address, signatures)
        
        const walletWithData: Wallet = {
          ...wallet,
          data: {
            totalTransactions: signatures.length,
            recentTransactions: recentTxs,
            ageInDays,
            balance: solBalance.toFixed(4)
          },
          funding,
          loading: false,
          error: null
        }
        
        const role = recommendRole(walletWithData, funding.source)
        walletWithData.role = role

        updatedWallets.push(walletWithData)
      } catch (error) {
        const errorDetails = parseError(error)
        updatedWallets.push({
          ...wallet,
          loading: false,
          error: `${errorDetails.message}${errorDetails.suggestion ? ` - ${errorDetails.suggestion}` : ''}`
        })
      }

      setProgress(Math.round(((i + 1) / parsedWallets.length) * 100))
      setWallets([...updatedWallets])
    }

    setAnalyzing(false)
    
    // Show completion toast
    const successCount = updatedWallets.filter(w => w.data).length
    const errorCount = updatedWallets.filter(w => w.error).length
    
    if (errorCount === 0) {
      toast.success(`✅ Analysis complete! ${successCount} wallet${successCount > 1 ? 's' : ''} analyzed`)
    } else if (successCount > 0) {
      toast.warning(`Analysis complete with ${errorCount} error${errorCount > 1 ? 's' : ''}`)
    } else {
      toast.error(`Analysis failed for all wallets`)
    }
  }

  const retryWallet = async (walletId: number) => {
    const wallet = wallets.find(w => w.id === walletId)
    if (!wallet) return

    setWallets(prev => prev.map(w => 
      w.id === walletId ? { ...w, loading: true, error: null } : w
    ))

    const connection = getSolanaConnection()

    try {
      await retry(async () => {
        const pubKey = new PublicKey(wallet.address)
        const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 1000 })
        
        const now = Math.floor(Date.now() / 1000)
        const firstTx = signatures.length > 0 ? signatures[signatures.length - 1].blockTime : null
        const ageInDays = firstTx ? Math.floor((now - firstTx) / 86400) : 0
        
        const sevenDaysAgo = now - (7 * 86400)
        const recentTxs = signatures.filter(sig => sig.blockTime && sig.blockTime >= sevenDaysAgo).length

        const balance = await connection.getBalance(pubKey)
        const solBalance = balance / 1000000000

        // Detect funding source and recommend role
        const funding = await detectFundingSource(connection, wallet.address, signatures)
        
        const walletWithData: Wallet = {
          ...wallet,
          data: {
            totalTransactions: signatures.length,
            recentTransactions: recentTxs,
            ageInDays,
            balance: solBalance.toFixed(4)
          },
          funding,
          loading: false,
          error: null
        }
        
        const role = recommendRole(walletWithData, funding.source)
        walletWithData.role = role

        setWallets(prev => prev.map(w =>
          w.id === walletId ? walletWithData : w
        ))

        toast.success(`Wallet ${wallet.address.slice(0, 4)}...${wallet.address.slice(-4)} retried successfully`)
      })
    } catch (error) {
      const errorDetails = parseError(error)
      setWallets(prev => prev.map(w =>
        w.id === walletId
          ? {
              ...w,
              loading: false,
              error: `${errorDetails.message}${errorDetails.suggestion ? ` - ${errorDetails.suggestion}` : ''}`
            }
          : w
      ))
      toast.error(`Retry failed: ${errorDetails.message}`)
    }
  }

  const handleExportCSV = () => {
    try {
      exportToCSV(wallets)
      toast.success('✅ CSV exported successfully!')
    } catch (error) {
      toast.error('Failed to export CSV')
    }
  }

  const handleCopyMarkdown = async () => {
    try {
      await copyToClipboard(wallets, 'markdown')
      toast.success('✅ Copied as Markdown!')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleCopyJSON = async () => {
    try {
      await copyToClipboard(wallets, 'json')
      toast.success('✅ Copied as JSON!')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <Navigation />

      {/* Animated Gradient Mesh Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"></div>

      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Analyze Your Bundle
              </span>
            </h1>
            <p className="text-xl text-gray-400">
              Professional wallet health check for Solana launches
            </p>
          </motion.div>

          {wallets.length === 0 ? (
            /* Input Section */
            <GlassCard className="p-8 md:p-12 max-w-4xl mx-auto" animate delay={0.2}>
              <h2 className="text-2xl font-semibold mb-4 text-white">
                Import Your Wallet Bundle
              </h2>
              <p className="text-gray-400 mb-6">
                Paste wallet addresses (one per line). No limit.
              </p>

              <textarea
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                placeholder="Paste wallet addresses (one per line, max 10)&#10;&#10;Example:&#10;7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU&#10;EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&#10;Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
                className="w-full h-64 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 font-mono text-sm resize-none transition-all"
              />

              <Button
                onClick={analyzeWallets}
                disabled={analyzing || !walletInput.trim()}
                loading={analyzing}
                variant="primary"
                size="lg"
                className="mt-6 w-full"
              >
                {analyzing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Analyzing... {progress}%
                  </>
                ) : (
                  '🔍 Analyze Bundle'
                )}
              </Button>

              <div className="mt-6 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-purple-400">💎 Premium Analysis:</span> Get instant insights on transaction history, wallet age, and bundle health.
                </p>
              </div>
            </GlassCard>
          ) : (
            /* Results Section */
            <div className="space-y-6 animate-fade-in">
              {/* Progress Bar */}
              {analyzing && (
                <GlassCard className="p-6">
                  <ProgressBar progress={progress} />
                </GlassCard>
              )}

              {/* Overall Insights Card */}
              {!analyzing && <InsightsCard wallets={wallets} onConnectionsDetected={handleConnectionsDetected} />}

              {/* Action Buttons */}
              <GlassCard className="p-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <h2 className="text-2xl font-semibold text-white">Results</h2>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={handleExportCSV}
                      variant="secondary"
                      size="md"
                    >
                      📥 Export CSV
                    </Button>
                    <DropdownButton
                      variant="secondary"
                      size="md"
                      options={[
                        {
                          label: 'Copy as Markdown',
                          icon: '📋',
                          onClick: handleCopyMarkdown,
                        },
                        {
                          label: 'Copy as JSON',
                          icon: '💾',
                          onClick: handleCopyJSON,
                        },
                      ]}
                    >
                      📋 Copy Results
                    </DropdownButton>
                    <Button
                      onClick={() => { setWallets([]); setWalletInput('') }}
                      variant="ghost"
                      size="md"
                    >
                      ← New Analysis
                    </Button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  <StatsCard 
                    label="Total" 
                    value={wallets.length} 
                    color="text-white"
                  />
                  <StatsCard 
                    label="Clean" 
                    value={wallets.filter(w => w.data && getScore(w) >= 80).length} 
                    color="text-green-400"
                  />
                  <StatsCard 
                    label="Medium" 
                    value={wallets.filter(w => w.data && getScore(w) >= 50 && getScore(w) < 80).length} 
                    color="text-yellow-400"
                  />
                  <StatsCard 
                    label="Risky" 
                    value={wallets.filter(w => w.data && getScore(w) < 50).length} 
                    color="text-red-400"
                  />
                  <StatsCard 
                    label="Errors" 
                    value={wallets.filter(w => w.error).length} 
                    color={wallets.filter(w => w.error).length > 0 ? 'text-red-400' : 'text-gray-500'}
                    highlight={wallets.filter(w => w.error).length > 0}
                  />
                </div>
              </GlassCard>

              {/* Results Table */}
              <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">#</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Address</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Score</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Potential Role for Next Launch</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Funding</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">TXs</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Recent</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Age</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Balance</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {wallets.map((wallet, index) => (
                        <React.Fragment key={wallet.id}>
                          <motion.tr
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            className={`transition-all duration-200 group cursor-pointer ${
                              wallet.isConnected 
                                ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border-l-4 border-red-500' 
                                : 'hover:bg-white/5'
                            } ${expandedWalletId === wallet.id ? 'bg-white/5' : ''}`}
                            onClick={() => {
                              if (wallet.data && wallet.role && wallet.funding) {
                                setExpandedWalletId(expandedWalletId === wallet.id ? null : wallet.id)
                              }
                            }}
                          >
                            <WalletTableRow 
                              wallet={wallet} 
                              onRetry={retryWallet}
                              onRemove={removeWallet}
                              isExpanded={expandedWalletId === wallet.id}
                            />
                          </motion.tr>
                          <ExpandedWalletDetails 
                            wallet={wallet}
                            isExpanded={expandedWalletId === wallet.id}
                          />
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>

              {/* Bubble Map Visualization */}
              {!analyzing && wallets.length > 0 && (
                <GlassCard className="p-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold text-white mb-2">
                      🎨 Bundle Visualization
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {patternConnections.length > 0 
                        ? `${patternConnections.length} connection${patternConnections.length > 1 ? 's' : ''} detected. Click bubbles to remove wallets.`
                        : 'Visual representation of your bundle. All wallets are independent!'}
                    </p>
                  </div>
                  <BubbleMap 
                    wallets={wallets}
                    connections={patternConnections}
                    onRemoveWallet={removeWallet}
                  />
                </GlassCard>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
