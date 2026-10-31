/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media', // follows prefers-color-scheme
  theme: {
    extend: {
      colors: {
        board: {
          DEFAULT: 'rgb(var(--bg-board) / <alpha-value>)',
          card: 'rgb(var(--card-board) / <alpha-value>)',
          border: 'rgb(var(--card-border) / <alpha-value>)',
        },
        ink: {
          blue: 'rgb(var(--ink-blue) / <alpha-value>)',
          dark: 'rgb(var(--ink-dark) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
          main: 'rgb(var(--text-main) / <alpha-value>)',
        },
        marker: {
          red: 'rgb(var(--marker-red) / <alpha-value>)',
          'red-hover': 'rgb(var(--marker-red-hover) / <alpha-value>)',
          'red-active': 'rgb(var(--marker-red-active) / <alpha-value>)',
        },
        success: 'rgb(var(--accent-green) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-ui)', 'sans-serif'],
        condensed: ['var(--font-display)', 'sans-serif'],
      },
      minHeight: {
        'touch-button': '120px',
      },
    },
  },
  plugins: [],
}
