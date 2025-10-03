// Centralized error handling utility

interface ErrorLogOptions {
  level?: 'info' | 'warn' | 'error'
  context?: Record<string, unknown>
}

export class ErrorHandler {
  /**
   * Log errors with optional context and severity
   * @param error - The error to log
   * @param options - Additional logging options
   */
  static log(error: unknown, options: ErrorLogOptions = {}) {
    const { level = 'error', context } = options

    // Convert error to a string representation
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : JSON.stringify(error)

    // Construct log message
    const logMessage = context
      ? `${errorMessage} - Context: ${JSON.stringify(context)}`
      : errorMessage

    // Use appropriate console method based on log level
    switch (level) {
      case 'info':
        console.info(logMessage)
        break
      case 'warn':
        console.warn(logMessage)
        break
      default:
        console.error(logMessage)
    }

    // Optional: Send to error tracking service
    this.reportToErrorTrackingService(error, options)
  }

  /**
   * Handle browser-specific warnings and errors
   */
  static initBrowserErrorHandling() {
    // Catch and log unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.log(event.reason, {
        level: 'warn',
        context: {
          type: 'Unhandled Promise Rejection',
        },
      })

      // Prevent default error logging
      event.preventDefault()
    })

    // Catch and log general JavaScript errors
    window.addEventListener('error', event => {
      this.log(event.error, {
        level: 'error',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      })
    })

    // Warn about missing environment variables
    this.checkEnvironmentVariables()
  }

  /**
   * Check and warn about missing critical environment variables
   */
  private static checkEnvironmentVariables() {
    const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_PUBLIC_URL']

    requiredEnvVars.forEach(varName => {
      if (!import.meta.env[varName]) {
        this.log(`Missing environment variable: ${varName}`, {
          level: 'warn',
          context: {
            type: 'Environment Configuration',
          },
        })
      }
    })
  }

  /**
   * Placeholder for error tracking service integration
   * Replace with actual error tracking service (e.g., Sentry, LogRocket)
   */
  private static reportToErrorTrackingService(_error: unknown, _options: ErrorLogOptions) {
    // Implement error tracking service integration here
    // For example:
    // Sentry.captureException(error)
    // Use underscore prefix to silence ESLint unused variable warnings
  }

  /**
   * Safe method to check and handle browser APIs
   */
  static safeApiCheck() {
    // Check for critical browser APIs
    const criticalApis = [
      { name: 'navigator.clipboard', api: window.navigator?.clipboard },
      { name: 'localStorage', api: window.localStorage },
      { name: 'fetch', api: window.fetch },
    ]

    criticalApis.forEach(({ name, api }) => {
      if (!api) {
        this.log(`Browser API not supported: ${name}`, {
          level: 'warn',
          context: {
            type: 'Browser Compatibility',
          },
        })
      }
    })
  }

  /**
   * Validate environment variables at startup and log errors for missing critical variables
   */
  static validateEnvVars() {
    const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_PUBLIC_URL']

    requiredEnvVars.forEach(varName => {
      if (!import.meta.env[varName]) {
        this.log(`Missing critical environment variable: ${varName}`, {
          level: 'error',
          context: {
            type: 'Environment Configuration',
          },
        })
      }
    })
  }

  /**
   * Define default values for environment variables in a central configuration module
   */
  static getEnvVar(varName: string, defaultValue: string): string {
    const value = import.meta.env[varName] || defaultValue

    if (value === defaultValue) {
      this.log(`Using default value for environment variable: ${varName}`, {
        level: 'warn',
        context: {
          type: 'Environment Configuration',
        },
      })
    }

    return value
  }
}

// Initialize error handling when the module is imported
ErrorHandler.initBrowserErrorHandling()
ErrorHandler.safeApiCheck()
ErrorHandler.validateEnvVars()
