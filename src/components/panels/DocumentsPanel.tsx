import React from 'react';

export default function DocumentsPanel() {
  return (
    <div className="h-full p-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-4">Documents</h2>
        <div className="text-center text-muted-foreground mt-8">
          <p>No documents available.</p>
        </div>
      </div>
    </div>
  );
}