import { Pinecone, QueryOptions, PineconeRecord, RecordMetadata } from '@pinecone-database/pinecone'

export function initPineconeServerClient() {
  const pineconeApiKey = import.meta.env.VITE_PINECONE_API_KEY
  const pineconeEnvironment = import.meta.env.VITE_PINECONE_ENVIRONMENT
  const pineconeIndexName = import.meta.env.VITE_PINECONE_INDEX_NAME

  if (!pineconeApiKey || !pineconeEnvironment || !pineconeIndexName) {
    throw new Error('Missing Pinecone environment variables')
  }

  return new Pinecone({
    apiKey: pineconeApiKey,
    controllerHostUrl: `https://controller.${pineconeEnvironment}.pinecone.io`,
  })
}

export async function performPineconeOperation(
  operation: 'query' | 'upsert' | 'delete',
  data: QueryOptions | PineconeRecord<RecordMetadata>[] | { id: string }[]
) {
  const pinecone = initPineconeServerClient()
  const index = pinecone.index(import.meta.env.VITE_PINECONE_INDEX_NAME)

  switch (operation) {
    case 'query':
      return await index.query(data as QueryOptions)
    case 'upsert':
      return await index.upsert(data as PineconeRecord<RecordMetadata>[])
    case 'delete':
      return await index.deleteMany(data as { id: string }[])
    default:
      throw new Error('Invalid Pinecone operation')
  }
}
