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
