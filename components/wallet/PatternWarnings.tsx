import React from 'react';
import { motion } from 'framer-motion';
import { Link as LinkIcon } from 'lucide-react';
import { PatternWarning, WalletConnection } from '@/lib/analysis/patternDetector';

interface PatternWarningsProps {
  warnings: PatternWarning[];
  connections: WalletConnection[];
}

export function PatternWarnings({ warnings, connections }: PatternWarningsProps) {
  // Only show connection warnings
  const connectionWarnings = warnings.filter(w => w.type === 'connection');
  
  if (connectionWarnings.length === 0) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-5 text-center">
        <p className="text-lg font-semibold text-green-400">
          ✅ No wallet connections detected! Bundle looks clean.
        </p>
      </div>
    );
  }

  // ✅ SMART RECOMMENDATION: Find connection hubs
  const connectionCount = new Map<string, number>();
  connections.forEach(conn => {
    connectionCount.set(conn.from, (connectionCount.get(conn.from) || 0) + 1);
    connectionCount.set(conn.to, (connectionCount.get(conn.to) || 0) + 1);
  });

  // Find wallets with 2+ connections (hubs)
  const hubs = Array.from(connectionCount.entries())
    .filter(([_, count]) => count >= 2)
    .sort(([_, a], [__, b]) => b - a);

  let recommendation: string;
  if (hubs.length > 0) {
    const [hubAddress, hubCount] = hubs[0];
    recommendation = `Remove ${hubAddress.slice(0, 4)}...${hubAddress.slice(-4)} (connected to ${hubCount} other wallet${hubCount > 1 ? 's' : ''} in bundle)`;
  } else {
    recommendation = 'Remove any wallet marked as 🔗 Connected';
  }

  return (
    <div className="space-y-4">
      {/* Simple Connection Display */}
      <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <div className="text-red-400 mt-0.5">
            <LinkIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              🔗 Connection Detected
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              These wallets have sent SOL to each other. This link is visible on bubble maps.
            </p>
            
            {/* List each connection */}
            <div className="space-y-3">
              {connections.map((conn, idx) => (
                <motion.div
                  key={`${conn.from}-${conn.to}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-black/30 rounded-lg p-4 border border-red-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-gray-300">
                        {conn.from.slice(0, 4)}...{conn.from.slice(-4)}
                      </span>
                      <span className="text-red-400">↔</span>
                      <span className="font-mono text-gray-300">
                        {conn.to.slice(0, 4)}...{conn.to.slice(-4)}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-red-400">
                      {conn.amount.toFixed(2)} SOL
                    </span>
                  </div>
                  <a
                    href={`https://solscan.io/tx/${conn.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-gray-300 underline"
                  >
                    View transaction →
                  </a>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-red-500/20">
              <p className="text-sm text-yellow-300 font-medium">
                💡 Fix: {recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
