import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
    safelist: [
        // Brand colors
        'text-brand-red', 'text-brand-blue',
        'bg-brand-red', 'bg-brand-blue',
        'bg-brand-red/10', 'bg-brand-blue/10',
        'bg-brand-red/15', 'bg-brand-blue/15',
        'bg-brand-red/20', 'bg-brand-blue/20',
        'bg-brand-red/5', 'bg-brand-blue/5',
        'bg-brand-red/90', 'bg-brand-blue/90',
        'border-brand-red', 'border-brand-blue',
        'border-brand-red/30', 'border-brand-blue/30',
        'ring-brand-red', 'ring-brand-blue',
        
        // Hover variants
        'hover:text-brand-red', 'hover:text-brand-blue',
        'hover:bg-brand-red', 'hover:bg-brand-blue',
        'hover:bg-brand-red/10', 'hover:bg-brand-blue/10',
        'hover:bg-brand-red/5', 'hover:bg-brand-blue/5',
        'hover:bg-brand-red/90', 'hover:bg-brand-blue/90',
        'hover:border-brand-red', 'hover:border-brand-blue',
        
        // Data-state active variants
        'data-[state=active]:text-brand-red', 'data-[state=active]:text-brand-blue',
        'data-[state=active]:bg-brand-red/10', 'data-[state=active]:bg-brand-blue/10',
        
        // Shadows
        'shadow-brand-red', 'shadow-brand-blue',
        
        // Border widths
        'border-l-4',
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
                border: 'oklch(var(--border))',
                input: 'oklch(var(--input))',
                ring: 'oklch(var(--ring) / <alpha-value>)',
                background: 'oklch(var(--background))',
                foreground: 'oklch(var(--foreground))',
                primary: {
                    DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
                    foreground: 'oklch(var(--primary-foreground))',
                    light: 'oklch(var(--primary-light) / <alpha-value>)',
                    dark: 'oklch(var(--primary-dark) / <alpha-value>)'
                },
                secondary: {
                    DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
                    foreground: 'oklch(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
                    foreground: 'oklch(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
                    foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
                },
                accent: {
                    DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
                    foreground: 'oklch(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'oklch(var(--popover))',
                    foreground: 'oklch(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'oklch(var(--card))',
                    foreground: 'oklch(var(--card-foreground))'
                },
                chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))'
                },
                sidebar: {
                    DEFAULT: 'oklch(var(--sidebar))',
                    foreground: 'oklch(var(--sidebar-foreground))',
                    primary: 'oklch(var(--sidebar-primary))',
                    'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
                    accent: 'oklch(var(--sidebar-accent))',
                    'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
                    border: 'oklch(var(--sidebar-border))',
                    ring: 'oklch(var(--sidebar-ring))'
                },
                'brand-red': 'oklch(var(--brand-red) / <alpha-value>)',
                'brand-red-dark': 'oklch(var(--brand-red-dark) / <alpha-value>)',
                'brand-red-light': 'oklch(var(--brand-red-light) / <alpha-value>)',
                'brand-blue': 'oklch(var(--brand-blue) / <alpha-value>)',
                'brand-blue-dark': 'oklch(var(--brand-blue-dark) / <alpha-value>)',
                'brand-blue-light': 'oklch(var(--brand-blue-light) / <alpha-value>)'
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            borderWidth: {
                '3': '3px'
            },
            boxShadow: {
                xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
                premium: '0 4px 6px -1px rgba(220, 38, 38, 0.12), 0 2px 4px -1px rgba(220, 38, 38, 0.08)',
                'premium-lg': '0 10px 15px -3px rgba(220, 38, 38, 0.12), 0 4px 6px -2px rgba(220, 38, 38, 0.08)',
                'premium-xl': '0 20px 25px -5px rgba(220, 38, 38, 0.12), 0 10px 10px -5px rgba(220, 38, 38, 0.08)',
                'blue': '0 4px 6px -1px rgba(37, 99, 235, 0.12), 0 2px 4px -1px rgba(37, 99, 235, 0.08)',
                'blue-lg': '0 10px 15px -3px rgba(37, 99, 235, 0.12), 0 4px 6px -2px rgba(37, 99, 235, 0.08)',
                'brand-red': '0 4px 12px -2px oklch(var(--brand-red) / 0.3)',
                'brand-blue': '0 4px 12px -2px oklch(var(--brand-blue) / 0.3)'
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' }
                },
                'slide-in': {
                    from: { transform: 'translateX(-100%)' },
                    to: { transform: 'translateX(0)' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'slide-in': 'slide-in 0.3s ease-out'
            }
        }
    },
    plugins: [typography, containerQueries, animate]
};
