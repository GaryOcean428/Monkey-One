/* eslint-disable no-undef */
import './polyfills'
import React from 'react'
import ReactDOM from 'react-dom/client'
import AuthProvider from './components/auth/AuthProvider'
import { VectorStoreProvider } from './contexts/VectorStoreContext'
import { ErrorBoundary } from 'react-error-boundary'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { StoreProvider } from './providers/StoreProvider'
import { SettingsProvider } from './providers/SettingsProvider'
import './index.css'
import styles from './styles/error.module.css'

// Add error boundary for the entire app
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className={styles.errorContainer}>
    <h1>Something went wrong</h1>
    <pre className={styles.errorMessage}>{error.message}</pre>
  </div>
)

// Initialize app
const init = () => {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    const errorDiv = document.createElement('div')
    errorDiv.className = styles.initError
    errorDiv.textContent = 'Failed to initialize application: Root element not found'
    document.body.appendChild(errorDiv)
    return
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AuthProvider>
          <VectorStoreProvider>
            <SettingsProvider>
              <StoreProvider>
                <RouterProvider router={router} />
              </StoreProvider>
            </SettingsProvider>
          </VectorStoreProvider>
        </AuthProvider>
      </ErrorBoundary>
    </React.StrictMode>
  )
}

// Run initialization
init()
