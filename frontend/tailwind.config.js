/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core Theme Semantic Tokens (Light & Dark Adaptive)
        theme: {
          bg: 'var(--background)',
          surface: 'var(--surface)',
          elevated: 'var(--surface-elevated)',
          panel: 'var(--surface-panel)',
          border: 'var(--border)',
          'border-subtle': 'var(--border-subtle)',
          'border-strong': 'var(--border-strong)',
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          accent: 'var(--accent)',
          'accent-hover': 'var(--accent-hover)',
          'accent-muted': 'var(--accent-muted)',
          success: 'var(--success)',
          warning: 'var(--warning)',
          critical: 'var(--critical)',
          info: 'var(--info)',
        },
        canvas: 'var(--background)',
        surface: 'var(--surface)',
        elevated: 'var(--surface-elevated)',
        panel: 'var(--surface-panel)',
        line: 'var(--border)',
        'line-strong': 'var(--border-strong)',
        brand: {
          DEFAULT: '#DC2626',
          hover: '#EF4444',
          dark: '#991B1B',
          glow: 'rgba(220, 38, 38, 0.25)',
        },
        // Graphite tokens
        graphite: {
          950: 'var(--background)',
          900: 'var(--surface)',
          850: 'var(--surface-elevated)',
          800: 'var(--surface-panel)',
          750: 'var(--border-strong)',
          700: 'var(--border)',
          600: 'var(--border-strong)',
          500: 'var(--text-muted)',
          400: 'var(--text-secondary)',
          300: 'var(--text-secondary)',
          200: 'var(--text-primary)',
          100: 'var(--text-primary)',
        },
        // Compatibility bindings
        iccc: {
          950: 'var(--background)',
          900: 'var(--surface)',
          850: 'var(--surface-elevated)',
          800: 'var(--surface-panel)',
          700: 'var(--border)',
          600: 'var(--border-strong)',
          border: 'var(--border)',
          subtle: 'var(--border-subtle)',
        },
        status: {
          normal: '#10B981',  // green / verified
          warning: '#F59E0B', // amber / pending
          critical: '#DC2626',// red / severe
          info: '#717B87',    // neutral slate gray
          muted: '#525B66',   // dark slate
        }
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'JetBrains Mono', 'monospace'],
        sans: ['Inter', 'IBM Plex Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      borderRadius: {
        DEFAULT: '2px',
        none: '0px',
        sm: '2px',
        md: '3px',
        lg: '4px',
        full: '9999px',
      }
    },
  },
  plugins: [],
}
