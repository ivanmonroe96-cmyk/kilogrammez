/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#2D2926",
          white: "#ffffff",
          green: "#BEDE18",
          "green-dark": "#a8c816",
          yellow: "#F5D93F",
          blue: "#6D7BD3",
          orange: "#FF671D",
          red: "#FF5A67",
          rose: "#F6A7D7",
          teal: "#19D3C5",
          gray: {
            DEFAULT: "#959595",
            50: "#fafafa",
            100: "#f5f5f5",
            200: "#e5e5e5",
            300: "#DADADA",
            400: "#959595",
            500: "#737373",
            600: "#525252",
            700: "#404040",
            800: "#363330",
            900: "#2D2926",
            950: "#1a1715",
          },
          lightgray: "#DADADA",
        },
      },
      fontFamily: {
        mdio: ["MDIO", "sans-serif"],
        title: ['"Bebas Neue"', "arial", "sans-serif"],
        rainer: ['"Bebas Neue"', "arial", "sans-serif"],
        sans: ["MDIO", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["2.625rem", { lineHeight: "1.1" }],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      maxWidth: {
        "8xl": "88rem",
      },
    },
  },
  plugins: [],
};
