import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../ui/use-toast';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { LoadingSpinner } from '../ui/loading-spinner';
import { generateRAGResponse, addDocumentsToRAG } from '@/lib/ai';
import { marked } from 'marked';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function RAGChatInterface() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  const [docContent, setDocContent] = useState('');
  const [docSource, setDocSource] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFileContent(content);
      setDocContent(content);
      setDocSource(file.name);
    };
    reader.readAsText(file);
  };
  
  // Handle document upload to vector store
  const handleDocumentUpload = async () => {
    try {
      setIsUploading(true);
      
      const documentToAdd = {
        text: docContent,
        metadata: {
          source: docSource || 'manual-entry',
          timestamp: new Date().toISOString(),
        }
      };
      
      await addDocumentsToRAG([documentToAdd]);
      
      toast({
        title: 'Document Added',
        description: 'Document has been added to the knowledge base.',
      });
      
      setIsDocDialogOpen(false);
      setDocContent('');
      setDocSource('');
      setFileContent(null);
      setFileName('');
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add document to knowledge base',
        variant: 'destructive',
      });
      console.error('Error adding document:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle chat form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      setIsLoading(true);
      
      // Get response using RAG
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          system: 'You are a helpful AI assistant with RAG capabilities. Use the provided context to answer questions accurately.',
          useRag: true,
          stream: false,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get RAG response');
      }
      
      const data = await response.json();
      
      // Add the assistant message to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI response',
        variant: 'destructive',
      });
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };
  
  return (
    <div className="flex flex-col space-y-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">RAG-Powered AI Chat</h2>
        <Button
          onClick={() => setIsDocDialogOpen(true)}
          variant="outline"
        >
          Add Document
        </Button>
      </div>
      
      {/* Chat Messages */}
      <Card className="p-4 overflow-y-auto max-h-[500px]">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Send a message to start chatting. This AI assistant uses Retrieval Augmented Generation (RAG) 
              to provide context-aware responses based on your knowledge base.
            </p>
          ) : (
            messages.map((message, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-primary/10 ml-auto max-w-[80%]' 
                    : 'bg-secondary/10 mr-auto max-w-[80%]'
                }`}
              >
                <div 
                  className="prose dark:prose-invert"
                  dangerouslySetInnerHTML={{ 
                    __html: marked(message.content) 
                  }}
                />
              </div>
            ))
          )}
          
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </Card>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Ask a question about your documents..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
          className="min-h-[100px]"
        />
        
        <Button 
          type="submit" 
          disabled={isLoading || !prompt.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Processing...
            </>
          ) : (
            'Send Message'
          )}
        </Button>
      </form>
      
      {/* Document Upload Dialog */}
      <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Document to Knowledge Base</DialogTitle>
            <DialogDescription>
              Upload a text file or paste content to add to your RAG knowledge base.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="docSource" className="text-right">
                Source
              </Label>
              <Input
                id="docSource"
                placeholder="Document name or source"
                value={docSource}
                onChange={(e) => setDocSource(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fileUpload" className="text-right">
                File
              </Label>
              <div className="col-span-3">
                <Input
                  id="fileUpload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".txt,.md"
                />
                {fileName && <p className="text-sm mt-1">Selected: {fileName}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="docContent" className="text-right pt-2">
                Content
              </Label>
              <Textarea
                id="docContent"
                placeholder="Paste document content here..."
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                className="col-span-3 min-h-[200px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDocDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDocumentUpload}
              disabled={isUploading || !docContent.trim()}
            >
              {isUploading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Uploading...
                </>
              ) : (
                'Add Document'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}