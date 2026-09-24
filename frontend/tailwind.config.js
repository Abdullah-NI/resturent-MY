/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffdf0',
          100: '#fefab8',
          200: '#fef380',
          300: '#fde548',
          400: '#fbd41B',
          500: '#d4af37', // Primary Luxury Gold
          600: '#b88a1a',
          700: '#946614',
          800: '#784f16',
          900: '#644117',
        },
        burgundy: {
          50: '#fdf3f3',
          100: '#fbe4e4',
          200: '#f8cece',
          300: '#f2abab',
          400: '#e77a7a',
          500: '#d94c4c',
          600: '#bd3333',
          700: '#9c2424',
          800: '#832121', // Primary Deep Burgundy
          900: '#6e2020',
          950: '#3c0c0c',
        },
        cream: {
          50: '#ffffff',
          100: '#fffdfa',
          200: '#faf5ef',
          300: '#f4ede2',
          400: '#e8dbca',
        },
        dark: {
          900: '#0d0d0e',
          800: '#141417',
          700: '#1f1f24',
          600: '#2b2b32',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cinzel', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 4px 20px -2px rgba(212, 175, 55, 0.25)',
        'burgundy': '0 4px 20px -2px rgba(131, 33, 33, 0.3)',
      }
    },
  },
  plugins: [],
}
