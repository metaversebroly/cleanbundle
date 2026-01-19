export interface WalletData {
  totalTransactions: number;
  recentTransactions: number;
  ageInDays: number;
  balance: string;
}

export interface Wallet {
  id: number;
  address: string;
  data: WalletData | null;
  loading: boolean;
  error: string | null;
}

export interface ScoreBadge {
  emoji: string;
  color: string;
}
