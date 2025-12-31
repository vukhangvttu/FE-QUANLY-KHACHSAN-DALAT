const flowbiteReact = require("flowbite-react/plugin/tailwindcss");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [// Adjust the paths according to your project structure
  './src/**/*.{js,jsx,ts,tsx}', ".flowbite-react\\class-list.json"],

  theme: {
    extend: {},
  },

  plugins: [flowbiteReact]
}