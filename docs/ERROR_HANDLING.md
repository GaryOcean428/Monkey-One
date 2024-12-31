# Error Handling Guide

## Overview
This document outlines the error handling patterns and best practices for the Monkey-One system. It provides guidelines for consistent error management across all components.

## Error Classification

### 1. System Errors

```typescript
enum SystemErrorType {
  INITIALIZATION = 'SYSTEM_INITIALIZATION_ERROR',
  CONFIGURATION = 'SYSTEM_CONFIGURATION_ERROR',
  RESOURCE = 'SYSTEM_RESOURCE_ERROR',
  NETWORK = 'SYSTEM_NETWORK_ERROR',
  DATABASE = 'SYSTEM_DATABASE_ERROR'
}

class SystemError extends Error {
  constructor(
    type: SystemErrorType,
    message: string,
    public readonly details?: object
  ) {
    super(`[${type}] ${message}`);
    this.name = 'SystemError';
  }
}
```

### 2. Application Errors

```typescript
enum AppErrorType {
  VALIDATION = 'APP_VALIDATION_ERROR',
  BUSINESS_LOGIC = 'APP_BUSINESS_LOGIC_ERROR',
  AUTHORIZATION = 'APP_AUTHORIZATION_ERROR',
  RATE_LIMIT = 'APP_RATE_LIMIT_ERROR',
  DATA_INTEGRITY = 'APP_DATA_INTEGRITY_ERROR'
}

class ApplicationError extends Error {
  constructor(
    type: AppErrorType,
    message: string,
    public readonly code: string,
    public readonly details?: object
  ) {
    super(`[${type}] ${message}`);
    this.name = 'ApplicationError';
  }
}
```

### 3. External Service Errors

```typescript
enum ExternalErrorType {
  API = 'EXTERNAL_API_ERROR',
  INTEGRATION = 'EXTERNAL_INTEGRATION_ERROR',
  TIMEOUT = 'EXTERNAL_TIMEOUT_ERROR',
  DEPENDENCY = 'EXTERNAL_DEPENDENCY_ERROR'
}

class ExternalServiceError extends Error {
  constructor(
    type: ExternalErrorType,
    service: string,
    message: string,
    public readonly response?: object
  ) {
    super(`[${type}] ${service}: ${message}`);
    this.name = 'ExternalServiceError';
  }
}
```

## Error Handling Patterns

### 1. API Error Handling

```typescript
class APIErrorHandler {
  static handle(error: Error): APIResponse {
    if (error instanceof SystemError) {
      return this.handleSystemError(error);
    }
    if (error instanceof ApplicationError) {
      return this.handleApplicationError(error);
    }
    if (error instanceof ExternalServiceError) {
      return this.handleExternalError(error);
    }
    return this.handleUnknownError(error);
  }

  private static handleSystemError(error: SystemError): APIResponse {
    return {
      status: 500,
      error: {
        type: 'system_error',
        message: error.message,
        details: error.details
      }
    };
  }

  private static handleApplicationError(error: ApplicationError): APIResponse {
    const statusMap = {
      [AppErrorType.VALIDATION]: 400,
      [AppErrorType.AUTHORIZATION]: 403,
      [AppErrorType.RATE_LIMIT]: 429
    };

    return {
      status: statusMap[error.type] || 400,
      error: {
        type: 'application_error',
        code: error.code,
        message: error.message,
        details: error.details
      }
    };
  }
}
```

### 2. Async Error Handling

```typescript
// Higher-order function for async error handling
const withErrorHandling = <T>(
  operation: () => Promise<T>,
  errorHandler: (error: Error) => Promise<T>
) => {
  return async (): Promise<T> => {
    try {
      return await operation();
    } catch (error) {
      return errorHandler(error as Error);
    }
  };
};

// Usage example
const fetchData = withErrorHandling(
  async () => {
    const response = await api.getData();
    return response.data;
  },
  async (error) => {
    logger.error('Failed to fetch data', error);
    throw new ApplicationError(
      AppErrorType.BUSINESS_LOGIC,
      'Failed to fetch data',
      'DATA_FETCH_ERROR',
      { originalError: error.message }
    );
  }
);
```

### 3. React Component Error Boundaries

```typescript
class ErrorBoundary extends React.Component<
  { fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Component error:', {
      error: error.message,
      component: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

## Error Recovery Strategies

### 1. Retry Logic

```typescript
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
}

async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === config.maxAttempts) {
        break;
      }
      
      const delay = Math.min(
        config.baseDelay * Math.pow(2, attempt - 1),
        config.maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

### 2. Circuit Breaker

```typescript
class CircuitBreaker {
  private failureCount: number = 0;
  private lastFailureTime?: number;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold: number,
    private resetTimeout: number
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  private shouldReset(): boolean {
    return (
      this.lastFailureTime !== undefined &&
      Date.now() - this.lastFailureTime >= this.resetTimeout
    );
  }
}
```

## Logging Best Practices

### 1. Structured Logging

```typescript
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: object;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  static log(entry: LogEntry): void {
    const logMessage = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    console.log(JSON.stringify(logMessage));
  }

  static error(message: string, error: Error, context?: object): void {
    this.log({
      level: 'error',
      message,
      context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }
}
```

### 2. Error Monitoring

```typescript
interface ErrorMonitorConfig {
  sampleRate: number;
  ignorePatterns: RegExp[];
  maxStackLength: number;
}

class ErrorMonitor {
  constructor(private config: ErrorMonitorConfig) {}

  captureError(error: Error, context?: object): void {
    if (this.shouldCapture(error)) {
      const errorReport = this.prepareErrorReport(error, context);
      this.sendToMonitoringService(errorReport);
    }
  }

  private shouldCapture(error: Error): boolean {
    if (Math.random() > this.config.sampleRate) {
      return false;
    }

    return !this.config.ignorePatterns.some(pattern =>
      pattern.test(error.message)
    );
  }

  private prepareErrorReport(error: Error, context?: object) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack?.slice(0, this.config.maxStackLength),
      context,
      timestamp: new Date().toISOString()
    };
  }
}
```

## Testing Error Scenarios

### 1. Error Test Utilities

```typescript
// Error testing utilities
export const expectToThrowAsync = async (
  operation: () => Promise<any>,
  errorType: any,
  message?: string
) => {
  try {
    await operation();
    fail('Expected operation to throw');
  } catch (error) {
    expect(error).toBeInstanceOf(errorType);
    if (message) {
      expect(error.message).toContain(message);
    }
  }
};

// Example test
describe('Error Handling', () => {
  it('should handle validation errors', async () => {
    await expectToThrowAsync(
      () => validateUser({ name: '' }),
      ApplicationError,
      'Name is required'
    );
  });
});
```

## Error Prevention Guidelines

1. **Input Validation**
   - Validate all inputs at system boundaries
   - Use strong typing with TypeScript
   - Implement request schema validation

2. **Defensive Programming**
   - Check for null/undefined values
   - Use optional chaining and nullish coalescing
   - Implement proper type guards

3. **Resource Management**
   - Implement proper cleanup in finally blocks
   - Use resource pools with proper timeouts
   - Monitor resource usage and implement limits

4. **State Management**
   - Maintain consistent state transitions
   - Implement proper locking mechanisms
   - Use transactions for critical operations
