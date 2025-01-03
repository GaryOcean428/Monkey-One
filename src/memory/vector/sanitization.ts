import { VectorMetadata } from './types'

interface JsonValue {
  [key: string]: string | number | boolean | null | JsonValue | JsonValue[]
}

/**
 * Sanitizes metadata to prevent injection attacks and ensure data consistency
 */
export function sanitizeMetadata(metadata: VectorMetadata): VectorMetadata {
  return {
    id: sanitizeString(metadata.id),
    timestamp: metadata.timestamp,
    source: metadata.source ? sanitizeString(metadata.source) : undefined,
    tags: metadata.tags ? metadata.tags.map(sanitizeString) : undefined,
    context: metadata.context ? sanitizeObject(metadata.context) : undefined,
  }
}

function sanitizeString(str: string): string {
  // Remove any control characters and normalize whitespace
  return str
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function sanitizeObject(obj: unknown): JsonValue | null {
  if (obj === null || obj === undefined) {
    return null
  }

  if (typeof obj !== 'object') {
    if (typeof obj === 'string') return sanitizeString(obj)
    if (typeof obj === 'number' || typeof obj === 'boolean') return obj
    return null
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)).filter((item): item is JsonValue => item !== null)
  }

  const sanitized: JsonValue = {}
  for (const [key, value] of Object.entries(obj)) {
    // Skip functions and symbols
    if (typeof value === 'function' || typeof value === 'symbol') {
      continue
    }

    // Sanitize key and value
    const sanitizedKey = sanitizeString(key)
    const sanitizedValue = sanitizeObject(value)
    if (sanitizedValue !== null) {
      sanitized[sanitizedKey] = sanitizedValue
    }
  }

  return sanitized
}
