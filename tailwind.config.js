/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}', 
    './src/components/**/*.{js,ts,tsx}', 
    './src/screens/**/*.{js,ts,tsx}'  // <- Ajouté ici
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
};
