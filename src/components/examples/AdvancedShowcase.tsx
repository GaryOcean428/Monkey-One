import * as React from 'react'
import { Button } from '../ui/button'
import { Glass, GlassCard } from '../ui/glass'
import { ThemeCustomizer } from '../ui/theme-customizer'
import { AnimatedElement, StaggeredContainer, FadeIn, SlideIn } from '../ui/animated'
import {
  AccessibilityProvider,
  SkipLink,
  Landmark,
  Announcement,
  useAccessibility,
} from '../accessibility/AccessibilityProvider'
import { useTimeBasedPreference, usePrefersReducedMotion } from '../../lib/performance'
import { useTheme } from '../../lib/theme/use-theme'
import { cn } from '../../lib/utils'
import {
  Sparkles,
  Palette,
  Zap,
  Star,
  Heart,
  Gem,
  Crown,
  Rocket,
  Rainbow,
  Moon,
  Sun,
  Clock,
  Accessibility,
  Performance,
  Shield,
  Layers,
  Wand2,
} from 'lucide-react'

function ShowcaseContent() {
  const { announceMessage } = useAccessibility()
  const timeOfDay = useTimeBasedPreference()
  const prefersReducedMotion = usePrefersReducedMotion()
  const { accent, timeBasedTheme, setTimeBasedTheme } = useTheme()
  const [activeDemo, setActiveDemo] = React.useState<string | null>(null)

  const timeOfDayConfig = {
    morning: { icon: Sun, color: 'text-orange-500', message: 'Good morning! ☀️' },
    day: { icon: Sun, color: 'text-yellow-500', message: 'Good day! 🌞' },
    evening: { icon: Moon, color: 'text-purple-500', message: 'Good evening! 🌅' },
    night: { icon: Moon, color: 'text-blue-500', message: 'Good night! 🌙' },
  }

  const currentTimeConfig = timeOfDayConfig[timeOfDay]

  const handleDemoActivation = (demoName: string) => {
    setActiveDemo(demoName)
    announceMessage(`${demoName} demo activated`)
  }

  const features = [
    {
      icon: Palette,
      title: 'Dynamic Theming',
      description: 'Real-time accent color changes with time-based adjustments',
      color: 'text-purple-500',
    },
    {
      icon: Zap,
      title: 'Performance Optimized',
      description: 'Respects reduced motion preferences and uses efficient animations',
      color: 'text-yellow-500',
    },
    {
      icon: Accessibility,
      title: 'Fully Accessible',
      description: 'Screen reader support, focus management, and keyboard navigation',
      color: 'text-green-500',
    },
    {
      icon: Layers,
      title: 'Glassmorphism',
      description: 'Beautiful glass effects with backdrop blur and transparency',
      color: 'text-blue-500',
    },
    {
      icon: Performance,
      title: 'Micro-interactions',
      description: 'Subtle animations that enhance user experience',
      color: 'text-pink-500',
    },
    {
      icon: Shield,
      title: 'Production Ready',
      description: 'Type-safe, tested, and optimized for real-world applications',
      color: 'text-indigo-500',
    },
  ]

  return (
    <div className="bg-gradient-mesh min-h-screen">
      <SkipLink href="#main-content">Skip to main content</SkipLink>

      <Landmark as="header" label="Page header" className="p-6">
        <FadeIn className="space-y-4 text-center">
          <div className="bg-accent-500/10 border-accent-500/20 text-accent-600 inline-flex items-center gap-2 rounded-full border px-4 py-2">
            <Sparkles className="h-4 w-4" />
            Advanced UI System
          </div>
          <h1 className="gradient-text text-5xl font-bold">Production-Ready Components</h1>
          <p className="text-muted-foreground mx-auto max-w-3xl text-xl">
            A comprehensive UI system with glassmorphism, dynamic theming, accessibility features,
            and performance optimizations - all built with modern web standards.
          </p>
        </FadeIn>
      </Landmark>

      <Landmark as="main" label="Main content" id="main-content" className="space-y-12 p-6">
        {/* Time-based Theme Demo */}
        <SlideIn direction="up" className="mx-auto max-w-4xl">
          <GlassCard variant="medium" className="space-y-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <currentTimeConfig.icon className={cn('h-8 w-8', currentTimeConfig.color)} />
              <h2 className="text-2xl font-semibold">Time-Based Theming</h2>
              <Clock className="text-muted-foreground h-6 w-6" />
            </div>

            <p className="text-muted-foreground text-lg">
              {currentTimeConfig.message} The accent colors automatically adjust based on the time
              of day.
            </p>

            <div className="flex items-center justify-center gap-4">
              <span className="text-sm">Current time preference:</span>
              <span className="font-medium capitalize">{timeOfDay}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTimeBasedTheme(!timeBasedTheme)
                  announceMessage(`Time-based theming ${!timeBasedTheme ? 'enabled' : 'disabled'}`)
                }}
              >
                {timeBasedTheme ? 'Disable' : 'Enable'} Time Sync
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Object.entries(timeOfDayConfig).map(([time, config]) => (
                <div
                  key={time}
                  className={cn(
                    'rounded-lg border p-3 transition-all',
                    time === timeOfDay
                      ? 'border-accent-500/50 bg-accent-500/10'
                      : 'border-border bg-muted/50'
                  )}
                >
                  <config.icon className={cn('mx-auto mb-1 h-5 w-5', config.color)} />
                  <div className="text-xs font-medium capitalize">{time}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </SlideIn>

        {/* Feature Grid */}
        <div className="mx-auto max-w-6xl">
          <FadeIn className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold">Advanced Features</h2>
            <p className="text-muted-foreground">
              Built with performance, accessibility, and user experience in mind
            </p>
          </FadeIn>

          <StaggeredContainer
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            staggerDelay={150}
          >
            {features.map((feature, index) => (
              <GlassCard
                key={feature.title}
                variant="light"
                className="hover-lift cursor-pointer space-y-4 text-center"
                onClick={() => handleDemoActivation(feature.title)}
              >
                <div
                  className={cn(
                    'mx-auto flex h-12 w-12 items-center justify-center rounded-full',
                    'bg-gradient-to-br from-white/10 to-white/5'
                  )}
                >
                  <feature.icon className={cn('h-6 w-6', feature.color)} />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
                {activeDemo === feature.title && (
                  <div className="text-accent-600 text-xs font-medium">✨ Demo Active</div>
                )}
              </GlassCard>
            ))}
          </StaggeredContainer>
        </div>

        {/* Accessibility Demo */}
        <SlideIn direction="right" className="mx-auto max-w-4xl">
          <GlassCard variant="heavy">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Accessibility className="h-6 w-6 text-green-500" />
                <h2 className="text-2xl font-semibold">Accessibility Features</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Motion Preferences</h3>
                  <div
                    className={cn(
                      'rounded-lg border p-4',
                      prefersReducedMotion
                        ? 'border-green-500/50 bg-green-500/10'
                        : 'border-blue-500/50 bg-blue-500/10'
                    )}
                  >
                    <div className="flex items-center gap-2 text-sm">
                      {prefersReducedMotion ? (
                        <>
                          <Shield className="h-4 w-4 text-green-500" />
                          <span>Reduced motion enabled</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 text-blue-500" />
                          <span>Full animations enabled</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Screen Reader Support</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      announceMessage('This is a test announcement for screen readers')
                    }
                  >
                    Test Announcement
                  </Button>
                </div>
              </div>

              <div className="border-border bg-muted/20 rounded-lg border p-4">
                <h4 className="mb-2 font-medium">Current Accessibility Status</h4>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>✅ Keyboard navigation supported</li>
                  <li>✅ Focus management implemented</li>
                  <li>✅ ARIA labels and descriptions</li>
                  <li>✅ Screen reader announcements</li>
                  <li>✅ High contrast theme support</li>
                  <li>✅ Reduced motion preferences respected</li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </SlideIn>

        {/* Performance Demo */}
        <SlideIn direction="left" className="mx-auto max-w-4xl">
          <GlassCard variant="frosted">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Performance className="h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-semibold">Performance Optimizations</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="font-medium">Lazy Loading</h3>
                  <p className="text-muted-foreground text-sm">
                    Animations only trigger when elements enter the viewport
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">GPU Acceleration</h3>
                  <p className="text-muted-foreground text-sm">
                    Hardware acceleration for smooth 60fps animations
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Memory Efficient</h3>
                  <p className="text-muted-foreground text-sm">
                    Cleanup listeners and cancel animations on unmount
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Bundle Optimized</h3>
                  <p className="text-muted-foreground text-sm">
                    Tree-shakeable components and minimal runtime overhead
                  </p>
                </div>
              </div>

              <div className="bg-accent-500/10 border-accent-500/20 flex items-center gap-4 rounded-lg border p-4">
                <Gem className="text-accent-600 h-5 w-5" />
                <div className="text-sm">
                  <div className="text-accent-600 font-medium">Production Ready</div>
                  <div className="text-muted-foreground">
                    CSS bundle: ~16.5KB gzipped, TypeScript types included
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </SlideIn>

        {/* Theme Customizer */}
        <div className="mx-auto max-w-2xl">
          <FadeIn>
            <ThemeCustomizer />
          </FadeIn>
        </div>

        {/* Final CTA */}
        <FadeIn className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="text-3xl font-bold">Ready to Build Something Amazing?</h2>
          <p className="text-muted-foreground text-lg">
            This enhanced UI system is ready for production use with comprehensive theming,
            accessibility features, and performance optimizations.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="glow"
              onClick={() => announceMessage('Thank you for exploring our UI system!')}
            >
              <Rocket className="h-5 w-5" />
              Get Started
            </Button>
            <Button size="lg" variant="glass" onClick={() => handleDemoActivation('Documentation')}>
              <Wand2 className="h-5 w-5" />
              View Documentation
            </Button>
          </div>
        </FadeIn>

        {/* Announcement for active demos */}
        {activeDemo && (
          <Announcement priority="polite">
            {activeDemo} demo is now active. Explore the enhanced features and interactions.
          </Announcement>
        )}
      </Landmark>
    </div>
  )
}

export function AdvancedShowcase() {
  return (
    <AccessibilityProvider>
      <ShowcaseContent />
    </AccessibilityProvider>
  )
}
