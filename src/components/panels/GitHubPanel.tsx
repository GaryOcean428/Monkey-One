import React from 'react';
import { Card } from '../ui/card';

export default function GithubPanel() {
  return (
    <div className="h-full p-4 bg-background">
      <h2 className="text-lg font-semibold mb-4">GitHub Integration</h2>
      <div className="grid grid-cols-1 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium mb-2">Repository Status</h3>
          <p className="text-sm text-muted-foreground">Configure your GitHub integration settings here.</p>
        </Card>
      </div>
    </div>
  );
}
