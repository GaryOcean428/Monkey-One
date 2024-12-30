import { PineconeClient } from '@pinecone-database/pinecone';

const pineconeApiKey = import.meta.env.VITE_PINECONE_API_KEY;
const pineconeEnvironment = import.meta.env.VITE_PINECONE_ENVIRONMENT;
const pineconeIndexName = import.meta.env.VITE_PINECONE_INDEX_NAME;
const pineconeDimensions = parseInt(import.meta.env.VITE_PINECONE_dimensions || '3072');
const pineconeMetric = import.meta.env.VITE_PINECONE_METRIC || 'cosine';

if (!pineconeApiKey || !pineconeEnvironment || !pineconeIndexName) {
  throw new Error('Missing Pinecone environment variables');
}

const pinecone = new PineconeClient();

export const initPinecone = async () => {
  await pinecone.init({
    apiKey: pineconeApiKey,
    environment: pineconeEnvironment,
  });

  const index = pinecone.Index(pineconeIndexName);
  
  return {
    client: pinecone,
    index,
    config: {
      dimensions: pineconeDimensions,
      metric: pineconeMetric,
      indexName: pineconeIndexName,
    },
  };
};

export const getPineconeClient = () => pinecone;
