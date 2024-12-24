import React, { Suspense } from 'react';
import { Button } from '../ui/button';
import { Github } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ToolhouseErrorBoundary } from '../ErrorBoundary/ToolhouseErrorBoundary';

function GitHubContent() {
  // TODO: Replace with actual GitHub integration hook
  const isLoading = false;
  const error = null;
  const isConnected = false;

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">GitHub Integration</h2>
        <Button variant="outline">
          <Github className="w-4 h-4 mr-2" />
          {isConnected ? 'Connected' : 'Connect GitHub'}
        </Button>
      </div>
      <div className="text-center text-muted-foreground mt-8">
        <p>No GitHub repositories connected.</p>
      </div>
    </>
  );
}

export default function GitHubPanel() {
  return (
    <div 
      className="h-full p-4 bg-background"
      role="region"
      aria-label="GitHub Integration"
    >
      <ToolhouseErrorBoundary>
        <Suspense fallback={<LoadingSpinner size="lg" />}>
          <GitHubContent />
        </Suspense>
      </ToolhouseErrorBoundary>
    </div>
  );
}