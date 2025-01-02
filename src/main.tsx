import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'
import { ErrorHandler } from './utils/errorHandler'
import { BrowserRouter } from 'react-router-dom'

// Ensure error handling is initialized
ErrorHandler.initBrowserErrorHandling()
ErrorHandler.safeApiCheck()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
