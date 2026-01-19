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

/**
 * Maps error objects to user-friendly error details
 */
export const parseError = (error: unknown): ErrorDetails => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Invalid address
    if (message.includes('invalid') && message.includes('public key')) {
      return {
        type: ErrorType.INVALID_ADDRESS,
        message: 'Invalid wallet address format',
        suggestion: 'Please check the address and try again',
        retryable: false,
      };
    }

    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network connection error',
        suggestion: 'Check your internet connection and retry',
        retryable: true,
      };
    }

    // Rate limiting
    if (message.includes('429') || message.includes('rate limit')) {
      return {
        type: ErrorType.RATE_LIMIT,
        message: 'RPC rate limit reached',
        suggestion: 'Please wait a moment before retrying',
        retryable: true,
      };
    }

    // Timeout
    if (message.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT,
        message: 'Request timed out',
        suggestion: 'The RPC node is slow. Try again',
        retryable: true,
      };
    }

    // RPC errors
    if (message.includes('rpc')) {
      return {
        type: ErrorType.RPC_ERROR,
        message: 'RPC node error',
        suggestion: 'The node is experiencing issues. Retry in a moment',
        retryable: true,
      };
    }

    // Generic error with message
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      suggestion: 'Please try again',
      retryable: true,
    };
  }

  // Unknown error type
  return {
    type: ErrorType.UNKNOWN,
    message: 'An unexpected error occurred',
    suggestion: 'Please try again',
    retryable: true,
  };
};

/**
 * Retry logic with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorDetails = parseError(error);

      if (!errorDetails.retryable) {
        throw error;
      }

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
};
