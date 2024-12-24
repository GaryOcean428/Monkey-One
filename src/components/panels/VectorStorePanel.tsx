import React, { Suspense } from 'react';
import { Card } from '../ui/card';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ToolhouseErrorBoundary } from '../ErrorBoundary/ToolhouseErrorBoundary';

function VectorStoreContent() {
  // TODO: Replace with actual vector store hook
  const isLoading = false;
  const error = null;
  const vectors = [];

  if (error) {
    throw error;
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-lg font-semibold mb-4">Vector Store</h2>
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          <p>Vector store is empty.</p>
        </div>
      </Card>
    </>
  );
}

export default function VectorStorePanel() {
  return (
    <div 
      className="h-full p-4 bg-background"
      role="region"
      aria-label="Vector Store Management"
    >
      <ToolhouseErrorBoundary>
        <Suspense fallback={<LoadingSpinner size="lg" />}>
          <VectorStoreContent />
        </Suspense>
      </ToolhouseErrorBoundary>
    </div>
  );
}