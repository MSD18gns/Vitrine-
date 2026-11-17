/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          night: '#032A1D',
          deep: '#05432F',
          DEFAULT: '#0B6B47',
          bright: '#14905F',
          light: '#DDF1E5',
          mist: '#F2F8F4',
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
