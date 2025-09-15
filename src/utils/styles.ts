import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Centralized utility for className management
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Common layout patterns to reduce repetition
export const layoutClasses = {
  // Flexbox patterns
  flexCenter: 'flex items-center justify-center',
  flexCenterBetween: 'flex items-center justify-between',
  flexCol: 'flex flex-col',
  flexColCenter: 'flex flex-col items-center',
  flexColCenterBetween: 'flex flex-col items-center justify-between',
  flexWrap: 'flex flex-wrap',
  
  // Spacing patterns
  spaceY2: 'space-y-2',
  spaceY4: 'space-y-4',
  spaceY6: 'space-y-6',
  spaceX2: 'space-x-2',
  spaceX4: 'space-x-4',
  
  // Padding patterns
  p4: 'p-4',
  p6: 'p-6',
  px4: 'px-4',
  py2: 'py-2',
  py4: 'py-4',
  
  // Common button styles
  btnPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors',
  btnSecondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-md transition-colors',
  btnDanger: 'bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors',
  
  // Common input styles
  inputBase: 'border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500',
  
  // Card patterns
  card: 'bg-white rounded-lg shadow-sm border',
  cardPadded: 'bg-white rounded-lg shadow-sm border p-6',
  
  // Navigation patterns
  navItem: 'flex items-center px-4 py-2 text-sm font-medium rounded-md',
  navItemActive: 'bg-gray-100 text-gray-900',
  navItemInactive: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
  
  // Common text patterns
  textSm: 'text-sm text-gray-600',
  textBase: 'text-base text-gray-900',
  textLg: 'text-lg font-medium text-gray-900',
  textXl: 'text-xl font-semibold text-gray-900',
  
  // Full height patterns
  fullHeight: 'h-full',
  fullScreen: 'h-screen',
  fullWidth: 'w-full',
  
  // Overflow patterns
  overflowHidden: 'overflow-hidden',
  overflowYAuto: 'overflow-y-auto',
  overflowXAuto: 'overflow-x-auto',
}

// Theme-aware classes for dark mode support
export const themeClasses = {
  // Background patterns
  bgPrimary: 'bg-white dark:bg-gray-900',
  bgSecondary: 'bg-gray-50 dark:bg-gray-800',
  bgAccent: 'bg-gray-100 dark:bg-gray-700',
  
  // Text patterns
  textPrimary: 'text-gray-900 dark:text-white',
  textSecondary: 'text-gray-600 dark:text-gray-300',
  textMuted: 'text-gray-500 dark:text-gray-400',
  
  // Border patterns
  border: 'border-gray-200 dark:border-gray-700',
  borderAccent: 'border-gray-300 dark:border-gray-600',
  
  // Input patterns
  inputBg: 'bg-white dark:bg-gray-800',
  inputBorder: 'border-gray-300 dark:border-gray-600',
  inputFocus: 'focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400',
}

// Responsive patterns
export const responsiveClasses = {
  hideOnMobile: 'hidden md:block',
  showOnMobile: 'md:hidden',
  responsivePadding: 'p-4 md:p-6 lg:p-8',
  responsiveText: 'text-sm md:text-base lg:text-lg',
  responsiveGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
}

// Animation patterns
export const animationClasses = {
  fadeIn: 'animate-in fade-in duration-300',
  slideIn: 'animate-in slide-in-from-bottom duration-300',
  transition: 'transition-all duration-200 ease-in-out',
  hoverScale: 'transform hover:scale-105 transition-transform duration-200',
}

// Helper function to combine layout classes
export function createLayoutClass(...patterns: (keyof typeof layoutClasses)[]) {
  return cn(patterns.map(pattern => layoutClasses[pattern]))
}

// Helper function to create themed classes
export function createThemedClass(...patterns: (keyof typeof themeClasses)[]) {
  return cn(patterns.map(pattern => themeClasses[pattern]))
}