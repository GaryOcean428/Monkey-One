import { LogLevel as LogLevelValues, type LogLevel } from '../../constants/enums'

interface LoggerOptions {
  level: LogLevel
  prefix?: string
  metadata?: Record<string, unknown>
}

class Logger {
  private static instance: Logger
  private level: LogLevel
  private prefix: string
  private metadata: Record<string, unknown>

  private constructor(options: LoggerOptions) {
    this.level = options.level
    this.prefix = options.prefix || ''
    this.metadata = options.metadata || {}
  }

  public static getInstance(options: Partial<LoggerOptions> = {}): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger({
        level: options.level || LogLevelValues.INFO,
        prefix: options.prefix,
        metadata: options.metadata,
      })
    }
    return Logger.instance
  }

  private formatMessage(level: LogLevel, message: string, args: unknown[]): string {
    const timestamp = new Date().toISOString()
    const prefix = this.prefix ? `[${this.prefix}]` : ''
    const metadata = args.length > 0 ? ` ${JSON.stringify(args)}` : ''
    return `${timestamp} ${level.toUpperCase()} ${prefix} ${message}${metadata}`
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = [
      LogLevelValues.DEBUG,
      LogLevelValues.INFO,
      LogLevelValues.WARN,
      LogLevelValues.ERROR
    ]
    return levels.indexOf(level) >= levels.indexOf(this.level)
  }

  public debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevelValues.DEBUG)) {
      console.debug(this.formatMessage(LogLevelValues.DEBUG, message, args), ...args)
    }
  }

  public info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevelValues.INFO)) {
      console.info(this.formatMessage(LogLevelValues.INFO, message, args), ...args)
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevelValues.WARN)) {
      console.warn(this.formatMessage(LogLevelValues.WARN, message, args), ...args)
    }
  }

  public error(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevelValues.ERROR)) {
      console.error(this.formatMessage(LogLevelValues.ERROR, message, args), ...args)
    }
  }

  public child(options: Partial<LoggerOptions>): Logger {
    return new Logger({
      level: options.level || this.level,
      prefix: options.prefix || this.prefix,
      metadata: {
        ...this.metadata,
        ...options.metadata,
      },
    })
  }

  public setLevel(level: LogLevel): void {
    this.level = level
  }

  public setMetadata(metadata: Record<string, unknown>): void {
    this.metadata = metadata
  }
}

export const logger = Logger.getInstance()
