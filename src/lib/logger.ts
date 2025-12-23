// Simple logger implementation with type-safe console access
interface LoggerInterface {
  error(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  info(message: string, ...args: unknown[]): void
  debug(message: string, ...args: unknown[]): void
}

class Logger implements LoggerInterface {
  private log(level: 'error' | 'warn' | 'info' | 'debug', message: string, ...args: unknown[]) {
    try {
      globalThis.console[level](message, ...args)
    } catch {
      // Fail silently if console is not available
    }
  }

  error(message: string, ...args: unknown[]) {
    this.log('error', message, ...args)
  }

  warn(message: string, ...args: unknown[]) {
    this.log('warn', message, ...args)
  }

  info(message: string, ...args: unknown[]) {
    this.log('info', message, ...args)
  }

  debug(message: string, ...args: unknown[]) {
    this.log('debug', message, ...args)
  }
}

export const logger = new Logger()
