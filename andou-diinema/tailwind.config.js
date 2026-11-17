/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#075B40',
          DEFAULT: '#13865B',
          light: '#E8F5ED',
          mist: '#F7FAF8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        arabic: ['Amiri', '"Traditional Arabic"', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(7,91,64,.06), 0 8px 24px -12px rgba(7,91,64,.18)',
      },
    },
  },
  plugins: [],
}
