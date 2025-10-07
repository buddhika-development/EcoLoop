/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // --- brand / semantic tokens ---
        brand: {
          primary: {
            DEFAULT: "#613E9C",  // primary purple
            600: "#5a3790",
            700: "#4B2F7A",
          },
          accent: {
            DEFAULT: "#16A34A",  // eco green
            600: "#15803D",
          },
        },
        surface: {
          DEFAULT: "#FFFFFF",    // surfaces
          subtle: "#F7F7FB",     // subtle bg
          foreground: "#DBDBEC", // cards/borders if needed
        },
        text: {
          DEFAULT: "#111827",    // main text
          hint: "#787F8D",       // secondary/hint text
          inverse: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
