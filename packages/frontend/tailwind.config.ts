import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // Include design system components
    "./node_modules/@gkeferstein/design/dist/**/*.{js,ts,jsx,tsx}",
    "../../../design.mojo/packages/design/dist/**/*.{js,ts,jsx,tsx}",
    "/design-system/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui semantic colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // MOJO specific colors
        mojo: {
          primary: 'var(--mojo-primary)',
          'primary-dark': 'var(--mojo-primary-dark)',
          accent: 'var(--mojo-accent)',
          success: 'var(--mojo-success)',
          error: 'var(--mojo-error)',
          warning: 'var(--mojo-warning)',
          info: 'var(--mojo-info)',
        },
        glass: {
          DEFAULT: 'var(--mojo-glass-bg)',
          strong: 'var(--mojo-glass-bg-strong)',
          subtle: 'var(--mojo-glass-bg-subtle)',
          border: 'var(--mojo-glass-border)',
        },
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          elevated: 'hsl(var(--surface-elevated))',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        'mojo-sm': 'var(--mojo-shadow-sm)',
        'mojo': 'var(--mojo-shadow)',
        'mojo-md': 'var(--mojo-shadow-md)',
        'mojo-lg': 'var(--mojo-shadow-lg)',
        'mojo-xl': 'var(--mojo-shadow-xl)',
        'mojo-primary': 'var(--mojo-shadow-primary)',
        'mojo-glass': 'var(--mojo-shadow-glass)',
        'glow-primary': '0 0 20px rgba(102, 221, 153, 0.3)',
        'glow-primary-lg': '0 0 40px rgba(102, 221, 153, 0.5)',
        'glow-accent': '0 0 20px rgba(135, 58, 207, 0.3)',
      },
      backdropBlur: {
        glass: 'var(--mojo-glass-blur)',
        'glass-strong': 'var(--mojo-glass-blur-strong)',
        'glass-subtle': 'var(--mojo-glass-blur-subtle)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mojo-page': 'var(--mojo-page-gradient)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        'orb-green': 'radial-gradient(circle, var(--mojo-orb-green) 0%, transparent 70%)',
        'orb-purple': 'radial-gradient(circle, var(--mojo-orb-purple) 0%, transparent 70%)',
        'orb-cyan': 'radial-gradient(circle, var(--mojo-orb-cyan) 0%, transparent 70%)',
        'gradient-primary': 'linear-gradient(135deg, #66dd99 0%, #44cc88 50%, #22bb77 100%)',
        'gradient-accent': 'linear-gradient(135deg, #66dd99 0%, #873acf 100%)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-15px) rotate(1deg)' },
          '66%': { transform: 'translateY(10px) rotate(-1deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(102, 221, 153, 0.3)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 40px rgba(102, 221, 153, 0.5)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        shimmer: 'shimmer 2s infinite',
        float: 'float 8s ease-in-out infinite',
        'float-slow': 'float 12s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
