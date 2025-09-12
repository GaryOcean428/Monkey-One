/* eslint-env commonjs */
// @ts-check
// eslint-disable-next-line no-undef
const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
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
  			'neon-pink': 'rgb(255, 0, 128)',
  			'neon-blue': 'rgb(0, 191, 255)',
  			'neon-purple': 'rgb(187, 0, 255)',
  			'bg-darker': 'rgb(4, 4, 8)',
  			'bg-dark': 'rgb(8, 8, 13)',
  			'bg-light': 'rgb(24, 24, 36)',
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
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
  			'xs': 'var(--shadow-xs)',
  			'sm': 'var(--shadow-sm)',
  			'md': 'var(--shadow-md)',
  			'lg': 'var(--shadow-lg)',
  			'xl': 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)',
  			'inner': 'var(--shadow-inner)',
  			'glass': 'var(--glass-shadow)'
  		},
  		backdropBlur: {
  			'glass': 'var(--glass-blur)',
  			'glass-heavy': 'var(--glass-blur-heavy)'
  		},
  		zIndex: {
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
  // eslint-disable-next-line no-undef
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
}