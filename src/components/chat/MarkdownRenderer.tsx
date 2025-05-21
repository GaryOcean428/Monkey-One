import React, { useState } from 'react';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import { Button } from '../ui/button';
import { RefreshCw, Filter, SortAsc, SortDesc } from 'lucide-react';

// Initialize marked with syntax highlighting
const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const [filterType, setFilterType] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Parse markdown to HTML
  const html = marked.parse(content);

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Markdown
        </Button>
        <Button variant="outline" size="sm" onClick={() => setFilterType(filterType ? null : 'type')}>
          <Filter className="w-4 h-4 mr-2" />
          {filterType ? 'Clear Filter' : 'Filter by Type'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
          Sort by Name
        </Button>
      </div>
      <div 
        className={`prose dark:prose-invert max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
