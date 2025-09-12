import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Switch } from './switch'
import { Label } from './label'
import { Separator } from './separator'
import { useTheme } from '../../lib/theme/use-theme'
import { accentPresets } from '../../lib/theme/tokens'
import { cn } from '../../lib/utils'
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Clock, 
  Eye, 
  Accessibility,
  RotateCcw,
  Check,
  Sparkles
} from 'lucide-react'

const accentColors = [
  { key: 'blue', label: 'Blue', color: 'hsl(220, 70%, 50%)' },
  { key: 'purple', label: 'Purple', color: 'hsl(260, 70%, 50%)' },
  { key: 'emerald', label: 'Emerald', color: 'hsl(150, 65%, 45%)' },
  { key: 'orange', label: 'Orange', color: 'hsl(25, 80%, 55%)' },
  { key: 'pink', label: 'Pink', color: 'hsl(320, 70%, 60%)' },
  { key: 'teal', label: 'Teal', color: 'hsl(180, 70%, 45%)' },
  { key: 'indigo', label: 'Indigo', color: 'hsl(240, 75%, 55%)' },
  { key: 'rose', label: 'Rose', color: 'hsl(350, 75%, 60%)' }
] as const

export interface ThemeCustomizerProps {
  className?: string
  compact?: boolean
}

export function ThemeCustomizer({ className, compact = false }: ThemeCustomizerProps) {
  const {
    theme,
    setTheme,
    accent,
    setAccent,
    timeBasedTheme,
    setTimeBasedTheme,
    isDark,
    accentPresets: presets
  } = useTheme()

  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className={cn('w-full', compact ? 'max-w-xs' : 'max-w-md', className)}>
        <CardHeader className={compact ? 'pb-3' : undefined}>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme
          </CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className={cn('p-4 space-y-3', className)}>
        {/* Accent Colors */}
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Accent
          </Label>
          <div className="grid grid-cols-4 gap-1">
            {accentColors.slice(0, 4).map((color) => (
              <button
                key={color.key}
                onClick={() => setAccent(color.key as keyof typeof presets)}
                className={cn(
                  'h-6 w-6 rounded-full border transition-all hover:scale-105',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  accent.hue === presets[color.key as keyof typeof presets].hue
                    ? 'border-foreground scale-110 shadow-md'
                    : 'border-border/50'
                )}
                style={{ backgroundColor: color.color }}
                title={color.label}
              >
                {accent.hue === presets[color.key as keyof typeof presets].hue && (
                  <Check className="h-3 w-3 text-white drop-shadow-lg mx-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Mode */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Theme</Label>
          <div className="flex gap-1">
            <Button
              variant={theme === 'light' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTheme('light')}
              className="h-6 w-6 p-0"
              title="Light mode"
            >
              <Sun className="h-3 w-3" />
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="h-6 w-6 p-0"
              title="Dark mode"
            >
              <Moon className="h-3 w-3" />
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTheme('system')}
              className="h-6 w-6 p-0"
              title="System theme"
            >
              <Monitor className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Customizer
        </CardTitle>
        <CardDescription>
          Personalize your experience with dynamic themes and accent colors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Accent Color Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            Accent Color
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {accentColors.map((color) => (
              <button
                key={color.key}
                onClick={() => setAccent(color.key as keyof typeof presets)}
                className={cn(
                  'relative h-12 w-full rounded-lg border-2 transition-all hover:scale-105 active:scale-95',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  accent.hue === presets[color.key as keyof typeof presets].hue
                    ? 'border-foreground shadow-lg'
                    : 'border-border hover:border-muted-foreground'
                )}
                style={{ backgroundColor: color.color }}
                title={color.label}
              >
                {accent.hue === presets[color.key as keyof typeof presets].hue && (
                  <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-lg" />
                )}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Theme Mode */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Theme Mode</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
              className="flex items-center gap-2"
            >
              <Monitor className="h-4 w-4" />
              System
            </Button>
          </div>
        </div>

        <Separator />

        {/* Advanced Options */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Advanced Options</Label>
          
          {/* Time-based Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="time-based" className="text-sm">Time-based Accent</Label>
                <p className="text-xs text-muted-foreground">
                  Warmer colors in morning, cooler at night
                </p>
              </div>
            </div>
            <Switch
              id="time-based"
              checked={timeBasedTheme}
              onCheckedChange={setTimeBasedTheme}
            />
          </div>
        </div>

        <Separator />

        {/* Current Accent Info */}
        <div className="p-3 bg-muted/50 rounded-lg space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Current Accent</div>
          <div className="flex items-center gap-2">
            <div 
              className="h-4 w-4 rounded-full border border-border"
              style={{ backgroundColor: `hsl(${accent.hue}, ${accent.saturation}%, ${accent.lightness}%)` }}
            />
            <div className="text-sm">
              HSL({accent.hue}, {accent.saturation}%, {accent.lightness}%)
            </div>
          </div>
          {timeBasedTheme && (
            <div className="text-xs text-muted-foreground">
              Time-based adjustments are active
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}