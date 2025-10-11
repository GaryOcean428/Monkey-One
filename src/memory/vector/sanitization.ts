import { VectorMetadata } from './types'

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

/**
 * Sanitizes metadata to prevent injection attacks and ensure data consistency.
 */
export function sanitizeMetadata(metadata: VectorMetadata): VectorMetadata {
  return {
    ...metadata,
    id: sanitizeString(metadata.id),
    type: sanitizeString(metadata.type),
    source: sanitizeString(metadata.source),
    tags: metadata.tags?.map(sanitizeString),
    context: sanitizeContext(metadata.context),
  }
}

function sanitizeString(value: string): string {
  return value
    .replace(/[^\x20-\x7E]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function sanitizeContext(context: unknown): Record<string, JsonValue> | undefined {
  if (!context || typeof context !== 'object' || Array.isArray(context)) {
    return undefined
  }

  const sanitizedEntries: Array<[string, JsonValue]> = []

  for (const [rawKey, rawValue] of Object.entries(context)) {
    const key = sanitizeString(rawKey)
    const value = sanitizeValue(rawValue)
    if (value !== undefined) {
      sanitizedEntries.push([key, value])
    }
  }

  if (!sanitizedEntries.length) {
    return undefined
  }

  return Object.fromEntries(sanitizedEntries)
}

function sanitizeValue(value: unknown): JsonValue | undefined {
  if (value === null) return null
  if (value === undefined) return undefined

  if (typeof value === 'string') {
    return sanitizeString(value)
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }

  if (typeof value === 'boolean') {
    return value
  }

  if (Array.isArray(value)) {
    const sanitizedArray = value
      .map(item => sanitizeValue(item))
      .filter((item): item is JsonValue => item !== undefined)

    return sanitizedArray.length ? sanitizedArray : undefined
  }

  if (typeof value === 'object') {
    return sanitizeContext(value as Record<string, unknown>)
  }

  return undefined
}
