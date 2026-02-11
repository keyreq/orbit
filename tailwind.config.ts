import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        orbit: {
          900: '#0B0C15',
          800: '#13141F',
          700: '#1C1E2D',
          600: '#2A2D3F',
          accent: '#6366F1', // Indigo 500
          success: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
}

export default config
