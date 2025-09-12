import * as React from 'react'
import { Button } from '../ui/button'
import { Glass, GlassCard, GlassButton } from '../ui/glass'
import { ThemeCustomizer } from '../ui/theme-customizer'
import { 
  Skeleton, 
  SkeletonCard, 
  SkeletonChatMessage, 
  SkeletonCodeBlock,
  SkeletonChart 
} from '../ui/skeleton'
import { 
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  ToastWithUndo,
  ToastLoading,
  ToastProgress
} from '../ui/toast'
import { useToast } from '../ui/use-toast'
import { cn } from '../../lib/utils'
import {
  Sparkles,
  Palette,
  Wand2,
  Star,
  Heart,
  Zap,
  Gem,
  Crown,
  Rocket,
  Rainbow,
  Flame,
  Award
} from 'lucide-react'

interface UIShowcaseProps {
  className?: string
}

export function UIShowcase({ className }: UIShowcaseProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)

  // Simulate loading progress
  React.useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsLoading(false)
            return 0
          }
          return prev + 10
        })
      }, 300)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  const showToastDemo = (variant: 'default' | 'success' | 'destructive' | 'warning' | 'info' | 'glass' | 'accent') => {
    toast({
      variant,
      title: `${variant.charAt(0).toUpperCase() + variant.slice(1)} Toast`,
      description: 'This is an enhanced toast with beautiful styling and animations.',
      action: <ToastAction altText="Try again">Action</ToastAction>
    })
  }

  const showUndoToast = () => {
    toast({
      title: 'Item deleted',
      description: 'Your item has been permanently removed.',
      action: (
        <ToastAction altText="Undo" onClick={() => toast({ title: 'Restored!', variant: 'success' })}>
          Undo
        </ToastAction>
      )
    })
  }

  const showLoadingToast = () => {
    setIsLoading(true)
    setProgress(0)
    toast({
      title: 'Processing...',
      description: 'Your request is being processed.',
      duration: 4000
    })
  }

  return (
    <div className={cn('min-h-screen bg-gradient-mesh p-6 space-y-8', className)}>
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-600 text-sm font-medium">
          <Sparkles className="h-4 w-4" />
          Enhanced UI System
        </div>
        <h1 className="text-4xl font-bold gradient-text">
          Modern UI Components
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience the next generation of beautiful, accessible, and performant UI components with glassmorphism effects, micro-interactions, and dynamic theming.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Theme Customization */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Dynamic Theming
          </h2>
          <ThemeCustomizer />
        </div>

        {/* Button Showcase */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Wand2 className="h-6 w-6" />
            Enhanced Buttons
          </h2>
          
          <GlassCard variant="light">
            <div className="space-y-4">
              <h3 className="font-medium">Button Variants</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="primary" size="sm" className="w-full">
                  <Star className="h-4 w-4" />
                  Primary
                </Button>
                <Button variant="accent" size="sm" className="w-full">
                  <Heart className="h-4 w-4" />
                  Accent
                </Button>
                <Button variant="glow" size="sm" className="w-full">
                  <Zap className="h-4 w-4" />
                  Glow
                </Button>
                <Button variant="glass" size="sm" className="w-full">
                  <Gem className="h-4 w-4" />
                  Glass
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Animation Styles</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" animation="bounce">
                    <Crown className="h-4 w-4" />
                    Bounce
                  </Button>
                  <Button variant="outline" size="sm" animation="float">
                    <Rocket className="h-4 w-4" />
                    Float
                  </Button>
                </div>
              </div>

              <Button 
                variant="gradient" 
                size="lg" 
                className="w-full" 
                shimmer
                onClick={showLoadingToast}
                isLoading={isLoading}
                loadingText="Processing..."
              >
                <Rainbow className="h-5 w-5" />
                Interactive Demo
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Glass Components */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Gem className="h-6 w-6" />
            Glassmorphism
          </h2>
          
          <div className="space-y-4">
            <Glass variant="light" className="p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">Light Glass Surface</span>
              </div>
            </Glass>
            
            <Glass variant="heavy" className="p-4 rounded-xl" shimmer>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">Heavy Glass with Shimmer</span>
              </div>
            </Glass>
            
            <Glass variant="frosted" className="p-4 rounded-xl" gradient>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-purple-500" />
                <span className="text-sm font-medium">Frosted Glass with Gradient</span>
              </div>
            </Glass>

            <div className="flex gap-2">
              <GlassButton variant="primary" size="sm">
                <Flame className="h-4 w-4" />
                Glass Button
              </GlassButton>
              <GlassButton variant="secondary" size="sm" shimmer>
                <Award className="h-4 w-4" />
                With Shimmer
              </GlassButton>
            </div>
          </div>
        </div>
      </div>

      {/* Loading States */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Enhanced Loading States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Skeleton Animations</h3>
            <SkeletonCard />
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Chat Message Loading</h3>
            <SkeletonChatMessage />
            <SkeletonChatMessage isUser />
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Code Block Loading</h3>
            <SkeletonCodeBlock />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium">Chart Loading</h3>
            <SkeletonChart type="bar" />
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Different Animations</h3>
            <div className="space-y-2">
              <Skeleton animation="shimmer" className="h-4 w-full" />
              <Skeleton animation="wave" className="h-4 w-3/4" />
              <Skeleton animation="pulse" className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton animation="shimmer" speed="fast" className="h-8 w-8 rounded-full" />
                <Skeleton animation="wave" speed="normal" className="h-8 w-8 rounded-full" />
                <Skeleton animation="pulse" speed="slow" className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Demonstrations */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Enhanced Notifications</h2>
        <GlassCard variant="medium">
          <div className="space-y-4">
            <h3 className="font-medium">Toast Variants</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" size="sm" onClick={() => showToastDemo('success')}>
                Success
              </Button>
              <Button variant="outline" size="sm" onClick={() => showToastDemo('warning')}>
                Warning
              </Button>
              <Button variant="outline" size="sm" onClick={() => showToastDemo('destructive')}>
                Error
              </Button>
              <Button variant="outline" size="sm" onClick={() => showToastDemo('info')}>
                Info
              </Button>
              <Button variant="outline" size="sm" onClick={() => showToastDemo('glass')}>
                Glass
              </Button>
              <Button variant="outline" size="sm" onClick={() => showToastDemo('accent')}>
                Accent
              </Button>
              <Button variant="outline" size="sm" onClick={showUndoToast}>
                Undo Toast
              </Button>
              <Button variant="outline" size="sm" onClick={showLoadingToast}>
                Loading
              </Button>
            </div>
            
            {isLoading && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Progress Demo</div>
                <ToastProgress value={progress} variant="info" />
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Interactive Elements */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Micro-Interactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard variant="light" className="hover-lift">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-gradient-accent mx-auto flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-medium">Hover Lift</h3>
              <p className="text-sm text-muted-foreground">
                Subtle elevation on hover with smooth transitions
              </p>
            </div>
          </GlassCard>
          
          <GlassCard variant="medium" className="hover-scale">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-gradient-primary mx-auto flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-medium">Hover Scale</h3>
              <p className="text-sm text-muted-foreground">
                Gentle scaling effect with spring animation
              </p>
            </div>
          </GlassCard>
          
          <GlassCard variant="heavy" className="interactive-lift">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-gradient-secondary mx-auto flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-medium">Interactive Lift</h3>
              <p className="text-sm text-muted-foreground">
                Enhanced hover with dynamic shadows
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}