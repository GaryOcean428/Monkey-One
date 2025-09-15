import './polyfills'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppRoutes } from './routes'
import './index.css'
import { ErrorHandler } from './utils/errorHandler'
import { ErrorBoundary } from './components/error-boundary'

// Set public URL if not available
const publicUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin || 'https://monkey-one-nine.vercel.app'

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

// Add additional error handling for React rendering
function renderApp() {
  try {
    // Make sure the root element exists
    const rootElement = document.getElementById('root')
    if (!rootElement) {
      console.error('Root element not found')
      document.body.innerHTML = '<div style="padding: 20px; text-align: center;">Failed to initialize app: Root element not found</div>'
      return
    }

    // Create React root with error handling
    const root = ReactDOM.createRoot(rootElement)
    
    // Only use StrictMode in development to avoid production issues
    const AppComponent = import.meta.env.DEV ? (
      <React.StrictMode>
        <AppRoutes />
      </React.StrictMode>
    ) : (
      <AppRoutes />
    )
    
    // Wrap in error boundary
    root.render(
      <ErrorBoundary>
        {AppComponent}
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('Failed to render React app:', error)
    // Fallback for render errors
    const rootElement = document.getElementById('root')
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #ef4444;">
          <h2>Application Failed to Load</h2>
          <p>There was an error initializing the application.</p>
          <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onclick="window.location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Reload Page
          </button>
        </div>
      `
    }
  }
}

// Add DOM ready check to ensure we don't render before DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp)
} else {
  renderApp()
}
