import { Pinecone, PineconeRecord, RecordMetadata } from '@pinecone-database/pinecone'
import type { Request, Response } from 'express'

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
  environment: pineconeEnvironment,
})

const index = pinecone.index(pineconeIndexName)

interface PineconeVector {
  id: string
  values: number[]
  metadata: Record<string, string | number | boolean | null>
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
  vectors: {
    id: string
    values: number[]
    metadata?: Record<string, string | number | boolean | null>
  }[]
) {
  try {
    return await index.upsert(
      vectors.map(vector => ({ ...vector, metadata: vector.metadata as RecordMetadata }))
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

export async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { operation, data } = req.body

    switch (operation) {
      case 'query': {
        const queryResults = await index.query(data)
        return res.status(200).json(queryResults)
      }

      case 'upsert': {
        const vectors: PineconeRecord<RecordMetadata>[] = data.vectors.map(
          (vector: PineconeVector) => ({
            id: vector.id,
            values: vector.values,
            metadata: vector.metadata,
          })
        )
        const upsertResults = await index.upsert(vectors)
        return res.status(200).json(upsertResults)
      }

      default:
        return res.status(400).json({ error: 'Invalid operation' })
    }
  } catch (error) {
    console.error('Pinecone API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
