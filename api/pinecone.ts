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

// Metadata type excludes undefined as Pinecone doesn't accept undefined values
export interface VectorMetadata {
  [key: string]: string | number | boolean | string[] | null
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
    // Sanitize metadata by filtering out undefined values
    const sanitizedVectors = vectors.map(v => ({
      id: v.id,
      values: v.values,
      metadata: v.metadata
        ? (Object.fromEntries(
            Object.entries(v.metadata).filter(([_, value]) => value !== undefined)
          ) as VectorMetadata)
        : undefined,
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
