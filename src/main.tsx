import './polyfills'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppRoutes } from './routes'
import './index.css'
import { ErrorHandler } from './utils/errorHandler'

// Ensure error handling is initialized
ErrorHandler.initBrowserErrorHandling()
ErrorHandler.safeApiCheck()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
)
