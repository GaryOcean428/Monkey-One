import React from 'react';
import { Button } from '../ui/button';
import { Github } from 'lucide-react';

export default function GitHubPanel() {
  return (
    <div className="h-full p-4 bg-background">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">GitHub Integration</h2>
        <Button variant="outline">
          <Github className="w-4 h-4 mr-2" />
          Connect GitHub
        </Button>
      </div>
      <div className="text-center text-muted-foreground mt-8">
        <p>No GitHub repositories connected.</p>
      </div>
    </div>
  );
}