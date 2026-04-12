/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#1a1a1a',
        'bg-sidebar': '#141414',
        'bg-card': '#2a2a2a',
        'bg-input': '#242424',
        'accent': '#c96442',
        'accent-hover': '#e0714a',
        'text-primary': '#e8e0d5',
        'text-secondary': '#9b9589',
        'border': '#333333',
        'border-accent': '#c96442'
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif']
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem'
      }
    }
  },
  plugins: []
};