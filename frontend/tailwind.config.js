// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6F61',
        secondary: '#6B705C',
        accent: '#D4AC0D',
        background: '#FFFFFF',
        textDark: '#333333',
        textLight: '#F5F5F5',
      },
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'], 
      },
      boxShadow: {
        'custom-light': '0 4px 6px rgba(0, 0, 0, 0.05)',
        'custom-md': '0 10px 15px rgba(0, 0, 0, 0.1)',
      },
      screens: {
        'sm': '640px',
        'md': '800px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}