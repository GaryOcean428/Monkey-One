import React from 'react';
import { Card } from '../ui/card';

export default function VectorStorePanel() {
  return (
    <div className="h-full p-4 bg-background">
      <h2 className="text-lg font-semibold mb-4">Vector Store</h2>
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          <p>Vector store is empty.</p>
        </div>
      </Card>
    </div>
  );
}