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
      },
      colors: {
        primary: { DEFAULT: '#2563EB', hover: '#1D4ED8', light: '#EFF6FF' },
        surface: '#FFFFFF',
        background: '#F8FAFC',
        border: { DEFAULT: '#E2E8F0', hover: '#CBD5E1' },
        'text-primary': '#0F172A',
        'text-secondary': '#475569',
        'text-muted': '#94A3B8',
        success: { DEFAULT: '#059669', bg: '#ECFDF5' },
        warning: { DEFAULT: '#D97706', bg: '#FFFBEB' },
        danger: { DEFAULT: '#DC2626', bg: '#FEF2F2' },
        sidebar: { DEFAULT: '#0F172A', text: '#CBD5E1', active: '#1E293B' },
      },
      animation: {
        'skeleton': 'skeleton-loading 1.5s infinite linear',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-in': 'bounceIn 0.4s ease-out',
      },
      keyframes: {
        'skeleton-loading': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fadeIn': {
          'from': { opacity: '0', transform: 'translateY(8px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'slideUp': {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounceIn': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '60%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
