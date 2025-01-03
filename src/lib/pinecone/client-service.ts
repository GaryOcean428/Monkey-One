// Intentionally left empty to prevent client-side Pinecone SDK usage

/**
 * Safely handle Pinecone operations by routing through backend API
 */
export async function queryPineconeViaAPI(operation: string, data: unknown) {
  try {
    const response = await window.fetch('/api/pinecone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operation, data }),
    })

    if (!response.ok) {
      throw new Error('Pinecone API request failed')
    }

    return await response.json()
  } catch (error) {
    console.warn(
      'Pinecone SDK is intended for server-side use only. ' +
        'Sensitive operations should be performed through a backend API.'
    )
    console.error('Pinecone API error:', error)
    throw error
  }
}

// Provide a no-op client to discourage direct SDK usage
export const createPineconeClient = () => {
  console.warn(
    'Pinecone SDK is not meant for client-side usage. ' +
      'Use queryPineconeViaAPI for safe interactions.'
  )
  return null
}
