import './polyfills'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Set public URL if not available
const publicUrl =
  import.meta.env.VITE_PUBLIC_URL || window.location.origin || 'https://monkey-one-nine.vercel.app'

// Define a global variable without trying to modify import.meta.env (which is read-only)
if (typeof window !== 'undefined') {
  window.PUBLIC_URL = publicUrl
  window.ENV = window.ENV || {}
  window.ENV.VITE_PUBLIC_URL = publicUrl
}

// Log once that we're using a fallback for VITE_PUBLIC_URL
console.info('Using detected public URL:', publicUrl)

// Initialize error handling safely (moved to renderApp function to avoid top-level await)

// Add additional error handling for React rendering
async function renderApp() {
  try {
    // Initialize error handling safely
    try {
      const { ErrorHandler } = await import('./utils/errorHandler')
      ErrorHandler.initBrowserErrorHandling()
      ErrorHandler.safeApiCheck()
    } catch (error) {
      console.warn('Error handler initialization failed:', error)
    }
    // Make sure the root element exists
    const rootElement = document.getElementById('root')
    if (!rootElement) {
      console.error('Root element not found')
      document.body.innerHTML =
        '<div style="padding: 20px; text-align: center;">Failed to initialize app: Root element not found</div>'
      return
    }

    // Show loading state
    rootElement.innerHTML = '<div style="padding: 20px; text-align: center;">Loading...</div>'

    // Dynamically import components to catch import errors
    const [{ AppRoutes }, { SimpleErrorBoundary }] = await Promise.all([
      import('./routes').catch(err => {
        console.error('Failed to load routes:', err)
        throw new Error('Failed to load application routes')
      }),
      import('./components/simple-error-boundary').catch(err => {
        console.error('Failed to load error boundary:', err)
        // Provide fallback error boundary
        return {
          SimpleErrorBoundary: ({ children }: { children: React.ReactNode }) => (
            <div>{children}</div>
          ),
        }
      }),
    ])

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
    root.render(<SimpleErrorBoundary>{AppComponent}</SimpleErrorBoundary>)
  } catch (error) {
    console.error('Failed to render React app:', error)
    // Fallback for render errors
    const rootElement = document.getElementById('root')
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #ef4444; font-family: system-ui, sans-serif;">
          <h2>Application Failed to Load</h2>
          <p>There was an error initializing the application.</p>
          <p style="background: #fee; padding: 10px; border-radius: 4px; margin: 10px 0;">
            Error: ${error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <button onclick="window.location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Reload Page
          </button>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            If this error persists, please check the browser console for more details.
          </p>
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
