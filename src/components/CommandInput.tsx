import React, { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

interface CommandInputProps {
  onSendMessage: (content: string) => void
  isProcessing: boolean
}

export function CommandInput({ onSendMessage, isProcessing }: CommandInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [isProcessing])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-700 bg-gray-800 p-4">
      <div className="flex items-center rounded-lg border border-gray-700 bg-gray-900 transition-colors focus-within:border-green-500">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-transparent px-4 py-2 font-mono text-white focus:outline-none"
          placeholder={isProcessing ? 'Waiting for response...' : 'Enter a command...'}
          disabled={isProcessing}
        />
        <button
          type="submit"
          disabled={isProcessing || !input.trim()}
          className="p-2 text-green-400 hover:text-green-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </form>
  )
}
