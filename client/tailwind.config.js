/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      colors: {
        /* ── Harmony palette: deep forest green + warm gold on cream ── */
        brand: {
          50:  '#F1F6F3',
          100: '#DDEAE3',
          200: '#B9D2C5',
          300: '#8CB4A2',
          400: '#5D9179',
          500: '#3D7159',
          600: '#2A5A46',
          700: '#1D4B3B',
          800: '#143C30',
          900: '#0E2B23',
          950: '#071B16',
        },
        gold: {
          50:  '#FCF8EF',
          100: '#F7EDD6',
          200: '#EDD9A9',
          300: '#DFC079',
          400: '#CFA755',
          500: '#C0913D',
          600: '#A47531',
          700: '#84592C',
          800: '#6C4729',
          900: '#5B3C25',
        },
        cream: {
          DEFAULT: '#F7F3EA',
          50:  '#FDFBF6',
          100: '#F7F3EA',
          200: '#EFE7D8',
          300: '#E3D7C2',
        },
        /* Warm neutral replacing Tailwind's cool `gray` throughout the app. */
        sand: {
          50:  '#FDFBF7',
          100: '#F5F1E8',
          200: '#EAE3D4',
          300: '#D8CDB8',
          400: '#B4A98F',
          500: '#8C8069',
          600: '#6B6252',
          700: '#524B3F',
          800: '#3A352C',
          900: '#252119',
          950: '#17140F',
        },
        ink: {
          DEFAULT: '#0B1F1A',
          soft: '#12312A',
          card: '#16382F',
        },

        /* ── Semantic aliases (consumed across the app) ── */
        primary: { DEFAULT: '#1D4B3B', hover: '#143C30', light: '#EDF4F0' },
        accent:  { DEFAULT: '#C0913D', hover: '#A47531', light: '#FCF8EF' },
        surface: '#FFFFFF',
        background: '#F7F3EA',
        border: { DEFAULT: '#E5DFD2', hover: '#D3C9B5' },
        'text-primary': '#12312A',
        'text-secondary': '#55635C',
        'text-muted': '#8C9891',
        success: { DEFAULT: '#2A7F62', bg: '#EAF6F1' },
        warning: { DEFAULT: '#B4801F', bg: '#FCF6E7' },
        danger:  { DEFAULT: '#B4443A', bg: '#FBEEEC' },
        sidebar: { DEFAULT: '#0E2B23', text: '#9DBAAE', active: '#1D4B3B' },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(14,43,35,0.04), 0 8px 24px -12px rgba(14,43,35,0.12)',
        lift: '0 2px 4px rgba(14,43,35,0.04), 0 18px 40px -18px rgba(14,43,35,0.28)',
        glow: '0 0 0 1px rgba(192,145,61,0.25), 0 12px 40px -12px rgba(192,145,61,0.45)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
      },
      animation: {
        'skeleton':    'skeleton-loading 1.5s infinite linear',
        'fade-in':     'fadeIn 0.4s ease-out both',
        'slide-up':    'slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both',
        'bounce-in':   'bounceIn 0.45s cubic-bezier(0.22,1,0.36,1) both',
        'float':       'float 7s ease-in-out infinite',
        'float-slow':  'float 11s ease-in-out infinite',
        'pulse-ring':  'pulseRing 2.4s cubic-bezier(0.4,0,0.6,1) infinite',
        'marquee':     'marquee 38s linear infinite',
        'marquee-rev': 'marquee-rev 38s linear infinite',
        'shimmer':     'shimmer 2.6s linear infinite',
        'spin-slow':   'spin 26s linear infinite',
        'draw':        'draw 2s ease-out forwards',
        'blob':        'blob 18s ease-in-out infinite',
        'tilt':        'tilt 9s ease-in-out infinite',
      },
      keyframes: {
        'skeleton-loading': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0.94)', opacity: '0' },
          '60%':  { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-14px)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(0.9)', opacity: '0.6' },
          '70%':  { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        'marquee-rev': {
          from: { transform: 'translateX(-50%)' },
          to:   { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        draw: {
          from: { strokeDashoffset: '1200' },
          to:   { strokeDashoffset: '0' },
        },
        blob: {
          '0%,100%': { borderRadius: '46% 54% 62% 38% / 44% 40% 60% 56%', transform: 'rotate(0deg)' },
          '33%':     { borderRadius: '62% 38% 40% 60% / 58% 62% 38% 42%', transform: 'rotate(6deg)' },
          '66%':     { borderRadius: '38% 62% 56% 44% / 62% 38% 62% 38%', transform: 'rotate(-5deg)' },
        },
        tilt: {
          '0%,100%': { transform: 'rotate(-1.2deg)' },
          '50%':     { transform: 'rotate(1.2deg)' },
        },
      },
    },
  },
  plugins: [],
}
