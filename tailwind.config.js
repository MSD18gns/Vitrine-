/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0B',
        cream: '#F7F3EC',
        sand: '#EDE6D8',
        gold: '#C7A353',
        goldDark: '#A9873C',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Jost"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.25em',
      },
    },
  },
  plugins: [],
}
