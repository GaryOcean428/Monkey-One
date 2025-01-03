import { Pinecone } from '@pinecone-database/pinecone'

const pineconeApiKey = process.env.PINECONE_API_KEY
const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT
const pineconeIndexName = process.env.PINECONE_INDEX_NAME

if (!pineconeApiKey || !pineconeEnvironment || !pineconeIndexName) {
  throw new Error('Missing Pinecone environment variables')
}

const pinecone = new Pinecone({
  apiKey: pineconeApiKey,
  controllerHostUrl: `https://controller.${pineconeEnvironment}.pinecone.io`,
})

const index = pinecone.index(pineconeIndexName)

export default async function handler(req: Request, _res?: Response) {
  try {
    const method = req.method

    switch (method) {
      case 'POST':
        const body = await req.json()
        const { operation, data } = body

        switch (operation) {
          case 'query':
            const queryResult = await index.query(data)
            return new Response(JSON.stringify(queryResult), { status: 200 })

          case 'upsert':
            const upsertResult = await index.upsert(data)
            return new Response(JSON.stringify(upsertResult), { status: 200 })

          case 'delete':
            const deleteResult = await index.deleteMany(data)
            return new Response(JSON.stringify(deleteResult), { status: 200 })

          default:
            return new Response(JSON.stringify({ error: 'Invalid operation' }), { status: 400 })
        }

      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
    }
  } catch (error) {
    console.error('Pinecone API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
