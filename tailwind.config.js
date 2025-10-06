/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#0F172A',
        'secondary-dark': '#1E293B',
        'light-text': '#F1F5F9',
        'medium-text': '#94A3B8',
        'accent-sky': '#0EA5E9',
        'accent-purple': '#8B5CF6',
        'accent-emerald': '#10B981',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      keyframes: {
        'modal-appear': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'modal-appear': 'modal-appear 0.2s ease-out',
      },
    },
  },
  plugins: [],
}