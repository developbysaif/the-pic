/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          bg: "#E5E8CE",
          primary: "#789575",
          ivory: "#FEFEF8",
          dark: "#263323",
          soft: "#D4DBC0",
          muted: "#AAB99F",
          warm: "#F2F0E7",
          accent: "#567053",
          light: "#F7F8F0",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(38, 51, 35, 0.06)',
        'soft': '0 10px 30px -5px rgba(38, 51, 35, 0.08), 0 4px 12px -2px rgba(38, 51, 35, 0.04)',
        'soft-lg': '0 20px 40px -10px rgba(38, 51, 35, 0.12), 0 8px 16px -4px rgba(38, 51, 35, 0.06)',
        'float': '0 25px 50px -12px rgba(38, 51, 35, 0.18)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
module.exports = config;
