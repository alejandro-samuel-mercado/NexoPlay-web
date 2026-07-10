/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Claymorfismo + Brutalismo palette
        clay: {
          red: '#FF6B6B',
          yellow: '#FFE66D',
          teal: '#4ECDC4',
          mint: '#A8E6CF',
          orange: '#FF8C42',
          purple: '#C084FC',
          blue: '#60A5FA',
          pink: '#F472B6',
          cream: '#FFF9F0',
          dark: '#1A1A2E',
          darker: '#0F0F1A',
          ink: '#2C2C2C',
          gray: '#6B7280',
        },
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        clay: '4px 4px 0px #2C2C2C',
        'clay-lg': '6px 6px 0px #2C2C2C',
        'clay-xl': '8px 8px 0px #2C2C2C',
        'clay-sm': '2px 2px 0px #2C2C2C',
        'clay-color-red': '4px 4px 0px #FF6B6B',
        'clay-color-teal': '4px 4px 0px #4ECDC4',
        'clay-color-yellow': '4px 4px 0px #FFE66D',
      },
      borderWidth: {
        3: '3px',
      },
      borderRadius: {
        clay: '16px',
        'clay-lg': '24px',
        'clay-xl': '32px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 0.3s ease-in-out',
        'pop': 'pop 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'bounce-clay': 'bounceClay 0.6s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-clay': 'pulseClay 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        bounceClay: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseClay: {
          '0%, 100%': { boxShadow: '4px 4px 0px #2C2C2C' },
          '50%': { boxShadow: '6px 6px 0px #2C2C2C' },
        },
      },
    },
  },
  plugins: [],
};
