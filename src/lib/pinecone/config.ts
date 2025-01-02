/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="webworker" />

import { Pinecone } from '@pinecone-database/pinecone'

declare const fetch: typeof globalThis.fetch

const pineconeApiKey = import.meta.env.VITE_PINECONE_API_KEY
const pineconeEnvironment = import.meta.env.VITE_PINECONE_ENVIRONMENT
const pineconeIndexName = import.meta.env.VITE_PINECONE_INDEX_NAME

if (!pineconeApiKey || !pineconeEnvironment || !pineconeIndexName) {
  throw new Error('Missing Pinecone environment variables')
}

const pinecone = new Pinecone({
  apiKey: pineconeApiKey,
  // Construct the controller URL using the environment
  controllerHostUrl: `https://controller.${pineconeEnvironment}.pinecone.io`,
})

// Client-side configuration only
const pineconeDimensions = parseInt(import.meta.env.VITE_PINECONE_DIMENSIONS || '3072')
const pineconeMetric = import.meta.env.VITE_PINECONE_METRIC || 'cosine'

export interface PineconeConfig {
  dimensions: number
  metric: string
}

export const pineconeConfig: PineconeConfig = {
  dimensions: pineconeDimensions,
  metric: pineconeMetric,
}

export interface VectorMetadata {
  [key: string]: string | number | boolean | null | undefined
}

// API endpoints for vector operations
export async function queryVectors(vector: number[], topK: number = 5) {
  const response = await fetch('/api/vectors/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vector, topK }),
  })

  if (!response.ok) {
    throw new Error('Failed to query vectors')
  }

  return await response.json()
}

export async function upsertVectors(
  vectors: { id: string; values: number[]; metadata?: VectorMetadata }[]
) {
  const response = await fetch('/api/vectors/upsert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vectors }),
  })

  if (!response.ok) {
    throw new Error('Failed to upsert vectors')
  }

  return await response.json()
}

export async function deleteVectors(ids: string[]) {
  const response = await fetch('/api/vectors/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  })

  if (!response.ok) {
    throw new Error('Failed to delete vectors')
  }

  return await response.json()
}

// Initialize with client-side config only
export const initPinecone = async () => {
  return {
    config: pineconeConfig,
  }
}

export const getPineconeClient = () => pinecone
