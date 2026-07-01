/** @type {import('tailwindcss').Config} */
// Design-Tokens aus dem Claude-Design-Kit (JK3DA PDF Studio UI Kit).
// `accent` bleibt als Alias auf `primary` erhalten (Abwärtskompatibilität).
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        chrome: {
          900: '#1b1f24',
          800: '#22272e',
          700: '#2b313a',
          600: '#363d48',
          500: '#454d5a'
        },
        canvas: '#3a3f47',
        page: '#ffffff',
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2f6fe0'
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2f6fe0'
        },
        ink: {
          DEFAULT: '#e5e7eb',
          muted: '#6b7280'
        },
        success: '#15a34a',
        warning: '#f59e0b',
        danger: '#e11d2a',
        annotation: '#e11d2a',
        highlight: '#ffd400'
      },
      borderRadius: {
        control: '6px',
        panel: '8px'
      },
      height: {
        control: '36px',
        toolbar: '48px'
      },
      minHeight: {
        control: '36px'
      },
      width: {
        icon: '18px'
      },
      spacing: {
        icon: '18px',
        control: '36px',
        toolbar: '48px'
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', '-apple-system', 'sans-serif']
      },
      fontSize: {
        ui: ['13px', { lineHeight: '18px' }],
        'ui-sm': ['12px', { lineHeight: '16px' }],
        'ui-lg': ['14px', { lineHeight: '20px' }]
      },
      boxShadow: {
        panel: '0 1px 2px rgba(0,0,0,.30), 0 2px 8px rgba(0,0,0,.25)',
        menu: '0 4px 16px rgba(0,0,0,.45)',
        toolbar: 'inset 0 -1px 0 rgba(0,0,0,.40)',
        focus: '0 0 0 1.5px #3b82f6'
      },
      ringWidth: {
        DEFAULT: '1.5px'
      },
      ringColor: {
        DEFAULT: '#3b82f6'
      },
      ringOffsetColor: {
        chrome: '#22272e'
      }
    }
  },
  plugins: []
}
