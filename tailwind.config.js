/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/index.html',
    './src/renderer/src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Adobe-ähnliches dunkles Chrome
        chrome: {
          900: '#1b1f24',
          800: '#22272e',
          700: '#2b313a',
          600: '#363d48',
          500: '#454d5a'
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2f6fe0'
        },
        canvas: '#3a3f47'
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
}
