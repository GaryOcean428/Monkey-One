import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Pinecone } from '@pinecone-database/pinecone'

type Vector = { id: string; values: number[]; metadata?: Record<string, string | number | boolean> }

let cachedIndex: ReturnType<Pinecone['Index']> | null = null
function getIndex() {
  const apiKey = process.env.PINECONE_API_KEY || process.env.VITE_PINECONE_API_KEY
  const indexName = process.env.PINECONE_INDEX_NAME || process.env.VITE_PINECONE_INDEX_NAME
  if (!apiKey || !indexName) return null
  if (!cachedIndex) {
    const pinecone = new Pinecone({ apiKey })
    cachedIndex = pinecone.Index(indexName)
  }
  return cachedIndex
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const index = getIndex()
  if (!index) {
    res.status(503).json({ error: 'Vector store not configured' })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {})
    const { operation, data } = (body ?? {}) as { operation?: string; data?: unknown }

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
        const { vectors } = (data ?? {}) as { vectors: Vector[] }
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
