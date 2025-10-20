/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary - Emerald (Nature/Druid theme)
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
        },
        // Secondary - Amber (Wild/Primal theme)
        secondary: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Accent - Purple (Magic theme)
        accent: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
      },
    },
  },
  plugins: [],
};
