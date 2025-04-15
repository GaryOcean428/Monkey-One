import './polyfills'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppRoutes } from './routes'
import './index.css'
import { ErrorHandler } from './utils/errorHandler'
import { ErrorBoundary } from './components/error-boundary'

// Set public URL if not available
const publicUrl = window.location.origin || 'https://monkey-one.vercel.app'

// Define a global variable without trying to modify import.meta.env (which is read-only)
window.PUBLIC_URL = publicUrl

// Use a safer approach for environment variables
const envVars = {
  VITE_PUBLIC_URL: publicUrl
}

// Make environment variables accessible throughout the app
window.ENV = window.ENV || {}
window.ENV.VITE_PUBLIC_URL = publicUrl

// Log once that we're using a fallback for VITE_PUBLIC_URL
console.info('Using detected public URL:', publicUrl)

// Ensure error handling is initialized
ErrorHandler.initBrowserErrorHandling()
ErrorHandler.safeApiCheck()

// Make sure the root element exists
const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found')
  document.body.innerHTML = '<div>Failed to initialize app: Root element not found</div>'
} else {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <ErrorBoundary>
      <React.StrictMode>
        <AppRoutes />
      </React.StrictMode>
    </ErrorBoundary>
  )
}
