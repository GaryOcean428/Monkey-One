type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerOptions {
  level: LogLevel
  prefix?: string
}

type LogMessage = string | number | boolean | object | null | undefined

class BrowserLogger {
  private level: LogLevel
  private prefix: string
  private levelPriority: { [key in LogLevel]: number } = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  constructor(options: LoggerOptions) {
    this.level = options.level
    this.prefix = options.prefix || ''
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.level]
  }

  private formatMessage(level: LogLevel, message: LogMessage, args: unknown[]): string {
    const timestamp = new Date().toISOString()
    const prefix = this.prefix ? `[${this.prefix}]` : ''
    const formattedMessage = typeof message === 'object' ? JSON.stringify(message) : String(message)
    return `${timestamp} ${prefix} ${level.toUpperCase()}: ${formattedMessage}${args.length ? ' ' + args.join(' ') : ''}`
  }

  debug(message: LogMessage, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, args))
    }
  }

  info(message: LogMessage, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, args))
    }
  }

  warn(message: LogMessage, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, args))
    }
  }

  error(message: LogMessage, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, args))
    }
  }
}

export const logger = new BrowserLogger({
  level: import.meta.env.PROD ? 'info' : 'debug',
  prefix: 'Monkey-One',
})
