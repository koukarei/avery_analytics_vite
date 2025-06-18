/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}", // Adjust paths to match your project structure
  ],
  theme: {
    extend: {
      colors: {
            primary: {
              light: '#67e8f9', // cyan-300
              DEFAULT: '#06b6d4', // cyan-500
              dark: '#0e7490', // cyan-700
            },
            secondary: {
              light: '#fecaca', // red-200
              DEFAULT: '#f87171', // red-400
              dark: '#b91c1c', // red-700
            },
            accent: {
              light: '#d8b4fe', // purple-300
              DEFAULT: '#a855f7', // purple-500
              dark: '#7e22ce', // purple-700
            },
      },
      spacing: {
        '128': '32rem', // Example of adding custom spacing
        '144': '36rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Example of adding custom fonts
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Example of adding a plugin
    require('@tailwindcss/typography'),
  ],
};
