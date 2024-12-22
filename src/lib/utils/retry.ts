const DEFAULT_RETRY_OPTIONS = {
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  maxAttempts: 3,
  retryableErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'EPIPE',
    'ERR_NETWORK',
    'ERR_CONNECTION_RESET'
  ]
};

export type RetryOptions = Partial<typeof DEFAULT_RETRY_OPTIONS>;

export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = DEFAULT_RETRY_OPTIONS.maxAttempts,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options, maxAttempts };
  let lastError: Error;
  let delay = opts.initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Check if error is retryable
      if (!isRetryableError(error, opts.retryableErrors)) {
        throw error;
      }

      // If this was our last attempt, throw the error
      if (attempt === maxAttempts) {
        throw new Error(`Operation failed after ${maxAttempts} attempts: ${lastError.message}`);
      }

      // Wait before retrying
      await sleep(delay);
      
      // Increase delay for next attempt, but don't exceed maxDelay
      delay = Math.min(delay * opts.backoffFactor, opts.maxDelay);
    }
  }

  throw lastError!;
}

function isRetryableError(error: any, retryableErrors: string[]): boolean {
  if (!error) return false;

  // Check error code
  if (error.code && retryableErrors.includes(error.code)) {
    return true;
  }

  // Check error name
  if (error.name && retryableErrors.includes(error.name)) {
    return true;
  }

  // Check if it's a network error
  if (error.message && error.message.toLowerCase().includes('network')) {
    return true;
  }

  // Check if it's a timeout error
  if (error.message && error.message.toLowerCase().includes('timeout')) {
    return true;
  }

  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
