import { VectorMetadata } from './types'

export function validateVector(vector: number[] | Float32Array, dimension: number): boolean {
  if (!vector || vector.length !== dimension) {
    return false
  }

  // Check for valid numbers
  for (let i = 0; i < vector.length; i++) {
    if (typeof vector[i] !== 'number' || isNaN(vector[i]) || !isFinite(vector[i])) {
      return false
    }
  }

  return true
}

export function validateMetadata(metadata: VectorMetadata): void {
  if (!metadata) {
    throw new Error('Metadata is required')
  }

  if (!metadata.id || typeof metadata.id !== 'string') {
    throw new Error('Metadata must include a valid string id')
  }

  if (!metadata.timestamp || typeof metadata.timestamp !== 'number') {
    throw new Error('Metadata must include a valid timestamp')
  }

  if (metadata.tags && !Array.isArray(metadata.tags)) {
    throw new Error('Tags must be an array if provided')
  }

  if (metadata.source && typeof metadata.source !== 'string') {
    throw new Error('Source must be a string if provided')
  }
}
