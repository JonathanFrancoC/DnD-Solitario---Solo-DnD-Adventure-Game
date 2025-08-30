/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dnd-red': '#8B0000',
        'dnd-gold': '#FFD700',
        'dnd-brown': '#8B4513',
        'dnd-dark': '#2D1810',
        'dnd-light': '#F5F5DC'
      }
    },
  },
  plugins: [],
}
