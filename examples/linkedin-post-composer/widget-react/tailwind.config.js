/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        linkedin: {
          50: "#e7f3ff",
          100: "#d0e7ff",
          200: "#a8d4ff",
          300: "#74b9ff",
          400: "#3b94ff",
          500: "#0A66C2", // LinkedIn brand blue
          600: "#08529c",
          700: "#06427d",
          800: "#053967",
          900: "#042f54",
        },
      },
    },
  },
  plugins: [],
};
