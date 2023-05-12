/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './packages/**/*.tsx',
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      keyframes: {
        shake: {
          '0%': {
            transform: 'translateX(0)',
          },
          '25%': {
            transform: 'translateX(0.5rem)',
          },
          '75%': {
            transform: 'translateX(-0.5rem)',
          },
          '100%': {
            transform: 'translateX(0)',
          },
        },
      },
      animation: {
        snake: 'shake 0.2s ease-in-out 0s 2',
      },
    },
  },
};
