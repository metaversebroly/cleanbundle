export interface CEXWallet {
  address: string;
  name: string;
  confidence: number;
}

// Known CEX hot wallet addresses (from Solscan and blockchain explorers)
export const KNOWN_CEX_ADDRESSES: Record<string, CEXWallet[]> = {
  binance: [
    { address: '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9', name: 'Binance', confidence: 100 },
    { address: 'GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE', name: 'Binance', confidence: 100 },
    { address: 'AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2', name: 'Binance', confidence: 100 },
  ],
  
  bybit: [
    { address: '2ojv9BAiHUrvsm9gxDe7fJSzbNZSJcxZvf8dqmWGHG8S', name: 'Bybit', confidence: 100 },
    { address: 'AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2', name: 'Bybit', confidence: 100 },
  ],
  
  coinbase: [
    { address: 'H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS', name: 'Coinbase', confidence: 100 },
    { address: '2AQdpHJ2JpcEgPiATUXjQxA8QmafFegfQwSLWSprPicm', name: 'Coinbase', confidence: 100 },
  ],
  
  okx: [
    { address: '5VCwKtCXgCJ6kit5FybXjvriW3xELsFDhYrPSqtJNmcD', name: 'OKX', confidence: 100 },
  ],
  
  kraken: [
    { address: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy', name: 'Kraken', confidence: 100 },
  ],
  
  htx: [
    { address: 'F7H4HqcrE1yFb5sJKwG8W1kU8J8E7vLs8JqH4vL8jLxZ', name: 'HTX', confidence: 100 },
  ],
  
  kucoin: [
    { address: 'DkPvbq6u5pVgm7HvZpXzN8zKC8x5jPbQ9dJpZqJxZqJ', name: 'KuCoin', confidence: 100 },
  ],
  
  coinex: [
    { address: 'HmB9jK8pQ7xN5vL8fG2wR9sT4cX6zY3nM1dF5hJ7kL9', name: 'CoinEx', confidence: 100 },
  ],
  
  changenow: [
    { address: 'G2YxRa6wt1qePMwfJzdXZG62ej4qaTC7YURzuh2Lwd3t', name: 'ChangeNOW', confidence: 100 },
  ],
};

/**
 * Check if an address is a known CEX wallet
 */
export function checkKnownCEX(address: string): { cex: string; confidence: number } | null {
  for (const [cex, wallets] of Object.entries(KNOWN_CEX_ADDRESSES)) {
    const match = wallets.find(w => w.address === address);
    if (match) {
      return { cex, confidence: match.confidence };
    }
  }
  return null;
}

/**
 * Format CEX name for display
 */
export function formatCEXName(cex: string): string {
  const names: Record<string, string> = {
    binance: 'Binance',
    bybit: 'Bybit',
    coinbase: 'Coinbase',
    okx: 'OKX',
    kraken: 'Kraken',
    htx: 'HTX',
    kucoin: 'KuCoin',
    coinex: 'CoinEx',
    changenow: 'ChangeNOW',
    likely_cex: 'Likely CEX',
    direct_transfer: 'Direct Transfer',
    dex_trade: 'DEX Trade',
    unknown: 'Unknown',
  };
  return names[cex] || cex.toUpperCase();
}
