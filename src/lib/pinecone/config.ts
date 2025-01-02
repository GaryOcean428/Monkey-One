import { Pinecone } from '@pinecone-database/pinecone'

const pineconeApiKey = import.meta.env.VITE_PINECONE_API_KEY
const pineconeEnvironment = import.meta.env.VITE_PINECONE_ENVIRONMENT
const pineconeIndexName = import.meta.env.VITE_PINECONE_INDEX_NAME
const pineconeDimensions = parseInt(import.meta.env.VITE_PINECONE_dimensions || '3072')
const pineconeMetric = import.meta.env.VITE_PINECONE_METRIC || 'cosine'

if (!pineconeApiKey || !pineconeEnvironment || !pineconeIndexName) {
  throw new Error('Missing Pinecone environment variables')
}

const pinecone = new Pinecone({
  apiKey: pineconeApiKey,
  environment: pineconeEnvironment,
})

export const initPinecone = async () => {
  const index = pinecone.index(pineconeIndexName)

  return {
    client: pinecone,
    index,
    config: {
      dimensions: pineconeDimensions,
      metric: pineconeMetric,
      indexName: pineconeIndexName,
    },
  }
}

export const getPineconeClient = () => pinecone
