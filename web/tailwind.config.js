/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        violet: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#CAC0FD',
          400: '#B4A5FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#581C87',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          150: '#ECECF1',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        success: {
          50: '#F0FDF4',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        warning: {
          50: '#FFFBEB',
          500: '#FBBF24',
          600: '#F59E0B',
          700: '#D97706',
        },
        error: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        info: {
          50: '#F5F3FF',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7E22CE',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"Monaco", "Courier New", monospace'],
      },
      zIndex: {
        hide: '-1',
        base: '0',
        dropdown: '1000',
        sticky: '1100',
        fixed: '1200',
        backdrop: '1300',
        modal: '1400',
        popover: '1500',
        toast: '1600',
        tooltip: '1700',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'slide-up': 'slideInUp 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-down': 'slideInDown 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideInUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        focus: '0 0 0 3px rgba(168, 85, 247, 0.1), 0 0 0 1px rgba(168, 85, 247, 0.5)',
      },
    },
  },
  plugins: [],
}
