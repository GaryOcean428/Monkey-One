import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Switch } from './switch'
import { Label } from './label'
import { Separator } from './separator'
import { useTheme, AccentColor, ThemeMode } from '../../hooks/useTheme'
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
  Check
} from 'lucide-react'

const accentColors: { value: AccentColor; label: string; color: string }[] = [
  { value: 'blue', label: 'Blue', color: 'hsl(214, 95%, 53%)' },
  { value: 'emerald', label: 'Emerald', color: 'hsl(142, 76%, 36%)' },
  { value: 'violet', label: 'Violet', color: 'hsl(262, 83%, 58%)' },
  { value: 'rose', label: 'Rose', color: 'hsl(330, 81%, 60%)' },
  { value: 'amber', label: 'Amber', color: 'hsl(38, 92%, 50%)' },
  { value: 'cyan', label: 'Cyan', color: 'hsl(199, 89%, 48%)' },
  { value: 'pink', label: 'Pink', color: 'hsl(324, 71%, 54%)' },
  { value: 'indigo', label: 'Indigo', color: 'hsl(231, 48%, 48%)' }
]

const themeModes: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> }
]

export interface ThemeCustomizerProps {
  className?: string
}

export function ThemeCustomizer({ className }: ThemeCustomizerProps) {
  const {
    preferences,
    isLoaded,
    setAccentColor,
    setThemeMode,
    setContrastMode,
    toggleTimeBasedTheme,
    toggleReducedMotion,
    resetToDefaults
  } = useTheme()

  if (!isLoaded) {
    return (
      <Card className={cn('w-full max-w-md', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Customizer
          </CardTitle>
          <CardDescription>Loading theme preferences...</CardDescription>
        </CardHeader>
      </Card>
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
          <Label className="text-sm font-medium">Accent Color</Label>
          <div className="grid grid-cols-4 gap-2">
            {accentColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setAccentColor(color.value)}
                className={cn(
                  'relative h-12 w-full rounded-lg border-2 transition-all hover:scale-105',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  preferences.accentColor === color.value
                    ? 'border-primary shadow-md'
                    : 'border-border hover:border-muted-foreground'
                )}
                style={{ backgroundColor: color.color }}
                title={color.label}
              >
                {preferences.accentColor === color.value && (
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
            {themeModes.map((mode) => (
              <Button
                key={mode.value}
                variant={preferences.mode === mode.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setThemeMode(mode.value)}
                className="flex items-center gap-2"
              >
                {mode.icon}
                {mode.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Contrast Mode */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Contrast</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={preferences.contrast === 'normal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setContrastMode('normal')}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Normal
            </Button>
            <Button
              variant={preferences.contrast === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setContrastMode('high')}
              className="flex items-center gap-2"
            >
              <Accessibility className="h-4 w-4" />
              High
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
                <Label htmlFor="time-based" className="text-sm">Time-based Theme</Label>
                <p className="text-xs text-muted-foreground">
                  Auto dark mode from 6 PM to 6 AM
                </p>
              </div>
            </div>
            <Switch
              id="time-based"
              checked={preferences.timeBasedTheme}
              onCheckedChange={toggleTimeBasedTheme}
            />
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Accessibility className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="reduced-motion" className="text-sm">Reduce Motion</Label>
                <p className="text-xs text-muted-foreground">
                  Minimize animations and transitions
                </p>
              </div>
            </div>
            <Switch
              id="reduced-motion"
              checked={preferences.reducedMotion}
              onCheckedChange={toggleReducedMotion}
            />
          </div>
        </div>

        <Separator />

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={resetToDefaults}
          className="w-full flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </CardContent>
    </Card>
  )
}

// Compact version for dropdowns/popovers
export function ThemeCustomizerCompact({ className }: ThemeCustomizerProps) {
  const {
    preferences,
    isLoaded,
    setAccentColor,
    setThemeMode
  } = useTheme()

  if (!isLoaded) return null

  return (
    <div className={cn('p-4 space-y-4', className)}>
      {/* Accent Colors */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Accent</Label>
        <div className="grid grid-cols-4 gap-1">
          {accentColors.slice(0, 4).map((color) => (
            <button
              key={color.value}
              onClick={() => setAccentColor(color.value)}
              className={cn(
                'h-6 w-6 rounded-full border transition-all',
                preferences.accentColor === color.value
                  ? 'border-primary scale-110'
                  : 'border-border hover:scale-105'
              )}
              style={{ backgroundColor: color.color }}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* Theme Mode */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Theme</Label>
        <div className="flex gap-1">
          {themeModes.map((mode) => (
            <Button
              key={mode.value}
              variant={preferences.mode === mode.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setThemeMode(mode.value)}
              className="h-6 w-6 p-0"
            >
              {mode.icon}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}