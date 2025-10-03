import { getOpenAIClient } from './config'
import { VectorStore } from '@/memory/vector/VectorStore'

interface RAGOptions {
  query: string
  systemPrompt?: string
  collectionName?: string
  maxResults?: number
  temperature?: number
}

/**
 * Retrieval Augmented Generation (RAG) implementation
 * Retrieves relevant documents from the vector store and uses them as context for the AI model
 */
export async function generateRAGResponse({
  query,
  systemPrompt = 'You are a helpful AI assistant. Use the provided context to answer the question.',
  collectionName = 'documents',
  maxResults = 5,
  temperature = 0.7,
}: RAGOptions) {
  try {
    // 1. Retrieve relevant documents from the vector store
    const vectorStore = new VectorStore()
    const results = await vectorStore.search(query, { collectionName, limit: maxResults })

    const openai = getOpenAIClient()

    if (!results || results.length === 0) {
      // No context found, just answer directly
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'No relevant context found. ' + systemPrompt },
          { role: 'user', content: query },
        ],
        temperature,
      })

      return response.choices[0]?.message?.content || ''
    }

    // 2. Format the documents as context for the model
    const context = results
      .map(doc => `${doc.text}\nSource: ${doc.metadata?.source || 'Unknown'}`)
      .join('\n\n')

    // 3. Create a prompt that includes the retrieved context
    const ragSystemPrompt = `${systemPrompt}\n\nUse the following context to answer the question.\n\nContext:\n${context}`

    // 4. Generate a response using the context-enhanced prompt
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: ragSystemPrompt },
        { role: 'user', content: query },
      ],
      temperature,
    })

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error in RAG generation:', error)
    throw error
  }
}

/**
 * Add documents to the vector store for RAG
 */
export async function addDocumentsToRAG(
  documents: Array<{ text: string; metadata?: Record<string, any> }>,
  collectionName = 'documents'
) {
  try {
    const vectorStore = new VectorStore()
    await vectorStore.addDocuments(documents, collectionName)
    return { success: true, count: documents.length }
  } catch (error) {
    console.error('Error adding documents to RAG:', error)
    throw error
  }
}
