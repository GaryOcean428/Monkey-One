import * as React from 'react'
import { cn } from '../../lib/utils'
import { 
  useLazyAnimation, 
  useOptimizedAnimation,
  createStaggeredAnimation,
  usePrefersReducedMotion 
} from '../../lib/performance'

export interface AnimatedElementProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  animation?: 'fade-in' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale-in' | 'bounce-in'
  delay?: number
  duration?: number
  lazy?: boolean
  threshold?: number
  stagger?: boolean
  staggerDelay?: number
}

/**
 * Optimized animated element component
 */
export const AnimatedElement = React.forwardRef<HTMLDivElement, AnimatedElementProps>(({
  children,
  className,
  animation = 'fade-in',
  delay = 0,
  duration = 300,
  lazy = false,
  threshold = 0.1,
  stagger = false,
  staggerDelay = 100,
  ...props
}, ref) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  
  const animationClasses = {
    'fade-in': 'animate-fade-in',
    'slide-up': 'animate-slide-in-bottom',
    'slide-down': 'animate-slide-in-top',
    'slide-left': 'animate-slide-in-right',
    'slide-right': 'animate-slide-in-left',
    'scale-in': 'animate-scale-in',
    'bounce-in': 'animate-bounce-subtle'
  }

  const baseAnimationClass = animationClasses[animation] || animationClasses['fade-in']
  
  const { 
    ref: lazyRef, 
    animationClass: lazyAnimationClass,
    shouldAnimate: lazyShouldAnimate
  } = useLazyAnimation(baseAnimationClass, threshold, delay)
  
  const { 
    shouldAnimate: directShouldAnimate, 
    animationClass: directAnimationClass 
  } = useOptimizedAnimation(baseAnimationClass, true, delay)

  const shouldAnimate = lazy ? lazyShouldAnimate : directShouldAnimate
  const finalAnimationClass = lazy ? lazyAnimationClass : directAnimationClass
  const elementRef = lazy ? lazyRef : ref

  const style = React.useMemo(() => ({
    animationDuration: prefersReducedMotion ? '0.01ms' : `${duration}ms`,
    animationDelay: prefersReducedMotion ? '0ms' : `${delay}ms`,
    ...props.style
  }), [duration, delay, prefersReducedMotion, props.style])

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-opacity',
        shouldAnimate ? finalAnimationClass : 'opacity-0',
        prefersReducedMotion && 'opacity-100',
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
})

AnimatedElement.displayName = 'AnimatedElement'

export interface StaggeredContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  staggerDelay?: number
  animation?: AnimatedElementProps['animation']
  lazy?: boolean
}

/**
 * Container for staggered animations
 */
export const StaggeredContainer = React.forwardRef<HTMLDivElement, StaggeredContainerProps>(({
  children,
  className,
  staggerDelay = 100,
  animation = 'fade-in',
  lazy = true,
  ...props
}, ref) => {
  const childArray = React.Children.toArray(children)
  const delays = createStaggeredAnimation(staggerDelay, childArray.length)

  return (
    <div ref={ref} className={className} {...props}>
      {childArray.map((child, index) => (
        <AnimatedElement
          key={index}
          animation={animation}
          delay={delays[index]}
          lazy={lazy}
        >
          {child}
        </AnimatedElement>
      ))}
    </div>
  )
})

StaggeredContainer.displayName = 'StaggeredContainer'

export interface FadeInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  delay?: number
  lazy?: boolean
}

/**
 * Simple fade-in component
 */
export const FadeIn = React.forwardRef<HTMLDivElement, FadeInProps>(({
  children,
  delay = 0,
  lazy = true,
  ...props
}, ref) => (
  <AnimatedElement
    ref={ref}
    animation="fade-in"
    delay={delay}
    lazy={lazy}
    {...props}
  >
    {children}
  </AnimatedElement>
))

FadeIn.displayName = 'FadeIn'

export interface SlideInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  lazy?: boolean
}

/**
 * Slide-in animation component
 */
export const SlideIn = React.forwardRef<HTMLDivElement, SlideInProps>(({
  children,
  direction = 'up',
  delay = 0,
  lazy = true,
  ...props
}, ref) => {
  const animationMap = {
    up: 'slide-up',
    down: 'slide-down', 
    left: 'slide-left',
    right: 'slide-right'
  } as const

  return (
    <AnimatedElement
      ref={ref}
      animation={animationMap[direction]}
      delay={delay}
      lazy={lazy}
      {...props}
    >
      {children}
    </AnimatedElement>
  )
})

SlideIn.displayName = 'SlideIn'

export interface ScaleInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  delay?: number
  lazy?: boolean
}

/**
 * Scale-in animation component  
 */
export const ScaleIn = React.forwardRef<HTMLDivElement, ScaleInProps>(({
  children,
  delay = 0,
  lazy = true,
  ...props
}, ref) => (
  <AnimatedElement
    ref={ref}
    animation="scale-in"
    delay={delay}
    lazy={lazy}
    {...props}
  >
    {children}
  </AnimatedElement>
))

ScaleIn.displayName = 'ScaleIn'

/**
 * Hook for creating custom animated sequences
 */
export function useAnimationSequence(
  steps: Array<{
    element: string
    animation: string
    delay: number
    duration?: number
  }>
) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isComplete, setIsComplete] = React.useState(false)

  React.useEffect(() => {
    if (currentStep >= steps.length) {
      setIsComplete(true)
      return
    }

    const step = steps[currentStep]
    const timeout = setTimeout(() => {
      setCurrentStep(prev => prev + 1)
    }, step.delay + (step.duration || 300))

    return () => clearTimeout(timeout)
  }, [currentStep, steps])

  const getStepProps = (stepIndex: number) => {
    const isActive = currentStep > stepIndex
    const step = steps[stepIndex]
    
    return {
      className: isActive ? step.animation : 'opacity-0',
      style: {
        animationDelay: `${step.delay}ms`,
        animationDuration: `${step.duration || 300}ms`
      }
    }
  }

  return {
    currentStep,
    isComplete,
    getStepProps,
    reset: () => {
      setCurrentStep(0)
      setIsComplete(false)
    }
  }
}