/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FA5252",
          dark: "#DD2476",
        },
        surface: "#0a0a0b",
        "text-primary": "#fafafa",
        "text-secondary": "#a1a1aa",
        "text-tertiary": "#71717a",
        "text-subtle": "#d4d4d8",
      },
      fontFamily: {
        sans: [
          "Inter",
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
