/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#06070a',
          900: '#090b10',
          850: '#0c0e14',
          800: '#101319',
          750: '#151922',
          700: '#1b202b',
          650: '#232936',
          600: '#2c3342',
          500: '#3c4557',
          400: '#5b6579',
          300: '#8a93a6',
          200: '#b4bbca',
          100: '#dfe3ec',
        },
        acid: {
          50: '#f8ffe0',
          100: '#eeffb3',
          200: '#e1ff80',
          300: '#d6ff4d',
          400: '#c8f743',
          500: '#aee12a',
          600: '#88b515',
          700: '#668a12',
          800: '#4c6714',
          900: '#3f5517',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 60px -30px rgba(0,0,0,0.9)',
        glow: '0 0 0 1px rgba(214,255,77,0.25), 0 0 40px -10px rgba(214,255,77,0.35)',
        lifted: '0 24px 60px -24px rgba(0,0,0,0.85)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(214,255,77,0.5)' },
          '70%': { boxShadow: '0 0 0 10px rgba(214,255,77,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(214,255,77,0)' },
        },
        'meter': {
          '0%, 100%': { transform: 'scaleY(0.35)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in': 'scale-in 0.18s cubic-bezier(0.22,1,0.36,1) both',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.22,1,0.36,1) both',
        'pulse-ring': 'pulse-ring 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 1.6s infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
    },
  },
  plugins: [],
};
