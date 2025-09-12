import * as React from 'react'
import { Command as CommandIcon, Search, Loader2 } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { cn } from '../../lib/utils'

export interface CommandItem {
  id: string
  title: string
  description?: string
  keywords?: string[]
  icon?: React.ReactNode
  shortcut?: string[]
  action: () => void
  group?: string
}

export interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  items: CommandItem[]
  placeholder?: string
  emptyText?: string
  isLoading?: boolean
}

export function CommandPalette({
  isOpen,
  onClose,
  items,
  placeholder = "Type a command or search...",
  emptyText = "No results found.",
  isLoading = false
}: CommandPaletteProps) {
  const [query, setQuery] = React.useState('')
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  // Filter items based on query
  const filteredItems = React.useMemo(() => {
    if (!query) return items
    
    const lowercaseQuery = query.toLowerCase()
    return items.filter(item => {
      const searchText = [
        item.title,
        item.description,
        ...(item.keywords || [])
      ].join(' ').toLowerCase()
      
      return searchText.includes(lowercaseQuery)
    })
  }, [items, query])

  // Group filtered items
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    
    filteredItems.forEach(item => {
      const group = item.group || 'Commands'
      if (!groups[group]) groups[group] = []
      groups[group].push(item)
    })
    
    return groups
  }, [filteredItems])

  // Reset selection when items change
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [filteredItems])

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredItems.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action()
          onClose()
        }
        break
      case 'Escape':
        onClose()
        break
    }
  }, [filteredItems, selectedIndex, onClose])

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  const renderShortcut = (shortcut: string[]) => (
    <div className="flex items-center gap-1">
      {shortcut.map((key, index) => (
        <kbd 
          key={index}
          className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-muted px-1 text-xs font-medium text-muted-foreground"
        >
          {key}
        </kbd>
      ))}
    </div>
  )

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-modal-backdrop bg-black/50 animate-fade-in" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-modal w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
            "bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl",
            "animate-scale-in"
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Search Input */}
          <div className="flex items-center border-b border-border p-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              className={cn(
                "flex-1 bg-transparent px-3 py-1 text-sm outline-none",
                "placeholder:text-muted-foreground"
              )}
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto p-2">
            {Object.keys(groupedItems).length === 0 ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              Object.entries(groupedItems).map(([group, groupItems]) => (
                <div key={group} className="mb-2">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {group}
                  </div>
                  {groupItems.map((item, globalIndex) => {
                    const flatIndex = filteredItems.indexOf(item)
                    const isSelected = flatIndex === selectedIndex
                    
                    return (
                      <button
                        key={item.id}
                        className={cn(
                          "w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
                          "flex items-center justify-between gap-3",
                          isSelected 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() => {
                          item.action()
                          onClose()
                        }}
                        onMouseEnter={() => setSelectedIndex(flatIndex)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {item.icon && (
                            <div className="flex-shrink-0">
                              {item.icon}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className={cn(
                                "text-xs truncate",
                                isSelected 
                                  ? "text-primary-foreground/70" 
                                  : "text-muted-foreground"
                              )}>
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {item.shortcut && (
                          <div className="flex-shrink-0">
                            {renderShortcut(item.shortcut)}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>
                {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-border bg-muted px-1 text-xs">
                    ↑↓
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-border bg-muted px-1 text-xs">
                    ↵
                  </kbd>
                  select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-border bg-muted px-1 text-xs">
                    esc
                  </kbd>
                  close
                </span>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Hook for managing command palette with keyboard shortcut
export function useCommandPalette() {
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    isOpen,
    setIsOpen,
    toggle: () => setIsOpen(prev => !prev),
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  }
}