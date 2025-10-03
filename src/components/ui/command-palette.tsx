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
  placeholder = 'Type a command or search...',
  emptyText = 'No results found.',
  isLoading = false,
}: CommandPaletteProps) {
  const [query, setQuery] = React.useState('')
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  // Filter items based on query
  const filteredItems = React.useMemo(() => {
    if (!query) return items

    const lowercaseQuery = query.toLowerCase()
    return items.filter(item => {
      const searchText = [item.title, item.description, ...(item.keywords || [])]
        .join(' ')
        .toLowerCase()

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
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1))
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
    },
    [filteredItems, selectedIndex, onClose]
  )

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
          className="border-border bg-muted text-muted-foreground inline-flex h-5 min-w-[20px] items-center justify-center rounded border px-1 text-xs font-medium"
        >
          {key}
        </kbd>
      ))}
    </div>
  )

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="z-modal-backdrop animate-fade-in fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            'z-modal fixed top-1/2 left-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
            'rounded-xl border border-white/20 bg-white/5 shadow-2xl backdrop-blur-xl',
            'animate-scale-in overflow-hidden',
            'shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]'
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Enhanced glass overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10" />

          {/* Search Input */}
          <div className="relative flex items-center border-b border-white/10 p-4 backdrop-blur-sm">
            <Search className="text-muted-foreground h-4 w-4" />
            <input
              className={cn(
                'flex-1 bg-transparent px-3 py-1 text-sm outline-none',
                'placeholder:text-muted-foreground text-foreground'
              )}
              placeholder={placeholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            {isLoading && <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />}
          </div>

          {/* Results */}
          <div className="relative max-h-96 overflow-y-auto p-2">
            {Object.keys(groupedItems).length === 0 ? (
              <div className="text-muted-foreground flex items-center justify-center py-8 text-sm">
                {emptyText}
              </div>
            ) : (
              Object.entries(groupedItems).map(([group, groupItems]) => (
                <div key={group} className="mb-2">
                  <div className="text-muted-foreground px-2 py-1 text-xs font-medium tracking-wide uppercase">
                    {group}
                  </div>
                  {groupItems.map((item, globalIndex) => {
                    const flatIndex = filteredItems.indexOf(item)
                    const isSelected = flatIndex === selectedIndex

                    return (
                      <button
                        key={item.id}
                        className={cn(
                          'w-full rounded-lg px-3 py-2 text-left text-sm transition-all duration-200',
                          'hover-scale flex items-center justify-between gap-3',
                          isSelected
                            ? 'bg-accent-500/20 text-accent-600 border-accent-500/30 scale-[1.02] border shadow-md'
                            : 'hover:text-foreground border border-transparent hover:bg-white/10'
                        )}
                        onClick={() => {
                          item.action()
                          onClose()
                        }}
                        onMouseEnter={() => setSelectedIndex(flatIndex)}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          {item.icon && (
                            <div className="flex-shrink-0 transition-transform duration-200">
                              {item.icon}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">{item.title}</div>
                            {item.description && (
                              <div
                                className={cn(
                                  'truncate text-xs',
                                  isSelected ? 'text-accent-600/80' : 'text-muted-foreground'
                                )}
                              >
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>

                        {item.shortcut && (
                          <div className="flex-shrink-0">{renderShortcut(item.shortcut)}</div>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="text-muted-foreground relative border-t border-white/10 bg-black/20 p-2 text-xs backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span>
                {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-white/20 bg-white/10 px-1 text-xs">
                    ↑↓
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-white/20 bg-white/10 px-1 text-xs">
                    ↵
                  </kbd>
                  select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="inline-flex h-4 min-w-[16px] items-center justify-center rounded border border-white/20 bg-white/10 px-1 text-xs">
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
    close: () => setIsOpen(false),
  }
}
