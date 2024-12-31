import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, FileText, Folder, Upload, Trash2, Download } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: string;
}

export const DocumentsPanel: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [documents] = React.useState<Document[]>([
    {
      id: '1',
      name: 'Technical Documentation.md',
      type: 'markdown',
      size: 1024,
      lastModified: '2024-12-29T02:30:00Z',
    },
    {
      id: '2',
      name: 'API Specification.yaml',
      type: 'yaml',
      size: 2048,
      lastModified: '2024-12-29T02:15:00Z',
    },
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic
    console.log('File upload:', event.target.files);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documents</h1>
        <div className="space-x-2">
          <Button variant="outline" asChild>
            <label>
              <Upload className="w-4 h-4 mr-2" />
              Import
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                multiple
              />
            </label>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Document Name</Label>
                  <Input placeholder="Enter document name" />
                </div>
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Input placeholder="e.g., markdown, yaml, json" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancel</Button>
                <Button>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Recent Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-4">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{doc.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {(doc.size / 1024).toFixed(2)} KB
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(doc.lastModified).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
};