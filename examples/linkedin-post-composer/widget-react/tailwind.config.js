/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Accent colors (ChatGPT design system)
        'accent-blue': 'rgb(var(--color-accent-blue) / <alpha-value>)',
        'accent-blue-hover': 'rgb(var(--color-accent-blue-hover) / <alpha-value>)',
        'accent-red': 'rgb(var(--color-accent-red) / <alpha-value>)',
        'accent-orange': 'rgb(var(--color-accent-orange) / <alpha-value>)',
        'accent-green': 'rgb(var(--color-accent-green) / <alpha-value>)',

        // Surface colors
        'surface': 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-secondary': 'rgb(var(--color-surface-secondary) / <alpha-value>)',
        'surface-tertiary': 'rgb(var(--color-surface-tertiary) / <alpha-value>)',
        'border': 'rgb(var(--color-border) / <alpha-value>)',

        // Text colors
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-tertiary': 'rgb(var(--color-text-tertiary) / <alpha-value>)',

        // Semantic colors (for backwards compatibility)
        'primary': 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
        'success': 'rgb(var(--color-success) / <alpha-value>)',
        'success-hover': 'rgb(var(--color-success-hover) / <alpha-value>)',
        'error': 'rgb(var(--color-error) / <alpha-value>)',
        'error-surface': 'rgb(var(--color-error-surface) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
