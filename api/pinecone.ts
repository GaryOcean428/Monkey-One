import type { RecordMetadata, RecordMetadataValue } from '@pinecone-database/pinecone'
import { Pinecone } from '@pinecone-database/pinecone'

// Server-side only
const pineconeApiKey = process.env.PINECONE_API_KEY
const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT
const pineconeIndexName = process.env.PINECONE_INDEX_NAME

if (!pineconeApiKey || !pineconeEnvironment || !pineconeIndexName) {
  throw new Error('Missing Pinecone environment variables')
}

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: pineconeApiKey,
  controllerHostUrl: `https://controller.${pineconeEnvironment}.pinecone.io`,
})

const index = pinecone.index(pineconeIndexName)

export type VectorMetadata = Record<string, unknown>

function isSupportedMetadataValue(value: unknown): value is RecordMetadataValue {
  if (value === null || value === undefined) {
    return false
  }

  if (Array.isArray(value)) {
    return value.every(item => typeof item === 'string')
  }

  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
}

export function sanitizeMetadata(metadata?: VectorMetadata | null): RecordMetadata | undefined {
  if (!metadata) {
    return undefined
  }

  const entries = Object.entries(metadata).filter(([, value]) => isSupportedMetadataValue(value))

  if (entries.length === 0) {
    return undefined
  }

  return Object.fromEntries(entries) as RecordMetadata
}

export async function queryVectors(vector: number[], topK: number = 5) {
  try {
    const queryResponse = await index.query({
      vector,
      topK,
      includeMetadata: true,
    })
    return queryResponse.matches
  } catch (error) {
    console.error('Error querying vectors:', error)
    throw error
  }
}

export async function upsertVectors(
  vectors: { id: string; values: number[]; metadata?: VectorMetadata }[]
) {
  try {
    const sanitizedVectors = vectors.map(vector => ({
      ...vector,
      metadata: sanitizeMetadata(vector.metadata ?? null),
    }))

    return await index.upsert(sanitizedVectors)
  } catch (error) {
    console.error('Error upserting vectors:', error)
    throw error
  }
}

export async function deleteVectors(ids: string[]) {
  try {
    return await index.deleteMany(ids)
  } catch (error) {
    console.error('Error deleting vectors:', error)
    throw error
  }
}
