import './polyfills'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppRoutes } from './routes'
import './index.css'
import { ErrorHandler } from './utils/errorHandler'
import { ErrorBoundary } from './components/error-boundary'

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
