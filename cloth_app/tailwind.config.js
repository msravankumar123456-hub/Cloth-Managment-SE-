/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        graphite: {
          950: '#0B0C0E',
          900: '#101114',
          850: '#141519',
          800: '#17181C',
          750: '#1C1E23',
          700: '#23252B',
          600: '#32353E',
        },
        brand: {
          DEFAULT: '#FF7135',
          hover: '#FF5C1B',
          glow: 'rgba(255, 113, 53, 0.35)',
          amber: '#F59E0B',
          crimson: '#E11D48',
        },
        muted: {
          DEFAULT: '#A1A1AA',
          light: '#D4D4D8',
          dark: '#71717A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-orange': '0 0 50px -10px rgba(255, 113, 53, 0.35)',
        'glow-card': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-rim': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'raycast-window': '0 24px 64px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'aurora-mesh': 'radial-gradient(circle at 50% 0%, rgba(255, 113, 53, 0.18) 0%, rgba(225, 29, 72, 0.12) 35%, rgba(16, 17, 20, 0) 70%)',
        'aurora-hero': 'radial-gradient(circle at 65% 30%, rgba(255, 113, 53, 0.22) 0%, rgba(245, 158, 11, 0.14) 25%, rgba(16, 17, 20, 0) 65%)',
        'card-gradient': 'linear-gradient(180deg, rgba(23, 24, 28, 0.8) 0%, rgba(16, 17, 20, 0.95) 100%)',
      },
      borderRadius: {
        'panel': '14px',
        'card': '16px',
        'window': '18px',
      }
    },
  },
  plugins: [],
}
