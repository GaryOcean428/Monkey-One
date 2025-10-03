import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { AIStreamingChat } from '../components/chat/AIStreamingChat'
import { RAGChatInterface } from '../components/chat/RAGChatInterface'

export default function AI() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">AI Features</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Vercel AI SDK Integration</CardTitle>
          <CardDescription>
            Powered by the Vercel AI SDK, our AI features provide seamless streaming responses,
            structured data generation, and Retrieval Augmented Generation (RAG) capabilities.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="streaming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="streaming">Streaming Chat</TabsTrigger>
          <TabsTrigger value="rag">RAG Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="streaming" className="mt-6">
          <AIStreamingChat />
        </TabsContent>

        <TabsContent value="rag" className="mt-6">
          <RAGChatInterface />
        </TabsContent>
      </Tabs>
    </div>
  )
}
