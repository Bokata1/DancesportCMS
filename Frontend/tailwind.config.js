/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx}",
  ],
  theme: {
    extend: {
        colors: {
          burgundy: {
          50:  '#fdf3f4',
          100: '#fce5e7',
          200: '#f8c4ca',
          300: '#f29ba6',
          400: '#e96573',
          500: '#dc3e51',
          600: '#c52a3d',
          700: '#a82132',
          800: '#8a1f2e',
          900: '#722F37',
          950: '#3f0d14',
        },
      },
        fontFamily: {
          sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        },
          keyframes: {
            danceLeft: {
              '0%, 100%': {transform: 'rotate(-15deg) translateY(0)'},
              '25%': { transform: 'rotate(15deg) translateY(-8px)'},
              '50%': { transform: 'rotate(-15deg) translateY(0)'},
              '75%': { transform: 'rotate(15deg) translateY(-8px)'},
            },
            danceRight: {
              '0%, 100%': {transform: 'rotate(15deg) translateY(0)'},
              '25%': { transform: 'rotate(-15deg)  translateY(-8px)'},
              '50%': { transform: 'rotate(15deg) translateY(0)'},
              '75%': { transform: 'rotate(-15deg) translateY(-8px)'},
            },
          },
          animation: {
            'dance-left': 'danceLeft 1.2s ease-in-out infinite',
            'dance-right': 'danceRight 1.2s ease-in-out infinite',
          },
    },
  },
  plugins: [],
}

