import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Pinecone } from '@pinecone-database/pinecone'

if (!process.env.PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY environment variable is not set')
}

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('PINECONE_INDEX_NAME environment variable is not set')
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
})

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {})
    const { operation, data } = body as { operation?: string; data?: any }

    switch (operation) {
      case 'search': {
        const {
          vector,
          k = 5,
          filter,
        } = (data ?? {}) as {
          vector: number[]
          k?: number
          filter?: Record<string, unknown>
        }
        const searchResponse = await index.query({
          vector,
          topK: k,
          filter,
          includeMetadata: true,
          includeValues: true,
        })
        res.status(200).json(searchResponse)
        return
      }
      case 'store': {
        const { vectors } = (data ?? {}) as { vectors: any[] }
        await index.upsert(vectors)
        res.status(200).json({ success: true })
        return
      }
      case 'delete': {
        const { ids } = (data ?? {}) as { ids: string[] }
        await index.deleteMany(ids)
        res.status(200).json({ success: true })
        return
      }
      default: {
        res.status(400).json({ error: 'Invalid operation' })
        return
      }
    }
  } catch (err) {
    try {
      console.error('vector-store handler error', err)
    } catch {}
    res.status(500).json({ error: 'Internal server error' })
  }
}
