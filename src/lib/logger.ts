// Simple logger implementation
class Logger {
  error(...args: any[]) {
    console.error(...args);
  }

  warn(...args: any[]) {
    console.warn(...args);
  }

  info(...args: any[]) {
    console.info(...args);
  }

  debug(...args: any[]) {
    console.debug(...args);
  }
}

export const logger = new Logger();
