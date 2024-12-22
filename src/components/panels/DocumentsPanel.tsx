import React from 'react';
import { Upload, File, Folder } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '../ui/button';

export function DocumentsPanel() {
  const { documents, uploadDocument } = useDocuments();

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold dark:text-white">Documents</h2>
        <Button variant="outline" onClick={() => uploadDocument()}>
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                {doc.type === 'folder' ? (
                  <Folder className="text-blue-500" size={24} />
                ) : (
                  <File className="text-gray-500" size={24} />
                )}
                <span className="font-medium dark:text-white truncate">
                  {doc.name}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(doc.lastModified).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}