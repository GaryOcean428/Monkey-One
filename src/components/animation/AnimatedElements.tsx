import * as React from 'react'
import { motion, MotionProps, useAnimation, Variants } from 'framer-motion'
import { useAnimateOnIntersect } from '../../hooks/useIntersectionObserver'
import { cn } from '../../lib/utils'

export interface AnimatedElementProps
  extends Omit<MotionProps, 'variants' | 'initial' | 'animate'> {
  children: React.ReactNode
  animation?:
    | 'fadeIn'
    | 'slideUp'
    | 'slideDown'
    | 'slideLeft'
    | 'slideRight'
    | 'scale'
    | 'bounce'
    | 'custom'
  duration?: number
  delay?: number
  staggerChildren?: number
  className?: string
  /** Custom variants for 'custom' animation type */
  customVariants?: Variants
  /** Whether to respect user's reduced motion preference */
  respectReducedMotion?: boolean
  /** Intersection observer options */
  observerOptions?: IntersectionObserverInit
}

// Predefined animation variants
const animations: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  bounce: {
    hidden: { opacity: 0, scale: 0.3 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
  },
}

/**
 * AnimatedElement that triggers animations when entering viewport
 */
export function AnimatedElement({
  children,
  animation = 'fadeIn',
  duration = 0.6,
  delay = 0,
  staggerChildren,
  className,
  customVariants,
  respectReducedMotion = true,
  observerOptions = {},
  ...motionProps
}: AnimatedElementProps) {
  const controls = useAnimation()
  const { ref, shouldAnimate } = useAnimateOnIntersect({
    threshold: 0.1,
    triggerOnce: true,
    ...observerOptions,
  })

  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  const variants = animation === 'custom' ? customVariants : animations[animation]

  React.useEffect(() => {
    if (shouldAnimate) {
      controls.start('visible')
    }
  }, [shouldAnimate, controls])

  // If user prefers reduced motion, show content without animation
  if (respectReducedMotion && prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  const transition = {
    duration,
    delay,
    ...(staggerChildren && {
      staggerChildren,
      delayChildren: delay,
    }),
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={controls}
      transition={transition}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}

/**
 * Stagger container for animating children in sequence
 */
export interface StaggerContainerProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
  observerOptions?: IntersectionObserverInit
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
  observerOptions = {},
}: StaggerContainerProps) {
  const controls = useAnimation()
  const { ref, shouldAnimate } = useAnimateOnIntersect({
    threshold: 0.1,
    triggerOnce: true,
    ...observerOptions,
  })

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  React.useEffect(() => {
    if (shouldAnimate) {
      controls.start('visible')
    }
  }, [shouldAnimate, controls])

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

/**
 * Parallax component with performance optimization
 */
export interface ParallaxProps {
  children: React.ReactNode
  speed?: number
  className?: string
  disabled?: boolean
}

export function Parallax({ children, speed = 0.5, className, disabled = false }: ParallaxProps) {
  const [offset, setOffset] = React.useState(0)
  const elementRef = React.useRef<HTMLDivElement>(null)

  const { isIntersecting } = useAnimateOnIntersect({
    threshold: 0,
    rootMargin: '100px',
  })

  React.useEffect(() => {
    if (disabled || !isIntersecting) return

    const handleScroll = () => {
      if (!elementRef.current) return

      const rect = elementRef.current.getBoundingClientRect()
      const scrolled = window.pageYOffset
      const parallax = (rect.top + scrolled) * speed
      setOffset(parallax)
    }

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed, disabled, isIntersecting])

  if (disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <div ref={elementRef} className={className}>
      <motion.div
        style={{
          y: offset,
        }}
        transition={{ type: 'tween', ease: 'linear' }}
      >
        {children}
      </motion.div>
    </div>
  )
}

/**
 * Scroll-triggered reveal animation
 */
export interface ScrollRevealProps {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
  duration?: number
  delay?: number
  className?: string
  once?: boolean
}

export function ScrollReveal({
  children,
  direction = 'up',
  distance = 50,
  duration = 0.6,
  delay = 0,
  className,
  once = true,
}: ScrollRevealProps) {
  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return { y: distance, opacity: 0 }
      case 'down':
        return { y: -distance, opacity: 0 }
      case 'left':
        return { x: distance, opacity: 0 }
      case 'right':
        return { x: -distance, opacity: 0 }
      default:
        return { y: distance, opacity: 0 }
    }
  }

  const variants: Variants = {
    hidden: getInitialTransform(),
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  return (
    <AnimatedElement
      animation="custom"
      customVariants={variants}
      className={className}
      observerOptions={{ triggerOnce: once }}
    >
      {children}
    </AnimatedElement>
  )
}

/**
 * Count-up animation for numbers
 */
export interface CountUpProps {
  end: number
  start?: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  onComplete?: () => void
}

export function CountUp({
  end,
  start = 0,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  onComplete,
}: CountUpProps) {
  const [count, setCount] = React.useState(start)
  const { ref, shouldAnimate } = useAnimateOnIntersect({
    threshold: 0.1,
    triggerOnce: true,
  })

  React.useEffect(() => {
    if (!shouldAnimate) return

    const increment = (end - start) / (duration * 60) // 60fps
    let current = start

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
        onComplete?.()
      } else {
        setCount(current)
      }
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [shouldAnimate, end, start, duration, onComplete])

  const displayValue = `${prefix}${count.toFixed(decimals)}${suffix}`

  return (
    <span ref={ref} className={className}>
      {displayValue}
    </span>
  )
}
