import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-ring active-press disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden will-change-transform',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-md hover-lift hover:shadow-lg hover:shadow-primary/25',
        secondary:
          'bg-secondary text-secondary-foreground hover-lift hover:bg-secondary/80 hover:shadow-md',
        ghost: 'hover:bg-accent hover:text-accent-foreground transition-colors hover:scale-[1.02]',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover-lift hover:border-accent',
        destructive:
          'bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover-lift hover:shadow-destructive/25',
        glass:
          'bg-white/5 backdrop-blur-lg border border-white/10 text-foreground hover-scale hover:bg-white/10 hover:border-white/20',
        gradient:
          'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover-lift hover:shadow-xl hover:shadow-primary/30',
        accent:
          'bg-accent-500 text-white shadow-md hover-lift hover:bg-accent-600 hover:shadow-lg hover:shadow-accent-500/25',
        glow: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-lg hover-lift hover:shadow-xl hover:shadow-accent-500/40 relative',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-md',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
        icon: 'h-10 w-10',
      },
      animation: {
        none: '',
        subtle: 'hover:scale-[1.01] active:scale-[0.99]',
        bounce: 'hover:scale-[1.02] active:scale-[0.98] hover:animate-pulse',
        float: 'hover:translate-y-[-1px] hover:shadow-lg active:translate-y-0',
        glow: 'hover:shadow-[0_0_20px_rgba(var(--accent-500),0.4)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      animation: 'subtle',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  loadingText?: string
  shimmer?: boolean
  pulseOnLoad?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      children,
      isLoading,
      loadingText,
      disabled,
      shimmer = false,
      pulseOnLoad = false,
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = React.useState(false)

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, animation, className }),
          isPressed && 'scale-95',
          pulseOnLoad && isLoading && 'animate-pulse'
        )}
        disabled={isLoading || disabled}
        ref={ref}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        {...props}
      >
        {isLoading && (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText && <span>{loadingText}</span>}
          </>
        )}
        {!isLoading && children}

        {/* Enhanced shine effect for gradient and glow variants */}
        {(variant === 'gradient' || variant === 'glow') && (
          <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[100%]" />
        )}

        {/* Shimmer effect */}
        {shimmer && (
          <div className="animate-shimmer absolute inset-0 translate-x-[-200%] -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        )}

        {/* Glow effect for accent and glow variants */}
        {(variant === 'glow' || variant === 'accent') && (
          <div className="from-accent-400/20 to-accent-600/20 absolute inset-0 rounded-lg bg-gradient-to-r opacity-0 blur-sm transition-opacity duration-300 hover:opacity-100" />
        )}

        {/* Ripple effect container */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-white/0 transition-colors duration-200 hover:bg-white/5" />
        </div>
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
