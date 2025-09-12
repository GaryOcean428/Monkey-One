import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-ring active-press disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-md hover-lift hover:shadow-lg',
        secondary: 'bg-secondary text-secondary-foreground hover-lift hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground transition-colors',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover-lift',
        destructive: 'bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover-lift',
        glass: 'bg-white/5 backdrop-blur-lg border border-white/10 text-foreground hover-scale',
        gradient: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover-lift hover:shadow-xl',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-md',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, isLoading, loadingText, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isLoading || disabled}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText && <span>{loadingText}</span>}
          </>
        )}
        {!isLoading && children}
        
        {/* Subtle shine effect for gradient variant */}
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 ease-out" />
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
