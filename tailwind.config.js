/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './src/components/**/*.{js,ts,tsx}',
    './src/**/**/*.{js,ts,tsx}'
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Baloo2-Regular'],
        'baloo': ['Baloo2-Regular'],
        'baloo-medium': ['Baloo2-Medium'],
        'baloo-semibold': ['Baloo2-SemiBold'],
        'baloo-bold': ['Baloo2-Bold'],
        'baloo-extrabold': ['Baloo2-ExtraBold'],
      },
    },
  },
  plugins: [],
};
