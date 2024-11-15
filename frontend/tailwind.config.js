/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.css',
  ],
  theme: {
    darkMode: 'class', // 啟用 class 模式的深色主題
    extend: {},
  },
  plugins: [],
};
