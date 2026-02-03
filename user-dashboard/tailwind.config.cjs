/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Enhanced Dark Theme Colors
        'bg-primary': '#0b0f1a',
        'bg-secondary': '#12171f',
        'bg-tertiary': '#1a202e',
        'bg-card': 'rgba(17, 24, 39, 0.6)',
        
        // Accent Colors
        'accent-primary': '#6366f1',
        'accent-secondary': '#8b5cf6',
        'accent-tertiary': '#ec4899',
        'accent-success': '#10b981',
        'accent-warning': '#f59e0b',
        'accent-error': '#ef4444',
        
        // Text Colors
        'text-primary': '#f9fafb',
        'text-secondary': '#d1d5db',
        'text-tertiary': '#9ca3af',
        'text-muted': '#6b7280',
        
        // Status Colors
        'status-running': '#10b981',
        'status-pending': '#f59e0b',
        'status-error': '#ef4444',
        'status-unknown': '#6b7280',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'animated-bg': 'radial-gradient(ellipse at top right, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(139, 92, 246, 0.1) 0%, transparent 50%), linear-gradient(135deg, #0b0f1a 0%, #12171f 50%, #0b0f1a 100%)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      boxShadow: {
        'glass': '0 10px 15px -3px rgba(0, 0, 0, 0.6)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'spin-slow': 'spin 1s linear infinite',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
