import '@testing-library/jest-dom'
import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest'
import { server } from './test/mocks/server'

// Extend Vitest's expect
expect.extend(matchers)

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => {
  cleanup()
  server.resetHandlers()
  vi.clearAllMocks()
  vi.clearAllTimers()
})

// Mock window.performance
Object.defineProperty(window, 'performance', {
  value: {
    memory: {
      jsHeapSizeLimit: 2147483648, // 2GB
      totalJSHeapSize: 1073741824, // 1GB
      usedJSHeapSize: 536870912, // 512MB
    },
    now: () => Date.now(),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(),
    getEntriesByType: vi.fn(),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
  },
  writable: true,
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}))

// Mock TextDecoder/TextEncoder
global.TextDecoder = vi.fn().mockImplementation(() => ({
  decode: vi.fn(text => text),
}))

global.TextEncoder = vi.fn().mockImplementation(() => ({
  encode: vi.fn(text => text),
}))

// Mock WebGL context
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: vi.fn(function getContext(contextType: string) {
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return {
        getExtension: vi.fn(),
        getParameter: vi.fn(),
        getShaderPrecisionFormat: vi.fn(() => ({
          precision: 23,
          rangeMin: 127,
          rangeMax: 127,
        })),
      } as unknown as WebGLRenderingContext
    }

    return null
  }) as typeof HTMLCanvasElement.prototype.getContext,
})

// Mock Fetch API
global.fetch = vi.fn()

// Mock Request and Response constructors for fetch API
class RequestMock {
  constructor(input: RequestInfo, init?: RequestInit) {
    this.input = input
    this.init = init
  }
  input: RequestInfo
  init?: RequestInit
}

class ResponseMock {
  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = body
    this.init = init
  }
  body?: BodyInit | null
  init?: ResponseInit
  json = vi.fn().mockResolvedValue({})
  text = vi.fn().mockResolvedValue('')
  ok = true
  status = 200
}

global.Request = RequestMock as unknown as typeof Request
global.Response = ResponseMock as unknown as typeof Response
// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

// Mock console methods for cleaner test output
console.error = vi.fn()
console.warn = vi.fn()
console.log = vi.fn()
