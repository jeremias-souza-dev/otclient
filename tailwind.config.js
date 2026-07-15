/** @type {import('tailwindcss').Config} */
module.exports = {
  // Aponta para todos os arquivos React/JS do projeto
  content: [
    './index.js',
    './react/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Dragon Ball OTS
        brand: {
          DEFAULT: '#F59E0B', // amber-500
          dark:    '#B45309', // amber-700
          light:   '#FCD34D', // amber-300
        },
      },
      fontFamily: {
        // Adicione fontes customizadas aqui quando incluir assets de fonte
      },
    },
  },
  plugins: [],
};
