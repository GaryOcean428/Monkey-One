import * as Sentry from '@sentry/browser'

export const initSentry = (): void => {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  const env = import.meta.env.MODE || 'development'

  if (dsn) {
    Sentry.init({
      dsn,
      environment: env,
      tracesSampleRate: 1.0,
    })
  }
}

export const captureException = (error: Error): void => {
  console.error(error)
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error)
  }
}

export const captureMessage = (message: string): void => {
  console.log(message)
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage(message)
  }
}
