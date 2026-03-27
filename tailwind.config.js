/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Professional brand color palette (Gold + Dark theme)
        brand: {
          50: '#f9f7f2',
          100: '#f0ebe2',
          200: '#e4c4a0',
          300: '#d4a574',   // Main brand gold
          400: '#c48a4e',
          500: '#a87535',
          600: '#8B6F47',   // Dark gold
          700: '#6b5436',
          800: '#543e27',
          900: '#3d2d1a',   // Deep dark
        },
        // Dark background colors for professional look
        'dark': {
          'bg': '#1a1a1a',      // Main background
          'card': '#2d2d2d',    // Card background
          'border': '#3d3d3d',  // Borders
        },
        // Semantic colors
        'success': '#4ade80',
        'warning': '#fbbf24',
        'error': '#ef4444',
      },
      fontFamily: {
        // Sans serif for body text
        'sans': ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        // Serif for headings (elegant and professional)
        'serif': ['var(--font-playfair)', 'Georgia', 'serif'],
        // Brand font for logo
        'brand': ['var(--font-pacifico)', 'cursive'],
      },
      fontSize: {
        // Hero heading sizes
        'hero': ['3.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'hero-sm': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        // Section headings
        'section': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'subsection': ['1.5rem', { lineHeight: '1.35' }],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #3d2d1a 0%, #1a1a1a 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4A574 0%, #8B6F47 100%)',
      },
      spacing: {
        'xs-tight': '0.5rem',
        'tight': '1rem',
        'normal': '1.5rem',
        'relaxed': '2rem',
        'loose': '3rem',
      },
      borderRadius: {
        'brand': '0.75rem',
      },
      boxShadow: {
        'brand': '0 20px 25px -5px rgba(212, 165, 116, 0.1)',
        'brand-lg': '0 25px 50px -12px rgba(212, 165, 116, 0.15)',
        'dark': '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

