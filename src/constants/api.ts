/**
 * Centralized API Constants
 * Following ISO-aligned naming conventions and versioned routing
 */

// API Version
export const API_VERSION = 'v1' as const

// API Base URLs
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004'
export const API_BASE_PATH = `/api/${API_VERSION}` as const

// Internal API Routes
export const API_ROUTES = {
  // Auth routes
  AUTH: {
    BASE: `${API_BASE_PATH}/auth`,
    LOGIN: `${API_BASE_PATH}/auth/login`,
    LOGOUT: `${API_BASE_PATH}/auth/logout`,
    REFRESH: `${API_BASE_PATH}/auth/refresh`,
    OIDC_STATUS: `${API_BASE_PATH}/auth/oidc-status`,
    GCP_STATUS: `${API_BASE_PATH}/auth/gcp-status`,
  },

  // AI/LLM routes
  AI: {
    BASE: `${API_BASE_PATH}/ai`,
    CHAT: `${API_BASE_PATH}/ai/chat`,
    COMPLETION: `${API_BASE_PATH}/ai/completion`,
    STREAM: `${API_BASE_PATH}/ai/stream`,
  },

  // Vector/Memory routes
  VECTOR: {
    BASE: `${API_BASE_PATH}/vector`,
    SEARCH: `${API_BASE_PATH}/vector/search`,
    UPSERT: `${API_BASE_PATH}/vector/upsert`,
    DELETE: `${API_BASE_PATH}/vector/delete`,
  },

  // Pinecone specific routes
  PINECONE: {
    BASE: `${API_BASE_PATH}/pinecone`,
    QUERY: `${API_BASE_PATH}/pinecone/query`,
    UPSERT: `${API_BASE_PATH}/pinecone/upsert`,
  },

  // Agent routes
  AGENTS: {
    BASE: `${API_BASE_PATH}/agents`,
    LIST: `${API_BASE_PATH}/agents`,
    GET: (id: string) => `${API_BASE_PATH}/agents/${id}`,
    CREATE: `${API_BASE_PATH}/agents`,
    UPDATE: (id: string) => `${API_BASE_PATH}/agents/${id}`,
    DELETE: (id: string) => `${API_BASE_PATH}/agents/${id}`,
    STATUS: (id: string) => `${API_BASE_PATH}/agents/${id}/status`,
  },

  // Memory routes
  MEMORY: {
    BASE: `${API_BASE_PATH}/memory`,
    GET: (id: string) => `${API_BASE_PATH}/memory/${id}`,
    SAVE: `${API_BASE_PATH}/memory`,
    SEARCH: `${API_BASE_PATH}/memory/search`,
  },

  // Health and monitoring
  HEALTH: {
    BASE: `${API_BASE_PATH}/health`,
    STATUS: `${API_BASE_PATH}/health/status`,
    METRICS: `${API_BASE_PATH}/health/metrics`,
  },
} as const

// Route Types
export type ApiRoute = typeof API_ROUTES
export type ApiRouteKey = keyof ApiRoute

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS]

// Response Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS]

// API Headers
export const API_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  API_KEY: 'X-API-Key',
  REQUEST_ID: 'X-Request-ID',
} as const

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
} as const

// API Timeouts (in milliseconds)
export const API_TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  LONG: 60000, // 1 minute
  STREAMING: 300000, // 5 minutes
} as const

// Rate Limiting
export const RATE_LIMITS = {
  DEFAULT: 100, // requests per minute
  AI_COMPLETION: 20, // AI completions per minute
  VECTOR_SEARCH: 50, // vector searches per minute
} as const
