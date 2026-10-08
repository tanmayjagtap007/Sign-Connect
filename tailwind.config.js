/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: { DEFAULT: "#f8f9fc", dark: "#11131b" },
        ink: { DEFAULT: "#171923", dark: "#f1f2f7" },
        surface: { DEFAULT: "#ffffff", dark: "#1b1d27" },
        muted: { DEFAULT: "#6b7082", dark: "#a0a4b5" },
        border: { DEFAULT: "#e3e5ed", dark: "#343745" },
        brand: {
          50: "#f1f1ff",
          200: "#c9caff",
          500: "#4f55d6",
          600: "#4147c4",
          700: "#32389f",
        },
        good: "#16845b",
        bad: "#c43b4a",
      },
      borderRadius: {
        card: "0.875rem",
      },
    },
  },
  plugins: [],
};
