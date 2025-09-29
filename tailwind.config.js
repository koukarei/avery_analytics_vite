/** @type {import('tailwindcss').Config} */

// Add these imports at the top
import forms from 'tailwindcss';
import typography from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#67e8f9',
          DEFAULT: '#06b6d4',
          dark: '#0e7490',
        },
        secondary: {
          light: '#fecaca',
          DEFAULT: '#f87171',
          dark: '#b91c1c',
        },
        accent: {
          light: '#d8b4fe',
          DEFAULT: '#a855f7',
          dark: '#7e22ce',
        },
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    forms,        // ✅ Use the imported variable
    typography,   // ✅ Use the imported variable
  ],
}