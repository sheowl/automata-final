/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  
  safelist: [
    "translate-x-0",
    "translate-x-full",
    "opacity-0",
    "opacity-100",
    "pointer-events-none",
    "pointer-events-auto",
  ],
  
  theme: {
    extend: {
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
      boxShadow: {
        'all-around': '0 4px 15px rgba(0, 0, 0, 0.2)',
      },

    },
  },
  plugins: [],
};
