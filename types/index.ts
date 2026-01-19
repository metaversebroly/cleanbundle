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
  funding?: FundingAnalysis;
  role?: RoleRecommendation;
}

export interface ScoreBadge {
  emoji: string;
  color: string;
}

// Error handling types
export enum ErrorType {
  INVALID_ADDRESS = 'invalid_address',
  NETWORK_ERROR = 'network_error',
  RPC_ERROR = 'rpc_error',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

export interface ErrorDetails {
  type: ErrorType;
  message: string;
  suggestion?: string;
  retryable: boolean;
}

// Toast notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// Validation types
export interface ValidationResult {
  valid: string[];
  invalid: { address: string; reason: string }[];
}

// Funding Analysis types
export interface FundingAnalysis {
  source: string;
  sourceName: string;
  confidence: number;
  evidence: string[];
  details: any | null;
}

// Role Recommendation types
export enum WalletRole {
  DEV_WALLET = 'dev_wallet',
  TOP_HOLDER = 'top_holder',
  MARKET_MAKER = 'market_maker',
  EARLY_SUPPORTER = 'early_supporter',
  SNIPER = 'sniper',
  UNKNOWN = 'unknown'
}

export interface RoleRecommendation {
  role: WalletRole;
  confidence: number;
  score: number;
  reasons: string[];
  concerns: string[];
}
