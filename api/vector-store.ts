import { Pinecone } from '@pinecone-database/pinecone'

if (!process.env.PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY environment variable is not set')
}

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('PINECONE_INDEX_NAME environment variable is not set')
}

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
})

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME)

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request) {
  try {
    const { operation, data } = await req.json()

    switch (operation) {
      case 'search':
        const { vector, k = 5, filter } = data
        const searchResponse = await index.query({
          vector,
          topK: k,
          filter,
          includeMetadata: true,
          includeValues: true,
        })
        return new Response(JSON.stringify(searchResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })

      case 'store':
        const { vectors } = data
        await index.upsert(vectors)
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })

      case 'delete':
        const { ids } = data
        await index.deleteMany(ids)
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })

      default:
        return new Response(JSON.stringify({ error: 'Invalid operation' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
