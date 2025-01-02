import { Pinecone } from '@pinecone-database/pinecone'
import { VectorMetadata } from './pinecone'

const pineconeApiKey = process.env.VITE_PINECONE_API_KEY
const pineconeEnvironment = process.env.VITE_PINECONE_ENVIRONMENT
const pineconeIndexName = process.env.VITE_PINECONE_INDEX_NAME

if (!pineconeApiKey || !pineconeEnvironment || !pineconeIndexName) {
  throw new Error('Missing Pinecone environment variables')
}

const pinecone = new Pinecone({
  apiKey: pineconeApiKey,
  controllerHostUrl: `https://controller.${pineconeEnvironment}.pinecone.io`,
})

const index = pinecone.index(pineconeIndexName)

export async function query(vector: number[], topK: number = 5) {
  const queryResponse = await index.query({
    vector,
    topK,
    includeMetadata: true,
  })
  return queryResponse.matches
}

export async function upsert(
  vectors: { id: string; values: number[]; metadata?: VectorMetadata }[]
) {
  return await index.upsert(
    vectors.map(vector => ({ ...vector, metadata: vector.metadata as VectorMetadata }))
  )
}

export async function deleteVectors(ids: string[]) {
  return await index.deleteMany(ids)
}
