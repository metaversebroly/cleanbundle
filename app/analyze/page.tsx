'use client'

import React, { useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import Link from 'next/link'
import { Wallet } from '@/types'
import { getSolanaConnection } from '@/lib/solana/connection'
import { getScore, getBadge } from '@/lib/utils/scoring'
import { validateAddressList } from '@/lib/utils/validation'
import { parseError, retry } from '@/lib/utils/errors'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { useToast } from '@/hooks/useToast'

export default function AnalyzePage() {
  const [walletInput, setWalletInput] = useState('')
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const toast = useToast()

  const analyzeWallets = async () => {
    const addresses = walletInput
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
    
    if (addresses.length === 0) {
      alert('Please enter at least one wallet address')
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
        const lastTx = signatures.length > 0 ? signatures[0].blockTime : null
        const ageInDays = firstTx ? Math.floor((now - firstTx) / 86400) : 0
        
        const sevenDaysAgo = now - (7 * 86400)
        const recentTxs = signatures.filter(sig => sig.blockTime && sig.blockTime >= sevenDaysAgo).length

        const balance = await connection.getBalance(pubKey)
        const solBalance = balance / 1000000000

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
        })
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

    // Set wallet to loading
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

        setWallets(prev => prev.map(w =>
          w.id === walletId
            ? {
                ...w,
                data: {
                  totalTransactions: signatures.length,
                  recentTransactions: recentTxs,
                  ageInDays,
                  balance: solBalance.toFixed(4)
                },
                loading: false,
                error: null
              }
            : w
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-8">
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 text-purple-400 hover:text-purple-300 transition-colors">
            ← Back to Home
          </Link>
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
                <span className="font-semibold text-purple-400">Day 1 MVP:</span> Basic analysis. More features tomorrow!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Progress Bar */}
            {analyzing && (
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-purple-500/20">
                <ProgressBar progress={progress} />
              </div>
            )}

            <div className="bg-gray-800/50 rounded-2xl p-6 border border-purple-500/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-white">Results</h2>
                <Button
                  onClick={() => { setWallets([]); setWalletInput('') }}
                  variant="secondary"
                  size="md"
                >
                  ← New Analysis
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                <div className={`bg-gray-700/30 rounded-lg p-4 ${wallets.filter(w => w.error).length > 0 ? 'ring-2 ring-red-500/50' : ''}`}>
                  <div className="text-gray-400 text-sm">Errors</div>
                  <div className={`text-2xl font-bold ${wallets.filter(w => w.error).length > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                    {wallets.filter(w => w.error).length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-2xl border border-purple-500/20 overflow-hidden">
              <div className="overflow-x-auto">
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
                      const score = getScore(wallet)
                      const badge = getBadge(score)
                      return (
                        <tr key={wallet.id} className="hover:bg-gray-700/30 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-400">{wallet.id}</td>
                          <td className="px-4 py-3 font-mono text-xs text-purple-400">
                            {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
                          </td>
                          <td className="px-4 py-3">
                            {wallet.loading ? (
                              <div className="flex items-center gap-2">
                                <LoadingSpinner size="sm" />
                                <span className="text-gray-400 text-sm">Loading...</span>
                              </div>
                            ) : wallet.error ? (
                              <div className="flex items-center gap-2">
                                <span className="text-red-400 text-sm" title={wallet.error}>⚠️ Error</span>
                                <Button
                                  onClick={() => retryWallet(wallet.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs"
                                >
                                  🔄 Retry
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 animate-pop-in">
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
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
