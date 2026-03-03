/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f0f0f4',
          100: '#d9d9e8',
          200: '#b3b3d1',
          300: '#8080b0',
          400: '#5a5a8f',
          500: '#3d3d6b',
          600: '#2e2e52',
          700: '#1f1f3a',
          800: '#141428',
          900: '#0a0a18',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
};
