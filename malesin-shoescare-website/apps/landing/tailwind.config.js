/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#f97316',
          50: '#fff7ed',
          500: '#f97316',
          600: '#ea580c',
        },
      },
      boxShadow: {
        'brutal': '4px 4px 0 0 #000',
        'brutal-lg': '8px 8px 0 0 #000',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
