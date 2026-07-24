/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          50: '#fdf3f4',
          100: '#fce7e9',
          200: '#f9d0d4',
          300: '#f3a8b1',
          400: '#ea7585',
          500: '#dc4858',
          600: '#c82a3e',
          700: '#a81f32',
          800: '#8b1d2f',
          900: '#751c2c',
          950: '#410914'
        },
        amber: {
          950: '#3f2406'
        },
        cream: '#fbf7f0',
        ink: '#1a1417'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif']
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(75, 28, 44, 0.18)',
        glow: '0 0 0 1px rgba(220, 72, 88, 0.25), 0 8px 24px -8px rgba(220, 72, 88, 0.45)'
      },
      backgroundImage: {
        'gradient-wine': 'linear-gradient(135deg, #410914 0%, #8b1d2f 50%, #c82a3e 100%)'
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: 0, transform: 'scale(0.95)' }, '100%': { opacity: 1, transform: 'scale(1)' } }
      }
    }
  },
  plugins: []
}
