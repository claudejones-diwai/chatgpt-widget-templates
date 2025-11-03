/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // System semantic colors using CSS custom properties
        'primary': 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
        'surface': 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-secondary': 'rgb(var(--color-surface-secondary) / <alpha-value>)',
        'border': 'rgb(var(--color-border) / <alpha-value>)',
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-tertiary': 'rgb(var(--color-text-tertiary) / <alpha-value>)',
        'success': 'rgb(var(--color-success) / <alpha-value>)',
        'success-hover': 'rgb(var(--color-success-hover) / <alpha-value>)',
        'error': 'rgb(var(--color-error) / <alpha-value>)',
        'error-surface': 'rgb(var(--color-error-surface) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
