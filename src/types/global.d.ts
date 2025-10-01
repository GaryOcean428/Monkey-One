/// <reference types="node" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="webworker" />
/// <reference lib="esnext" />

declare global {
  import type { Require, Module } from 'module'
  import type { Process } from 'process'

  // Browser APIs
  const window: typeof globalThis
  const document: Document
  const navigator: Navigator
  const localStorage: Storage
  const sessionStorage: Storage
  const console: Console
  const performance: Performance
  const crypto: Crypto
  const fetch: typeof fetch
  const Headers: typeof Headers
  const Request: typeof Request
  const Response: typeof Response

  // Node.js types
  namespace NodeJS {
    interface Process extends Process {
      env: ProcessEnv
    }
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test'
      [key: string]: string | undefined
    }
  }

  // Add proper types for Node.js globals
  const require: Require
  const module: Module
  const process: Process
  const Buffer: typeof Buffer
  const __dirname: string
  const __filename: string
  const global: typeof globalThis
  const setTimeout: typeof setTimeout
  const clearTimeout: typeof clearTimeout
  const setImmediate: typeof setImmediate
  const queueMicrotask: typeof queueMicrotask
  const MSApp: {
    execUnsafeLocalFunction: (callback: () => void) => void
  }

  // DOM Types
  interface Window extends globalThis.Window {
    PUBLIC_URL?: string;
    ENV?: Record<string, any>;
  }
  interface Document extends globalThis.Document {}
  interface Navigator extends globalThis.Navigator {}
  interface Storage extends globalThis.Storage {}
  interface Console extends globalThis.Console {}
  interface Performance extends globalThis.Performance {}
  interface Crypto extends globalThis.Crypto {}
}

export {}
