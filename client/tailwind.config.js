/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          soft: 'rgb(var(--c-ink-soft) / <alpha-value>)',
          softer: 'rgb(var(--c-ink-softer) / <alpha-value>)',
          line: 'rgb(var(--c-ink-line) / <alpha-value>)',
        },
        signal: {
          DEFAULT: '#6C5CE7', // electric indigo — primary brand accent (same in both themes)
          light: '#8B7FF0',
          dark: '#5646C9',
        },
        amber: {
          DEFAULT: '#FFB020', // promotions / discount accent
          dark: '#E09A10',
        },
        mist: {
          DEFAULT: 'rgb(var(--c-mist) / <alpha-value>)',
          dim: 'rgb(var(--c-mist-dim) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(108, 92, 231, 0.45)',
      },
    },
  },
  plugins: [],
};
