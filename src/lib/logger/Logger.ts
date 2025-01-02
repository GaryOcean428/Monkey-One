import winston from 'winston'

const { combine, timestamp, label, printf } = winston.format

interface LogMetadata {
  [key: string]: unknown
}

const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level.toUpperCase()}: ${message}`
})

export class Logger {
  private logger: winston.Logger
  private context: string

  constructor(context: string) {
    this.context = context
    this.logger = winston.createLogger({
      level:
        typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'
          ? 'debug'
          : 'info',
      format: combine(label({ label: 'Monkey-One' }), timestamp(), logFormat),
      transports: [
        new winston.transports.Console({
          format: combine(winston.format.colorize(), logFormat),
        }),
      ],
    })
  }

  info(message: string, metadata?: LogMetadata): void {
    this.logger.info(`[${this.context}] ${message}`, metadata)
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.logger.warn(`[${this.context}] ${message}`, metadata)
  }

  error(message: string, metadata?: LogMetadata): void {
    this.logger.error(`[${this.context}] ${message}`, metadata)
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.logger.debug(`[${this.context}] ${message}`, metadata)
  }
}
