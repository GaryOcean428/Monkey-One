// Type declarations for global objects
declare global {
  interface Window {
    crypto: Crypto
    ENV?: Record<string, string>
    PUBLIC_URL?: string
    __MONKEY_ONE_SUPABASE_CLIENT__?: any
  }

  interface Global {
    crypto: Crypto
  }
}

// Polyfill crypto for Node.js environment
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  try {
    // Use a require statement which Vite can properly handle during build
    const nodeCrypto = require('crypto');
    (global as any).crypto = nodeCrypto.webcrypto;
  } catch (error) {
    console.error('Failed to load crypto module:', error);
  }
} else if (typeof window !== 'undefined' && !window.crypto) {
  // In browser environment without crypto, throw an error
  throw new Error('Browser does not support the Web Crypto API')
}

// Polyfill for React createRoot in older browsers
if (typeof window !== 'undefined') {
  // Ensure global objects are properly initialized
  window.ENV = window.ENV || {}
  
  // Add error boundary for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    // Optionally prevent the error from appearing in console
    event.preventDefault()
  })

  // Add error boundary for uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error)
  })
}

// Import this file in your entry point (e.g. main.tsx)
export {}
