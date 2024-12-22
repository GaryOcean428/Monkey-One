import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = 'typescript',
  theme = 'vs-dark'
}: CodeEditorProps) {
  return (
    <div className="h-full w-full">
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
  );
}