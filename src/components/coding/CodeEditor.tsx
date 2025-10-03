import React from 'react'
import Editor from '@monaco-editor/react'
import { Button } from '../ui/button'
import { RefreshCw, Filter, SortAsc, SortDesc } from 'lucide-react'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  theme?: string
}

export function CodeEditor({
  value,
  onChange,
  language = 'typescript',
  theme = 'vs-dark',
}: CodeEditorProps) {
  const [filterType, setFilterType] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleRefresh = () => {
    // Logic to refresh the editor
  }

  const handleFilter = () => {
    // Logic to filter code by type
  }

  const handleSort = () => {
    // Logic to sort code by name
  }

  return (
    <div className="h-full w-full">
      <div className="mb-4 flex justify-between">
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Editor
        </Button>
        <Button variant="outline" size="sm" onClick={handleFilter}>
          <Filter className="mr-2 h-4 w-4" />
          Filter by Type
        </Button>
        <Button variant="outline" size="sm" onClick={handleSort}>
          {sortOrder === 'asc' ? (
            <SortAsc className="mr-2 h-4 w-4" />
          ) : (
            <SortDesc className="mr-2 h-4 w-4" />
          )}
          Sort by Name
        </Button>
      </div>
      <Editor
        value={value}
        onChange={value => onChange(value || '')}
        language={language}
        theme={theme}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          rulers: [80, 120],
          bracketPairColorization: { enabled: true },
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          autoIndent: 'full',
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  )
}
