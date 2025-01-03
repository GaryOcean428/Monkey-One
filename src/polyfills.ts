import { webcrypto } from 'node:crypto'

// Polyfill crypto for Node.js environment
if (typeof window === 'undefined') {
  global.crypto = webcrypto as Crypto
}

// Type declarations for global objects
declare global {
  interface Window {
    crypto: Crypto
  }

  interface Global {
    crypto: Crypto
  }
}

// Import this file in your entry point (e.g. main.tsx)
export {}
