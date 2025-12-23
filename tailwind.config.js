/* eslint-env commonjs */
// @ts-check
 
const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
 
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			// Brand Colors
  			'brand-cyan': 'var(--brand-cyan)',
  			'brand-purple': 'var(--brand-purple)',
  			
  			// Backgrounds
  			bg: {
  				primary: 'var(--bg-primary)',
  				secondary: 'var(--bg-secondary)',
  				tertiary: 'var(--bg-tertiary)',
  				interactive: 'var(--bg-interactive)',
  				elevated: 'var(--bg-elevated)',
  			},
  			
  			// Text
  			text: {
  				primary: 'var(--text-primary)',
  				secondary: 'var(--text-secondary)',
  				muted: 'var(--text-muted)',
  				inverse: 'var(--text-inverse)',
  			},
  			
  			// Borders
  			border: {
  				subtle: 'var(--border-subtle)',
  				moderate: 'var(--border-moderate)',
  				strong: 'var(--border-strong)',
  			},
  			
  			// Semantic Colors
  			success: 'var(--success)',
  			warning: 'var(--warning)',
  			error: 'var(--error)',
  			info: 'var(--info)',
  			
  			// Legacy support (keeping existing colors for compatibility)
  			'neon-pink': 'rgb(255, 0, 128)',
  			'neon-blue': 'rgb(0, 191, 255)',
  			'neon-purple': 'rgb(187, 0, 255)',
  			'bg-darker': 'rgb(4, 4, 8)',
  			'bg-dark': 'rgb(8, 8, 13)',
  			'bg-light': 'rgb(24, 24, 36)',
  			
  			// Shadcn compatibility
  			background: 'var(--bg-primary)',
  			foreground: 'var(--text-primary)',
  			primary: {
  				DEFAULT: 'var(--brand-cyan)',
  				foreground: '#001018'
  			},
  			secondary: {
  				DEFAULT: 'var(--bg-secondary)',
  				foreground: 'var(--text-primary)'
  			},
  			destructive: {
  				DEFAULT: 'var(--error)',
  				foreground: '#ffffff'
  			},
  			muted: {
  				DEFAULT: 'var(--bg-tertiary)',
  				foreground: 'var(--text-muted)'
  			},
  			accent: {
  				DEFAULT: 'var(--brand-purple)',
  				foreground: '#ffffff'
  			},
  			popover: {
  				DEFAULT: 'var(--bg-elevated)',
  				foreground: 'var(--text-primary)'
  			},
  			card: {
  				DEFAULT: 'var(--bg-secondary)',
  				foreground: 'var(--text-primary)'
  			},
  		},
  		spacing: {
  			'0': 'var(--space-0)',
  			'1': 'var(--space-1)',
  			'2': 'var(--space-2)',
  			'3': 'var(--space-3)',
  			'4': 'var(--space-4)',
  			'5': 'var(--space-5)',
  			'6': 'var(--space-6)',
  			'8': 'var(--space-8)',
  			'10': 'var(--space-10)',
  			'12': 'var(--space-12)',
  			'16': 'var(--space-16)',
  			'20': 'var(--space-20)',
  			'24': 'var(--space-24)'
  		},
  		fontSize: {
  			'xs': 'var(--text-xs)',
  			'sm': 'var(--text-sm)',
  			'base': 'var(--text-base)',
  			'lg': 'var(--text-lg)',
  			'xl': 'var(--text-xl)',
  			'2xl': 'var(--text-2xl)',
  			'3xl': 'var(--text-3xl)',
  			'4xl': 'var(--text-4xl)'
  		},
  		borderRadius: {
  			'xs': 'var(--radius-xs)',
  			'sm': 'var(--radius-sm)',
  			'md': 'var(--radius-md)',
  			'lg': 'var(--radius-lg)',
  			'xl': 'var(--radius-xl)',
  			'2xl': 'var(--radius-2xl)',
  			'full': 'var(--radius-full)',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			'elev-0': 'var(--shadow-0)',
  			'elev-1': 'var(--shadow-1)',
  			'elev-2': 'var(--shadow-2)',
  			'elev-3': 'var(--shadow-3)',
  			'elev-4': 'var(--shadow-4)',
  			'glow-cyan': 'var(--glow-cyan)',
  			'glow-purple': 'var(--glow-purple)',
  			'glow-mixed': 'var(--glow-mixed)',
  			'glass': 'var(--glass-shadow)'
  		},
  		backdropBlur: {
  			'glass': 'var(--glass-blur)',
  			'glass-heavy': 'var(--glass-blur-heavy)'
  		},
  		zIndex: {
  			'base': 'var(--z-base)',
  			'dropdown': 'var(--z-dropdown)',
  			'sticky': 'var(--z-sticky)',
  			'fixed': 'var(--z-fixed)',
  			'modal-backdrop': 'var(--z-modal-backdrop)',
  			'modal': 'var(--z-modal)',
  			'popover': 'var(--z-popover)',
  			'tooltip': 'var(--z-tooltip)',
  			'toast': 'var(--z-toast)'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-sans)',
                    ...fontFamily.sans
                ]
  		},
  		transitionTimingFunction: {
  			'ease': 'var(--transition-ease)',
  			'ease-gentle': 'var(--transition-ease-gentle)',
  			'ease-snappy': 'var(--transition-ease-snappy)',
  			'ease-spring': 'var(--transition-ease-spring)'
  		},
  		transitionDuration: {
  			'fast': 'var(--transition-duration-fast)',
  			'normal': 'var(--transition-duration)',
  			'slow': 'var(--transition-duration-slow)'
  		},
  		backgroundImage: {
  			'gradient-brand': 'var(--gradient-brand)',
  			'gradient-ambient': 'var(--gradient-ambient)',
  		},
  		backdropBlur: {
  			'glass': 'var(--glass-blur)',
  			'glass-heavy': 'var(--glass-blur-heavy)',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: 0
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: 0
  				}
  			},
  			'fade-in': {
  				from: { opacity: '0' },
  				to: { opacity: '1' }
  			},
  			'slide-up': {
  				from: { transform: 'translateY(10px)', opacity: '0' },
  				to: { transform: 'translateY(0)', opacity: '1' }
  			},
  			'slide-down': {
  				from: { transform: 'translateY(-10px)', opacity: '0' },
  				to: { transform: 'translateY(0)', opacity: '1' }
  			},
  			'scale-in': {
  				from: { transform: 'scale(0.95)', opacity: '0' },
  				to: { transform: 'scale(1)', opacity: '1' }
  			},
  			'shimmer': {
  				'0%': { transform: 'translateX(-100%)' },
  				'100%': { transform: 'translateX(100%)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.3s var(--transition-ease)',
  			'slide-up': 'slide-up 0.3s var(--transition-ease)',
  			'slide-down': 'slide-down 0.3s var(--transition-ease)',
  			'scale-in': 'scale-in 0.2s var(--transition-ease-spring)',
  			'shimmer': 'shimmer 2s infinite'
  		}
  	}
  },
   
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
}