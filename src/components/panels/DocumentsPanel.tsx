import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, FileText, Folder, Upload } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ToolhouseErrorBoundary } from '../ErrorBoundary/ToolhouseErrorBoundary';

export default function DocumentsPanel() {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <div className="h-full p-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Documents</h2>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Button>
          </div>
        </div>

        <Card className="p-4 mb-4">
          <div className="flex items-center gap-4">
            <Folder className="w-6 h-6 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Recent Documents</h3>
              <p className="text-sm text-muted-foreground">Quick access to your recent files</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <FileText className="w-6 h-6 text-muted-foreground" />
            <div>
              <h3 className="font-medium">All Documents</h3>
              <p className="text-sm text-muted-foreground">Browse and manage your documents</p>
            </div>
          </div>
        </Card>

        <div className="text-center text-muted-foreground mt-8">
          <p>No documents available.</p>
        </div>

        {isLoading && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>
    </div>
  );
}