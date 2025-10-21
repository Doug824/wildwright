/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Deep Forest Green - Background
        forest: {
          50: '#e6efe9',
          100: '#cfe0d6',
          200: '#a7c3b4',
          300: '#7fa694',
          400: '#588a74',
          500: '#2f6f56',
          600: '#234f3c',
          700: '#1f3527',   // Main app background
          800: '#15231a',
          900: '#0d1510',
        },
        // Bronze - Borders & Accents
        bronze: {
          400: '#C79256',
          500: '#B97A3D',   // Primary bronze
          600: '#8F5A24',
        },
        // Parchment - Card Backgrounds
        parchment: {
          50: '#F7F3E8',
          100: '#F0E8D5',   // Main card fill
          200: '#E9E3D2',
          300: '#DCCEB1',
        },
        // Cyan Mist - Glows & Progress
        mist: {
          300: '#CDE4E2',
          400: '#A9D9D4',
          500: '#7FC9C0',   // Cyan glow
        },
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        leaf: '0 6px 18px rgba(0,0,0,0.25)',
        glow: '0 0 24px rgba(127,201,192,0.45)',
      },
      fontFamily: {
        display: ['"Crimson Pro"', 'serif'],
        ui: ['Inter', 'System'],
      },
    },
  },
  plugins: [],
};
