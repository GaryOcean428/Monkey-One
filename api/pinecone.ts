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

export interface VectorMetadata {
  [key: string]: string | number | boolean | null | undefined
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
    return await index.upsert(
      vectors.map(vector => ({ ...vector, metadata: vector.metadata as VectorMetadata }))
    )
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
