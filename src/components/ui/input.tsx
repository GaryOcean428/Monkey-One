import * as React from "react";
import { cn } from "../../lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "flex w-full rounded-md border bg-background px-3 py-2 text-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "h-10 border-input ring-offset-background",
        floating: "h-12 border-input ring-offset-background peer",
        glass: "bg-white/5 backdrop-blur-lg border border-white/10 h-10",
      },
      state: {
        default: "",
        error: "border-destructive focus-visible:ring-red-500",
        success: "border-green-500 focus-visible:ring-green-500",
      }
    },
    defaultVariants: {
      variant: "default",
      state: "default"
    }
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, state, type, label, error, helperText, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const inputId = React.useId();

    const handleFocus = () => setIsFocused(true);
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasValue(e.target.value.length > 0);
      props.onBlur?.(e);
    };

    // For floating variant, wrap in a container
    if (variant === "floating") {
      return (
        <div className="relative">
          <input
            type={type}
            id={inputId}
            className={cn(
              inputVariants({ variant, state: error ? "error" : state }),
              "placeholder-transparent",
              className
            )}
            placeholder={label || props.placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            ref={ref}
            {...props}
          />
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "absolute left-3 transition-all duration-200 ease-gentle pointer-events-none",
                "peer-placeholder-shown:text-muted-foreground peer-placeholder-shown:top-3 peer-placeholder-shown:text-base",
                "peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary",
                (isFocused || hasValue) && "top-1 text-xs text-primary"
              )}
            >
              {label}
            </label>
          )}
          {error && (
            <p className="mt-1 text-sm text-destructive animate-slide-in-bottom">{error}</p>
          )}
          {helperText && !error && (
            <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            inputVariants({ variant, state: error ? "error" : state }),
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive animate-slide-in-bottom">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };