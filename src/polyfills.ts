// Type declarations for global objects
declare global {
  interface Window {
    crypto: Crypto
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

// Import this file in your entry point (e.g. main.tsx)
export {}
