import React from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Skeleton, SkeletonCard } from '../components/ui/skeleton'
import { CommandPalette, useCommandPalette, CommandItem } from '../components/ui/command-palette'
import { ThemeCustomizer } from '../components/ui/theme-customizer'
import { ThemeInsights } from '../components/ui/theme-insights'
import { Search, Sparkles, Palette, Zap, Settings, Home, FileText, Users } from 'lucide-react'

export function UIShowcase() {
  const commandPalette = useCommandPalette()

  const commandItems: CommandItem[] = [
    {
      id: 'home',
      title: 'Go to Dashboard',
      description: 'Navigate to the main dashboard',
      icon: <Home className="h-4 w-4" />,
      shortcut: ['⌘', 'H'],
      action: () => console.log('Navigate to dashboard'),
      group: 'Navigation',
    },
    {
      id: 'docs',
      title: 'Open Documentation',
      description: 'View the documentation',
      icon: <FileText className="h-4 w-4" />,
      shortcut: ['⌘', 'D'],
      action: () => console.log('Open docs'),
      group: 'Navigation',
    },
    {
      id: 'settings',
      title: 'Open Settings',
      description: 'Configure your preferences',
      icon: <Settings className="h-4 w-4" />,
      shortcut: ['⌘', ','],
      action: () => console.log('Open settings'),
      group: 'Actions',
    },
    {
      id: 'users',
      title: 'Manage Users',
      description: 'Add or remove team members',
      icon: <Users className="h-4 w-4" />,
      action: () => console.log('Manage users'),
      group: 'Actions',
    },
  ]

  return (
    <div className="container mx-auto space-y-12 p-8">
      <div className="space-y-4 text-center">
        <h1 className="gradient-text text-4xl font-bold">UI Enhancement Showcase</h1>
        <p className="text-muted-foreground text-lg">
          Demonstrating the new design system, glassmorphism effects, and micro-interactions
        </p>
      </div>

      {/* Command Palette Demo */}
      <Card variant="glass" className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Command Palette
          </CardTitle>
          <CardDescription>
            Press ⌘K to open the command palette, or click the button below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={commandPalette.open} variant="outline">
            Open Command Palette
          </Button>
        </CardContent>
      </Card>

      {/* Button Variants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Enhanced Buttons
          </CardTitle>
          <CardDescription>
            Buttons with micro-interactions, hover effects, and new variants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="glass">Glass</Button>
            <Button variant="gradient">Gradient</Button>
            <Button variant="destructive">Destructive</Button>
            <Button isLoading loadingText="Loading...">
              Loading
            </Button>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium">Different Sizes:</p>
            <div className="flex items-center gap-4">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Variants */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Default Card</CardTitle>
            <CardDescription>Standard card with subtle shadows</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              This is the default card variant with clean borders and shadows.
            </p>
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader>
            <CardTitle>Glass Card</CardTitle>
            <CardDescription>Glassmorphism effect with backdrop blur</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Features translucent background and sophisticated blur effects.
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Elevated Card</CardTitle>
            <CardDescription>Enhanced shadows for depth</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Stronger shadow effects create a floating appearance.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Input Variants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Enhanced Inputs
          </CardTitle>
          <CardDescription>Floating labels, validation states, and glass effects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Input label="Standard Input" placeholder="Enter some text..." />
              <Input
                label="Input with Error"
                error="This field is required"
                placeholder="Invalid input"
              />
              <Input
                label="Success State"
                state="success"
                helperText="Looks good!"
                placeholder="Valid input"
              />
            </div>

            <div className="space-y-4">
              <Input variant="floating" label="Floating Label" placeholder="Floating Label" />
              <Input variant="glass" label="Glass Input" placeholder="Glassmorphism effect" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skeleton Components */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Loading Skeletons
          </CardTitle>
          <CardDescription>Animated loading states with shimmer effects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium">Basic Skeletons</h4>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton variant="text" lines={3} />
              <div className="flex items-center gap-3">
                <Skeleton variant="avatar" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-medium">Complex Layouts</h4>
              <SkeletonCard />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Tokens Display */}
      <Card>
        <CardHeader>
          <CardTitle>Design Token System</CardTitle>
          <CardDescription>Comprehensive token system for consistent styling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="mb-3 font-medium">Spacing Scale (8pt Grid)</h4>
            <div className="space-y-2">
              {[1, 2, 3, 4, 6, 8, 12, 16].map(space => (
                <div key={space} className="flex items-center gap-4">
                  <div className="text-muted-foreground w-16 text-sm">space-{space}</div>
                  <div className="bg-primary h-4 rounded" style={{ width: `${space * 4}px` }} />
                  <span className="text-muted-foreground text-xs">{space * 4}px</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-medium">Shadow Scale</h4>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {['sm', 'md', 'lg', 'xl'].map(shadow => (
                <div
                  key={shadow}
                  className={`bg-card rounded-lg border p-4 text-center shadow-${shadow}`}
                >
                  <span className="text-sm font-medium">shadow-{shadow}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Customizer */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ThemeCustomizer />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Dynamic Theming
            </CardTitle>
            <CardDescription>Advanced theming features introduced in Phase 6</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Features:</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• 8 Dynamic accent colors with localStorage persistence</li>
                <li>• Light, dark, and system theme modes</li>
                <li>• High-contrast theme for accessibility</li>
                <li>• Time-based adaptive theming (6 PM - 6 AM)</li>
                <li>• Reduced motion support</li>
                <li>• Real-time theme updates without reload</li>
              </ul>
            </div>

            <div className="bg-muted/50 rounded-lg border p-4">
              <p className="text-sm">
                <strong>Try it:</strong> Change the accent color or theme mode using the customizer.
                Your preferences are automatically saved and will persist across sessions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theme Analytics & Insights */}
      <ThemeInsights />

      <CommandPalette
        isOpen={commandPalette.isOpen}
        onClose={commandPalette.close}
        items={commandItems}
      />
    </div>
  )
}
