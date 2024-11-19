import { useState, useCallback } from 'react';

interface Document {
  id: string;
  name: string;
  type: 'file' | 'folder';
  lastModified: number;
  size?: number;
  path: string;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Project Documentation',
      type: 'folder',
      lastModified: Date.now(),
      path: '/docs'
    },
    {
      id: '2',
      name: 'API Specifications.md',
      type: 'file',
      lastModified: Date.now(),
      size: 1024,
      path: '/docs/api'
    }
  ]);

  const uploadDocument = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      const newDocs: Document[] = Array.from(files).map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: 'file',
        lastModified: file.lastModified,
        size: file.size,
        path: `/uploads/${file.name}`
      }));

      setDocuments(prev => [...prev, ...newDocs]);
    };

    input.click();
  }, []);

  return {
    documents,
    uploadDocument
  };
}