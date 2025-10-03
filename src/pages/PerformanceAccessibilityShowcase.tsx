import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import {
  ContentVisibility,
  VirtualizedList,
  LazyImage,
  BelowFold,
  PerformanceDashboard,
  AnimatedElement,
  StaggerContainer,
  ScrollReveal,
  CountUp,
  Parallax,
  SkipLink,
  FocusIndicator,
  AccessibleModal,
  AccessibleField,
  AccessibleList,
  AccessibleTabs,
  LiveRegion,
} from '../components/performance-accessibility'
import { cn } from '../lib/utils'
import {
  Zap,
  Eye,
  Gauge,
  Accessibility,
  MousePointer,
  Keyboard,
  MonitorSpeaker,
  Activity,
  Timer,
  Layers,
  Image,
  List,
  Layout,
} from 'lucide-react'

export default function PerformanceAccessibilityShowcase() {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null)

  // Demo data for virtualized list
  const listItems = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Item ${i + 1}`,
    description: `This is the description for item ${i + 1}`,
  }))

  const demoTabs = [
    {
      id: 'performance',
      label: 'Performance',
      content: <PerformanceSection />,
    },
    {
      id: 'accessibility',
      label: 'Accessibility',
      content: <AccessibilitySection />,
    },
    {
      id: 'animations',
      label: 'Animations',
      content: <AnimationsSection />,
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      content: <MonitoringSection />,
    },
  ]

  return (
    <div className="bg-background min-h-screen">
      {/* Skip Links for Accessibility */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#navigation">Skip to navigation</SkipLink>

      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold">
                <Zap className="text-primary h-8 w-8" />
                Phase 7: Performance & Accessibility
              </h1>
              <p className="text-muted-foreground mt-2">
                Advanced optimizations and enhanced user experience
              </p>
            </div>
            <Badge variant="secondary" className="px-4 py-2 text-lg">
              Phase 7 Complete
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-4 py-8">
        {/* Performance Overview */}
        <ScrollReveal>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Performance Overview
              </CardTitle>
              <CardDescription>
                Real-time performance monitoring and Core Web Vitals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceDashboard />
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Features Showcase */}
        <div className="grid gap-8">
          {/* Content Visibility Demo */}
          <AnimatedElement animation="slideUp" delay={0.1}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Content Visibility Optimization
                </CardTitle>
                <CardDescription>
                  CSS content-visibility for improved rendering performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-3 font-medium">Standard Rendering</h4>
                    <div className="space-y-4">
                      {Array.from({ length: 10 }, (_, i) => (
                        <Card key={i} className="p-4">
                          <h5 className="font-medium">Card {i + 1}</h5>
                          <p className="text-muted-foreground text-sm">
                            This content is always rendered regardless of visibility.
                          </p>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-medium">Optimized with Content Visibility</h4>
                    <div className="space-y-4">
                      {Array.from({ length: 10 }, (_, i) => (
                        <ContentVisibility
                          key={i}
                          height="80px"
                          useContentVisibility={true}
                          lazy={i > 3} // Lazy load items after the first 4
                        >
                          <Card className="p-4">
                            <h5 className="font-medium">Optimized Card {i + 1}</h5>
                            <p className="text-muted-foreground text-sm">
                              This content uses content-visibility for better performance.
                            </p>
                          </Card>
                        </ContentVisibility>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>

          {/* Virtualized List Demo */}
          <AnimatedElement animation="slideUp" delay={0.2}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Virtualized List Performance
                </CardTitle>
                <CardDescription>Efficient rendering for large datasets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-3 font-medium">1,000 Items - Virtualized</h4>
                    <VirtualizedList
                      items={listItems}
                      itemHeight={60}
                      containerHeight={300}
                      renderItem={(item, index, isSelected) => (
                        <div
                          className={cn(
                            'flex items-center justify-between border-b p-3',
                            isSelected && 'bg-primary/10'
                          )}
                        >
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-muted-foreground text-sm">{item.description}</div>
                          </div>
                          <Badge variant="outline">#{index + 1}</Badge>
                        </div>
                      )}
                      className="rounded-lg border"
                    />
                  </div>

                  <div>
                    <h4 className="mb-3 font-medium">Performance Benefits</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Timer className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Only renders visible items</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Smooth scrolling performance</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Layers className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Minimal DOM nodes</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Reduced memory usage</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>

          {/* Accessibility Features */}
          <AnimatedElement animation="slideUp" delay={0.3}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Accessibility className="h-5 w-5" />
                  Accessibility Enhancements
                </CardTitle>
                <CardDescription>
                  Enhanced focus management, ARIA support, and keyboard navigation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccessibilityDemo
                  onOpenModal={() => setIsModalOpen(true)}
                  selectedItem={selectedItem}
                  onSelectItem={setSelectedItem}
                />
              </CardContent>
            </Card>
          </AnimatedElement>

          {/* Intersection Observer Animations */}
          <AnimatedElement animation="slideUp" delay={0.4}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MousePointer className="h-5 w-5" />
                  Viewport-based Animations
                </CardTitle>
                <CardDescription>
                  Animations triggered only when elements enter the viewport
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnimationsDemo />
              </CardContent>
            </Card>
          </AnimatedElement>

          {/* Lazy Loading Images */}
          <AnimatedElement animation="slideUp" delay={0.5}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Lazy Loading & Performance
                </CardTitle>
                <CardDescription>Images and content loaded only when needed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <LazyImage
                      key={i}
                      src={`https://picsum.photos/300/200?random=${i}`}
                      alt={`Demo image ${i + 1}`}
                      className="rounded-lg"
                      placeholder={
                        <div className="bg-muted flex h-full items-center justify-center">
                          <Image className="text-muted-foreground h-8 w-8" />
                        </div>
                      }
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedElement>
        </div>

        {/* Below-the-fold content */}
        <BelowFold minHeight="400px">
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Below-the-fold Content</CardTitle>
              <CardDescription>
                This content is optimized with content-visibility and lazy loading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section demonstrates below-the-fold optimization. The content is only rendered
                when it comes into view, improving initial page load performance.
              </p>
            </CardContent>
          </Card>
        </BelowFold>
      </main>

      {/* Accessible Modal */}
      <AccessibleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Accessible Modal Example"
        description="This modal demonstrates proper focus management and keyboard navigation."
      >
        <div className="space-y-4">
          <AccessibleField
            label="Your Name"
            fieldName="name"
            required
            helpText="Enter your full name"
          >
            <Input placeholder="John Doe" />
          </AccessibleField>

          <AccessibleField
            label="Email Address"
            fieldName="email"
            required
            helpText="We'll never share your email"
          >
            <Input type="email" placeholder="john@example.com" />
          </AccessibleField>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Submit</Button>
          </div>
        </div>
      </AccessibleModal>

      {/* Live Region for Screen Reader Announcements */}
      <LiveRegion priority="polite">{selectedItem && `Selected: ${selectedItem}`}</LiveRegion>
    </div>
  )
}

function PerformanceSection() {
  return (
    <div className="space-y-6">
      <PerformanceDashboard compact={false} />
    </div>
  )
}

function AccessibilitySection() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Use Tab, Shift+Tab, Enter, and arrow keys to navigate.
            </p>
            <div className="space-y-2">
              <FocusIndicator>
                <Button variant="outline" className="w-full">
                  Focusable Button 1
                </Button>
              </FocusIndicator>
              <FocusIndicator>
                <Button variant="outline" className="w-full">
                  Focusable Button 2
                </Button>
              </FocusIndicator>
              <FocusIndicator>
                <Input placeholder="Focusable input" />
              </FocusIndicator>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MonitorSpeaker className="h-5 w-5" />
              Screen Reader Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              Proper ARIA labels and semantic markup for screen readers.
            </p>
            <div className="space-y-3">
              <div role="status" aria-live="polite">
                Status: Content loaded successfully
              </div>
              <Button aria-describedby="button-help" className="w-full">
                Submit Form
              </Button>
              <p id="button-help" className="text-muted-foreground text-xs">
                This will submit your form data to the server
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AnimationsSection() {
  return (
    <div className="space-y-6">
      <AnimationsDemo />
    </div>
  )
}

function MonitoringSection() {
  return (
    <div className="space-y-6">
      <PerformanceDashboard showRealtime={true} />
    </div>
  )
}

function AccessibilityDemo({
  onOpenModal,
  selectedItem,
  onSelectItem,
}: {
  onOpenModal: () => void
  selectedItem: string | null
  onSelectItem: (item: string | null) => void
}) {
  const listItems = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h4 className="mb-3 font-medium">Focus Management</h4>
        <div className="space-y-3">
          <Button onClick={onOpenModal}>Open Accessible Modal</Button>
          <p className="text-muted-foreground text-sm">
            The modal will trap focus and restore it when closed.
          </p>
        </div>
      </div>

      <div>
        <h4 className="mb-3 font-medium">Keyboard Navigation</h4>
        <AccessibleList
          items={listItems}
          renderItem={(item, index, isSelected) => (
            <div className="flex items-center justify-between">
              <span>{item}</span>
              {isSelected && <Badge>Selected</Badge>}
            </div>
          )}
          onSelect={item => onSelectItem(item)}
          selectedIndex={listItems.findIndex(item => item === selectedItem)}
          ariaLabel="Fruit selection list"
          className="max-h-48 overflow-auto rounded-lg border p-2"
        />
        <p className="text-muted-foreground mt-2 text-sm">
          Use arrow keys and Enter to navigate and select.
        </p>
      </div>
    </div>
  )
}

function AnimationsDemo() {
  return (
    <div className="space-y-8">
      {/* Stagger Animation */}
      <div>
        <h4 className="mb-4 font-medium">Staggered Animations</h4>
        <StaggerContainer staggerDelay={0.1}>
          {Array.from({ length: 5 }, (_, i) => (
            <Card key={i} className="mb-3 p-4">
              <h5 className="font-medium">Staggered Item {i + 1}</h5>
              <p className="text-muted-foreground text-sm">
                This item animates with a {i * 100}ms delay
              </p>
            </Card>
          ))}
        </StaggerContainer>
      </div>

      {/* Count Up Animation */}
      <div>
        <h4 className="mb-4 font-medium">Count Up Animations</h4>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="p-4 text-center">
            <CountUp end={1000} duration={2} className="text-2xl font-bold" />
            <p className="text-muted-foreground mt-1 text-sm">Users</p>
          </Card>
          <Card className="p-4 text-center">
            <CountUp end={95} suffix="%" duration={2.5} className="text-2xl font-bold" />
            <p className="text-muted-foreground mt-1 text-sm">Performance</p>
          </Card>
          <Card className="p-4 text-center">
            <CountUp end={50} prefix="$" decimals={2} duration={3} className="text-2xl font-bold" />
            <p className="text-muted-foreground mt-1 text-sm">Revenue</p>
          </Card>
          <Card className="p-4 text-center">
            <CountUp end={24} suffix="/7" duration={1.5} className="text-2xl font-bold" />
            <p className="text-muted-foreground mt-1 text-sm">Support</p>
          </Card>
        </div>
      </div>

      {/* Scroll Reveal */}
      <div>
        <h4 className="mb-4 font-medium">Scroll Reveal Animations</h4>
        <div className="space-y-6">
          {['up', 'down', 'left', 'right'].map((direction, i) => (
            <ScrollReveal key={direction} direction={direction as any} delay={i * 0.1}>
              <Card className="p-6">
                <h5 className="font-medium">Reveal from {direction}</h5>
                <p className="text-muted-foreground text-sm">
                  This content reveals from the {direction} when scrolled into view.
                </p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Parallax Effect */}
      <div>
        <h4 className="mb-4 font-medium">Parallax Effect</h4>
        <div className="relative h-64 overflow-hidden rounded-lg bg-gradient-to-r from-purple-400 to-pink-400">
          <Parallax speed={0.5} className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="mb-2 text-2xl font-bold">Parallax Content</h3>
              <p className="text-white/80">This moves slower than the scroll</p>
            </div>
          </Parallax>
        </div>
      </div>
    </div>
  )
}
