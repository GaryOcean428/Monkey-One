import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Glassmorphism component variants
 */
export const glassVariants = cva(
  'backdrop-blur-md border border-white/10 shadow-lg relative overflow-hidden',
  {
    variants: {
      variant: {
        light: 'bg-white/5 border-white/20',
        medium: 'bg-white/10 border-white/25',
        heavy: 'bg-white/15 border-white/30',
        subtle: 'bg-white/3 border-white/15',
        frosted: 'bg-white/8 border-white/20 backdrop-saturate-150',
        tinted: 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
      },
      blur: {
        none: 'backdrop-blur-none',
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
        xl: 'backdrop-blur-xl'
      },
      shadow: {
        none: 'shadow-none',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
        glass: 'shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]'
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        full: 'rounded-full'
      }
    },
    defaultVariants: {
      variant: 'medium',
      blur: 'md',
      shadow: 'glass',
      rounded: 'lg'
    }
  }
)

export interface GlassProps 
  extends React.HTMLAttributes<HTMLDivElement>, 
  VariantProps<typeof glassVariants> {
  children: React.ReactNode
  shimmer?: boolean
  gradient?: boolean
}

/**
 * Enhanced Glass component with modern glassmorphism effects
 */
export function Glass({ 
  children, 
  className, 
  variant, 
  blur, 
  shadow, 
  rounded, 
  shimmer = false,
  gradient = false,
  ...props 
}: GlassProps) {
  return (
    <div 
      className={cn(
        glassVariants({ variant, blur, shadow, rounded }),
        shimmer && 'animate-shimmer overflow-hidden',
        gradient && 'bg-gradient-to-br from-white/10 via-white/5 to-white/10',
        className
      )}
      {...props}
    >
      {shimmer && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
      {children}
    </div>
  )
}

/**
 * Glass card with enhanced visual hierarchy
 */
export function GlassCard({ 
  children, 
  className, 
  variant = 'medium',
  ...props 
}: GlassProps) {
  return (
    <Glass
      variant={variant}
      rounded="xl"
      shadow="glass"
      className={cn('p-6', className)}
      {...props}
    >
      {children}
    </Glass>
  )
}

/**
 * Glass panel for sidebars and navigation
 */
export function GlassPanel({ 
  children, 
  className,
  variant = 'frosted',
  ...props 
}: GlassProps) {
  return (
    <Glass
      variant={variant}
      rounded="none"
      blur="lg"
      shadow="lg"
      className={cn('min-h-full', className)}
      {...props}
    >
      {children}
    </Glass>
  )
}

/**
 * Glass button component
 */
export const glassButtonVariants = cva(
  'relative overflow-hidden backdrop-blur-md border transition-all duration-200 hover-lift active-press',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-white/20 to-white/10 border-white/30 text-white hover:from-white/30 hover:to-white/20',
        secondary: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
        ghost: 'bg-transparent border-transparent hover:bg-white/10'
      },
      size: {
        sm: 'px-3 py-1.5 text-sm rounded-md',
        md: 'px-4 py-2 text-sm rounded-lg',
        lg: 'px-6 py-3 text-base rounded-lg',
        xl: 'px-8 py-4 text-lg rounded-xl'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof glassButtonVariants> {
  shimmer?: boolean
}

export function GlassButton({ 
  children, 
  className, 
  variant, 
  size, 
  shimmer = false,
  ...props 
}: GlassButtonProps) {
  return (
    <button
      className={cn(glassButtonVariants({ variant, size }), className)}
      {...props}
    >
      {shimmer && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  )
}

/**
 * Glass modal backdrop
 */
export function GlassBackdrop({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        'fixed inset-0 backdrop-blur-md bg-black/20 flex items-center justify-center p-4 z-modal-backdrop',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Utility classes for glass effects
 */
export const glassUtilities = {
  // Background variations
  'glass-light': 'bg-white/5 backdrop-blur-md border border-white/20',
  'glass-medium': 'bg-white/10 backdrop-blur-md border border-white/25',
  'glass-heavy': 'bg-white/15 backdrop-blur-lg border border-white/30',
  'glass-frosted': 'bg-white/8 backdrop-blur-md backdrop-saturate-150 border border-white/20',
  
  // Shadow variations
  'glass-shadow': 'shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
  'glass-shadow-lg': 'shadow-[0_16px_48px_0_rgba(31,38,135,0.5)]',
  
  // Interactive states
  'glass-hover': 'hover:bg-white/20 hover:border-white/30 transition-all duration-200',
  'glass-active': 'active:bg-white/25 active:scale-95 transition-all duration-100',
  
  // Gradient overlays
  'glass-gradient': 'bg-gradient-to-br from-white/10 via-white/5 to-white/10',
  'glass-gradient-radial': 'bg-radial-gradient from-white/15 via-white/8 to-white/5'
} as const