// Polyfill for global in browser environment
if (typeof window !== 'undefined') {
  (window as any).global = window;
}

export {};
