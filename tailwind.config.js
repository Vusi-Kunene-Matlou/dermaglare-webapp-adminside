// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "brand-yellow": "#F4E48E",
        "brand-teal": "#4E747B",
        "brand-gold": "#A48952", // Add this back for the light theme
      },
    },
  },
  plugins: [],
};
