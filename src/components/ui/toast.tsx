import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

import { cn } from '../../lib/utils'

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full backdrop-blur-sm',
  {
    variants: {
      variant: {
        default: 'border bg-background/95 text-foreground backdrop-blur-sm',
        destructive:
          'destructive group border-destructive bg-destructive/95 text-destructive-foreground backdrop-blur-sm',
        success:
          'border-success bg-success/10 text-success-foreground backdrop-blur-sm border-success/20',
        warning:
          'border-warning bg-warning/10 text-warning-foreground backdrop-blur-sm border-warning/20',
        info: 'border-info bg-info/10 text-info-foreground backdrop-blur-sm border-info/20',
        glass:
          'border-white/20 bg-white/10 text-foreground backdrop-blur-md shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
        accent: 'border-accent-500/20 bg-accent-500/10 text-foreground backdrop-blur-sm',
      },
      size: {
        default: 'p-4 pr-8',
        compact: 'p-3 pr-6 text-sm',
        large: 'p-6 pr-10',
      },
      animation: {
        default: 'data-[state=open]:animate-slide-in-bottom data-[state=closed]:animate-fade-out',
        bounce: 'data-[state=open]:animate-bounce-subtle data-[state=closed]:animate-fade-out',
        scale: 'data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out',
        slide:
          'data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'default',
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants> & {
      icon?: React.ReactNode
      showIcon?: boolean
    }
>(({ className, variant, size, animation, icon, showIcon = true, children, ...props }, ref) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="text-success h-5 w-5" />
      case 'destructive':
        return <AlertCircle className="text-destructive-foreground h-5 w-5" />
      case 'warning':
        return <AlertTriangle className="text-warning h-5 w-5" />
      case 'info':
        return <Info className="text-info h-5 w-5" />
      default:
        return null
    }
  }

  const displayIcon = icon || (showIcon ? getDefaultIcon() : null)

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant, size, animation }), className)}
      {...props}
    >
      <div className="flex flex-1 items-start space-x-3">
        {displayIcon && <div className="flex-shrink-0 pt-0.5">{displayIcon}</div>}
        <div className="min-w-0 flex-1">{children}</div>
      </div>

      {/* Enhanced visual effects */}
      {variant === 'glass' && (
        <div className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-white/5 to-white/10" />
      )}

      {variant === 'accent' && (
        <div className="from-accent-500/5 to-accent-600/10 pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r" />
      )}
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action> & {
    variant?: 'default' | 'ghost' | 'outline'
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'focus:ring-ring hover-scale inline-flex h-8 shrink-0 items-center justify-center rounded-md px-3 text-sm font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none disabled:opacity-50',
      {
        'bg-background/80 border-border hover:bg-background text-foreground border':
          variant === 'default',
        'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
        'border-input bg-background hover:bg-accent hover:text-accent-foreground border':
          variant === 'outline',
      },
      'group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
      'group-[.success]:border-success/40 group-[.success]:hover:border-success/60 group-[.success]:hover:bg-success group-[.success]:hover:text-success-foreground',
      'group-[.warning]:border-warning/40 group-[.warning]:hover:border-warning/60 group-[.warning]:hover:bg-warning group-[.warning]:hover:text-warning-foreground',
      'group-[.info]:border-info/40 group-[.info]:hover:border-info/60 group-[.info]:hover:bg-info group-[.info]:hover:text-info-foreground',
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'text-foreground/50 hover:text-foreground hover:bg-accent/50 absolute top-2 right-2 rounded-md p-1 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:scale-110 focus:opacity-100 focus:ring-2 focus:outline-none active:scale-95',
      'group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
      'group-[.success]:text-success/70 group-[.success]:hover:text-success',
      'group-[.warning]:text-warning/70 group-[.warning]:hover:text-warning',
      'group-[.info]:text-info/70 group-[.info]:hover:text-info',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm leading-relaxed opacity-90', className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// Enhanced Toast Progress Bar
const ToastProgress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    max?: number
    variant?: 'default' | 'success' | 'destructive' | 'warning' | 'info'
  }
>(({ className, value = 0, max = 100, variant = 'default', ...props }, ref) => {
  const percentage = Math.min((value / max) * 100, 100)

  const progressVariants = {
    default: 'bg-primary',
    success: 'bg-success',
    destructive: 'bg-destructive',
    warning: 'bg-warning',
    info: 'bg-info',
  }

  return (
    <div
      ref={ref}
      className={cn('bg-muted/30 mt-3 h-1 w-full overflow-hidden rounded-full', className)}
      {...props}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-300 ease-out',
          progressVariants[variant]
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
})
ToastProgress.displayName = 'ToastProgress'

// Enhanced Toast with Countdown
const ToastCountdown = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    duration?: number
    onComplete?: () => void
    variant?: 'default' | 'success' | 'destructive' | 'warning' | 'info'
  }
>(({ className, duration = 5000, onComplete, variant = 'default', ...props }, ref) => {
  const [timeLeft, setTimeLeft] = React.useState(duration)

  React.useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.()
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 100)
    }, 100)

    return () => clearTimeout(timer)
  }, [timeLeft, onComplete])

  const percentage = (timeLeft / duration) * 100

  return (
    <ToastProgress
      ref={ref}
      className={className}
      value={percentage}
      max={100}
      variant={variant}
      {...props}
    />
  )
})
ToastCountdown.displayName = 'ToastCountdown'

// Enhanced Toast with Undo Action
interface ToastWithUndoProps {
  title: string
  description?: string
  onUndo: () => void
  undoLabel?: string
  variant?: 'default' | 'destructive' | 'warning'
  duration?: number
}

const ToastWithUndo = React.forwardRef<React.ElementRef<typeof Toast>, ToastWithUndoProps>(
  (
    { title, description, onUndo, undoLabel = 'Undo', variant = 'default', duration = 5000 },
    ref
  ) => {
    const [isUndone, setIsUndone] = React.useState(false)

    const handleUndo = () => {
      setIsUndone(true)
      onUndo()
    }

    if (isUndone) return null

    return (
      <Toast ref={ref} variant={variant}>
        <div className="flex-1">
          <ToastTitle>{title}</ToastTitle>
          {description && <ToastDescription>{description}</ToastDescription>}
          <ToastCountdown
            duration={duration}
            variant={variant}
            onComplete={() => setIsUndone(true)}
          />
        </div>
        <ToastAction onClick={handleUndo} variant="outline">
          {undoLabel}
        </ToastAction>
        <ToastClose />
      </Toast>
    )
  }
)
ToastWithUndo.displayName = 'ToastWithUndo'

// Enhanced Toast for loading states
const ToastLoading = React.forwardRef<
  React.ElementRef<typeof Toast>,
  {
    title: string
    description?: string
    progress?: number
    variant?: 'default' | 'info'
  }
>(({ title, description, progress, variant = 'info' }, ref) => {
  return (
    <Toast ref={ref} variant={variant} showIcon={false}>
      <div className="flex flex-1 items-center space-x-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <div className="flex-1">
          <ToastTitle>{title}</ToastTitle>
          {description && <ToastDescription>{description}</ToastDescription>}
          {typeof progress === 'number' && <ToastProgress value={progress} variant={variant} />}
        </div>
      </div>
    </Toast>
  )
})
ToastLoading.displayName = 'ToastLoading'

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastProgress,
  ToastCountdown,
  ToastWithUndo,
  ToastLoading,
}
