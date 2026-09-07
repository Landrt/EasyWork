import type { Config } from "tailwindcss";

const config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			serif: ['var(--font-fraunces)', 'Fraunces', 'Georgia', 'serif'],
  			sans: ['var(--font-ibm-plex-sans)', 'IBM Plex Sans', 'Inter', 'system-ui', 'sans-serif'],
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			editorial: {
  				surface: '#fbf9f5',
  				'surface-dim': '#dbdad6',
  				'surface-container-low': '#f5f3ef',
  				'surface-container': '#efeeea',
  				'surface-container-high': '#eae8e4',
  				'on-surface': '#1b1c1a',
  				'on-surface-variant': '#494740',
  				ink: '#1C1B18',
  				'success-green': '#127749',
  				'parchment-border': '#E5E1D8',
  				'clay-accent': '#B8B1A5',
  				error: '#ba1a1a'
  			},
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
  			}
  		},
  		borderRadius: {
  			sm: '0.125rem',
  			DEFAULT: '0.25rem',
  			md: '0.375rem',
  			lg: '0.5rem',
  			xl: '0.75rem',
  			full: '9999px'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
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
  					height: '0'
  				}
  			},
  			blob: {
  				'0%': {
  					transform: 'translate(0px, 0px) scale(1)'
  				},
  				'33%': {
  					transform: 'translate(30px, -50px) scale(1.1)'
  				},
  				'66%': {
  					transform: 'translate(-20px, 20px) scale(0.9)'
  				},
  				'100%': {
  					transform: 'translate(0px, 0px) scale(1)'
  				}
  			},
  			'loading-dot': {
  				'0%': {
  					opacity: '0.2',
  					transform: 'translateX(-2px) scale(0.8)'
  				},
  				'50%': {
  					opacity: '0.8',
  					transform: 'translateX(2px) scale(1)'
  				},
  				'100%': {
  					opacity: '0.2',
  					transform: 'translateX(-2px) scale(0.8)'
  				}
  			},
  			shine: {
  				'0%': {
  					'background-position': '0% 0%'
  				},
  				'50%': {
  					'background-position': '100% 100%'
  				},
  				to: {
  					'background-position': '0% 0%'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			blob: 'blob 8s infinite',
  			shine: 'shine var(--duration) infinite linear'
  		},
  		typography: {
  			xxxs: {
  				css: {
  					fontSize: '0.625rem',
  					h1: {
  						fontSize: '1rem'
  					},
  					h2: {
  						fontSize: '0.875rem'
  					},
  					h3: {
  						fontSize: '0.75rem'
  					},
  					h4: {
  						fontSize: '0.625rem'
  					}
  				}
  			},
  			xxs: {
  				css: {
  					fontSize: '0.75rem',
  					h1: {
  						fontSize: '1.25rem'
  					},
  					h2: {
  						fontSize: '1.15rem'
  					},
  					h3: {
  						fontSize: '1rem'
  					},
  					h4: {
  						fontSize: '0.875rem'
  					}
  				}
  			}
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/container-queries"),
    require("@tailwindcss/typography")
  ],
} satisfies Config;

export default config;
