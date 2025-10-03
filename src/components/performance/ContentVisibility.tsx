import * as React from 'react'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'
import { cn } from '../../lib/utils'

export interface ContentVisibilityProps {
  children: React.ReactNode
  className?: string
  /** Height placeholder when content is not visible */
  height?: string | number
  /** Whether to use CSS content-visibility for performance */
  useContentVisibility?: boolean
  /** Intersection observer options */
  observerOptions?: IntersectionObserverInit
  /** Whether to lazy load the content */
  lazy?: boolean
  /** Fallback content while loading */
  fallback?: React.ReactNode
}

/**
 * ContentVisibility component for performance optimization
 * Uses CSS content-visibility and intersection observer for optimal rendering
 */
export function ContentVisibility({
  children,
  className,
  height = 'auto',
  useContentVisibility = true,
  observerOptions = {},
  lazy = false,
  fallback = null,
}: ContentVisibilityProps) {
  const [shouldRender, setShouldRender] = React.useState(!lazy)

  const { ref, isIntersecting, hasIntersected } = useIntersectionObserver({
    threshold: 0,
    rootMargin: '50px',
    ...observerOptions,
  })

  // For lazy loading, only render content after it has intersected
  React.useEffect(() => {
    if (lazy && hasIntersected && !shouldRender) {
      setShouldRender(true)
    }
  }, [lazy, hasIntersected, shouldRender])

  const contentVisibilityStyle: React.CSSProperties = useContentVisibility
    ? {
        contentVisibility: isIntersecting ? 'visible' : 'auto',
        containIntrinsicSize: typeof height === 'number' ? `${height}px` : height,
      }
    : {}

  return (
    <div
      ref={ref}
      className={cn('content-visibility-container', className)}
      style={contentVisibilityStyle}
    >
      {shouldRender ? children : fallback}
    </div>
  )
}

/**
 * VirtualizedList component for large lists with content visibility optimization
 */
export interface VirtualizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight?: number
  containerHeight?: number
  overscan?: number
  className?: string
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5,
  className,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0)
  const scrollElementRef = React.useRef<HTMLDivElement>(null)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1)

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return (
    <div
      ref={scrollElementRef}
      className={cn('virtualized-list overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              position: 'absolute',
              top: (startIndex + index) * itemHeight,
              width: '100%',
              height: itemHeight,
            }}
          >
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * LazyImage component with intersection observer for performance
 */
export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  fallbackSrc?: string
  placeholder?: React.ReactNode
  observerOptions?: IntersectionObserverInit
}

export function LazyImage({
  src,
  alt,
  fallbackSrc,
  placeholder,
  className,
  observerOptions = {},
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = React.useState<string | undefined>(undefined)
  const [imageError, setImageError] = React.useState(false)
  const [imageLoaded, setImageLoaded] = React.useState(false)

  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
    ...observerOptions,
  })

  React.useEffect(() => {
    if (isIntersecting) {
      setImageSrc(src)
    }
  }, [isIntersecting, src])

  const handleLoad = React.useCallback(() => {
    setImageLoaded(true)
  }, [])

  const handleError = React.useCallback(() => {
    setImageError(true)
    if (fallbackSrc) {
      setImageSrc(fallbackSrc)
    }
  }, [fallbackSrc])

  return (
    <div ref={ref} className={cn('lazy-image-container relative overflow-hidden', className)}>
      {!imageLoaded && placeholder && (
        <div className="bg-muted absolute inset-0 flex items-center justify-center">
          {placeholder}
        </div>
      )}

      {imageSrc && (
        <img
          {...props}
          src={imageSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      )}

      {imageError && !fallbackSrc && (
        <div className="bg-muted text-muted-foreground absolute inset-0 flex items-center justify-center">
          <span className="text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  )
}

/**
 * Below-the-fold content wrapper with content visibility optimization
 */
export interface BelowFoldProps {
  children: React.ReactNode
  className?: string
  minHeight?: string | number
}

export function BelowFold({ children, className, minHeight = '100vh' }: BelowFoldProps) {
  return (
    <ContentVisibility
      className={cn('below-fold-content', className)}
      height={minHeight}
      useContentVisibility={true}
      lazy={true}
      observerOptions={{
        rootMargin: '100px',
        threshold: 0,
      }}
      fallback={
        <div
          className="below-fold-placeholder bg-muted/20"
          style={{ height: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }}
        />
      }
    >
      {children}
    </ContentVisibility>
  )
}
