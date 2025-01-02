/// <reference types="node" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="webworker" />
/// <reference lib="esnext" />

declare global {
  // Node.js globals
  import type { Require, Module } from 'node:module'
  import type { Process } from 'node:process'
  import type { Buffer } from 'node:buffer'
  import type { _Blob, _File } from 'node:buffer'
  import type { _TextDecoder, _TextEncoder } from 'node:util'
  import type { _Readable } from 'node:stream'
  import type { _Headers, _Request, _Response } from 'node-fetch'

  const require: Require
  const module: Module
  const process: Process
  const Buffer: typeof Buffer
  const __dirname: string
  const __filename: string

  // Browser APIs
  declare const fetch: typeof globalThis.fetch

  interface Window {
    crypto: globalThis.Crypto
    performance: globalThis.Performance
    localStorage: globalThis.Storage
    fetch: typeof fetch
  }

  interface Document extends globalThis.Document {}
  interface HTMLElement extends globalThis.HTMLElement {
    style: globalThis.CSSStyleDeclaration
  }

  interface HTMLInputElement extends globalThis.HTMLInputElement {
    value: string
    type: string
    checked: boolean
  }

  interface HTMLButtonElement extends globalThis.HTMLButtonElement {
    disabled: boolean
  }

  interface HTMLTextAreaElement extends globalThis.HTMLTextAreaElement {
    value: string
  }

  interface HTMLParagraphElement extends globalThis.HTMLParagraphElement {}
  interface HTMLHeadingElement extends globalThis.HTMLHeadingElement {}

  interface SVGSVGElement extends globalThis.SVGSVGElement {}

  // Event Types
  interface KeyboardEvent extends globalThis.KeyboardEvent {
    key: string
    code: string
    ctrlKey: boolean
    shiftKey: boolean
    altKey: boolean
    metaKey: boolean
  }
}

export {}
