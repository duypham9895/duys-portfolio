/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  // Kit Room was approved on browser defaults; src/styles/kit-room.css owns the base styles.
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        border: "var(--border)",
        muted: "var(--muted)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
        },
        "accent-2": {
          DEFAULT: "var(--accent-2)",
          bg: "var(--accent-2-bg)",
          border: "var(--accent-2-border)",
          text: "var(--accent-2-text)",
        },
        text: "var(--text)",
      },
      fontFamily: {
        sans: ["Archivo", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
