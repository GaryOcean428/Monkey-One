import * as React from 'react'
import { 
  useFocusManagement, 
  useKeyboardNavigation, 
  useScreenReaderAnnouncement,
  useAccessibleValidation 
} from '../../hooks/useAccessibility'
import { cn } from '../../lib/utils'

// Skip link for keyboard navigation
export interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'skip-link sr-only focus:not-sr-only',
        'absolute top-4 left-4 z-50',
        'bg-primary text-primary-foreground',
        'px-4 py-2 rounded-md',
        'font-medium text-sm',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        className
      )}
    >
      {children}
    </a>
  )
}

// Enhanced focus indicator wrapper
export interface FocusIndicatorProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'strong' | 'subtle'
}

export function FocusIndicator({ 
  children, 
  className, 
  variant = 'default' 
}: FocusIndicatorProps) {
  const focusClasses = {
    default: 'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
    strong: 'focus-within:ring-4 focus-within:ring-ring focus-within:ring-offset-4',
    subtle: 'focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-1'
  }

  return (
    <div className={cn(
      'focus-indicator',
      'focus-within:outline-none',
      focusClasses[variant],
      className
    )}>
      {children}
    </div>
  )
}

// Modal/Dialog with focus management
export interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title: string
  description?: string
  className?: string
  closeOnEscape?: boolean
  closeOnOverlayClick?: boolean
}

export function AccessibleModal({
  isOpen,
  onClose,
  children,
  title,
  description,
  className,
  closeOnEscape = true,
  closeOnOverlayClick = true
}: AccessibleModalProps) {
  const { ref } = useFocusManagement({
    trapFocus: isOpen,
    restoreFocus: true,
    initialFocus: '[role="dialog"] button, [role="dialog"] input, [role="dialog"] [tabindex="0"]'
  })

  const { announce } = useScreenReaderAnnouncement()

  useKeyboardNavigation({
    onEscape: closeOnEscape ? onClose : undefined,
    enabled: isOpen
  })

  React.useEffect(() => {
    if (isOpen) {
      announce(`${title} dialog opened`, 'assertive')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, title, announce])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? "modal-description" : undefined}
        className={cn(
          'relative z-10 w-full max-w-md p-6',
          'bg-background border rounded-lg shadow-lg',
          'focus:outline-none',
          className
        )}
      >
        <h2 id="modal-title" className="text-lg font-semibold mb-2">
          {title}
        </h2>
        
        {description && (
          <p id="modal-description" className="text-muted-foreground mb-4">
            {description}
          </p>
        )}
        
        {children}
      </div>
    </div>
  )
}

// Accessible form field with validation
export interface AccessibleFieldProps {
  children: React.ReactNode
  label: string
  fieldName: string
  required?: boolean
  helpText?: string
  className?: string
}

export function AccessibleField({
  children,
  label,
  fieldName,
  required = false,
  helpText,
  className
}: AccessibleFieldProps) {
  const { errors, getFieldProps, getErrorProps } = useAccessibleValidation()
  const fieldId = `field-${fieldName}`
  const helpId = `${fieldId}-help`
  const errorId = `${fieldId}-error`

  const hasError = !!errors[fieldName]

  return (
    <div className={cn('accessible-field space-y-2', className)}>
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium leading-6"
      >
        {label}
        {required && (
          <span 
            className="text-destructive ml-1" 
            aria-label="required"
          >
            *
          </span>
        )}
      </label>
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-required': required,
          'aria-describedby': [
            helpText ? helpId : null,
            hasError ? errorId : null
          ].filter(Boolean).join(' '),
          ...getFieldProps(fieldName)
        })}
        
        {hasError && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-destructive" aria-hidden="true">
              ⚠
            </span>
          </div>
        )}
      </div>
      
      {helpText && (
        <p id={helpId} className="text-sm text-muted-foreground">
          {helpText}
        </p>
      )}
      
      {hasError && (
        <p 
          {...getErrorProps(fieldName)}
          className="text-sm text-destructive"
        >
          {errors[fieldName]}
        </p>
      )}
    </div>
  )
}

// Accessible list with keyboard navigation
export interface AccessibleListProps<T> {
  items: T[]
  renderItem: (item: T, index: number, isSelected: boolean) => React.ReactNode
  onSelect?: (item: T, index: number) => void
  selectedIndex?: number
  className?: string
  ariaLabel?: string
}

export function AccessibleList<T>({
  items,
  renderItem,
  onSelect,
  selectedIndex = -1,
  className,
  ariaLabel = 'List'
}: AccessibleListProps<T>) {
  const [focusedIndex, setFocusedIndex] = React.useState(selectedIndex)
  const listRef = React.useRef<HTMLDivElement>(null)

  useKeyboardNavigation({
    onArrowKeys: (direction) => {
      if (direction === 'up') {
        setFocusedIndex(prev => Math.max(0, prev - 1))
      } else if (direction === 'down') {
        setFocusedIndex(prev => Math.min(items.length - 1, prev + 1))
      }
    },
    onEnter: () => {
      if (focusedIndex >= 0 && onSelect) {
        onSelect(items[focusedIndex], focusedIndex)
      }
    }
  })

  React.useEffect(() => {
    if (listRef.current && focusedIndex >= 0) {
      const itemElement = listRef.current.children[focusedIndex] as HTMLElement
      itemElement?.focus()
    }
  }, [focusedIndex])

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label={ariaLabel}
      className={cn('accessible-list', className)}
    >
      {items.map((item, index) => (
        <div
          key={index}
          role="option"
          aria-selected={index === selectedIndex}
          tabIndex={index === focusedIndex ? 0 : -1}
          className={cn(
            'list-item cursor-pointer p-2 rounded',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            index === selectedIndex && 'bg-primary text-primary-foreground',
            index === focusedIndex && 'ring-2 ring-ring'
          )}
          onClick={() => onSelect?.(item, index)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelect?.(item, index)
            }
          }}
        >
          {renderItem(item, index, index === selectedIndex)}
        </div>
      ))}
    </div>
  )
}

// Live region for screen reader announcements
export interface LiveRegionProps {
  children: React.ReactNode
  priority?: 'polite' | 'assertive'
  atomic?: boolean
  className?: string
}

export function LiveRegion({ 
  children, 
  priority = 'polite',
  atomic = true,
  className 
}: LiveRegionProps) {
  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      className={cn('sr-only', className)}
      role="status"
    >
      {children}
    </div>
  )
}

// Accessible tabs component
export interface AccessibleTabsProps {
  tabs: Array<{
    id: string
    label: string
    content: React.ReactNode
    disabled?: boolean
  }>
  defaultTab?: string
  onTabChange?: (tabId: string) => void
  className?: string
}

export function AccessibleTabs({
  tabs,
  defaultTab,
  onTabChange,
  className
}: AccessibleTabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id)
  const [focusedTab, setFocusedTab] = React.useState(activeTab)
  const { announce } = useScreenReaderAnnouncement()

  const handleTabClick = (tabId: string) => {
    if (tabs.find(tab => tab.id === tabId)?.disabled) return
    
    setActiveTab(tabId)
    setFocusedTab(tabId)
    onTabChange?.(tabId)
    
    const tab = tabs.find(t => t.id === tabId)
    if (tab) {
      announce(`${tab.label} tab selected`)
    }
  }

  useKeyboardNavigation({
    onArrowKeys: (direction) => {
      const currentIndex = tabs.findIndex(tab => tab.id === focusedTab)
      let newIndex: number
      
      if (direction === 'left') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
      } else if (direction === 'right') {
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
      } else {
        return
      }
      
      // Skip disabled tabs
      while (tabs[newIndex]?.disabled) {
        if (direction === 'left') {
          newIndex = newIndex > 0 ? newIndex - 1 : tabs.length - 1
        } else {
          newIndex = newIndex < tabs.length - 1 ? newIndex + 1 : 0
        }
      }
      
      setFocusedTab(tabs[newIndex].id)
    },
    onEnter: () => {
      handleTabClick(focusedTab)
    }
  })

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content

  return (
    <div className={cn('accessible-tabs', className)}>
      <div role="tablist" className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeTab}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            disabled={tab.disabled}
            tabIndex={tab.id === focusedTab ? 0 : -1}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              tab.id === activeTab
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="mt-4"
      >
        {activeTabContent}
      </div>
    </div>
  )
}