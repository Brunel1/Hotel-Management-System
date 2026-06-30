import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  beforeSend(event, hint) {
    if (event.exception) {
      console.error('Sentry Error:', hint.originalException)
    }
    return event
  }
})

export function captureException(error: Error, context?: any) {
  Sentry.captureException(error, { extra: context })
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, { level })
}

export function setUser(user: { id: string; email: string; username?: string }) {
  Sentry.setUser(user)
}

export function setTag(key: string, value: string) {
  Sentry.setTag(key, value)
}

export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({ name, op })
}
