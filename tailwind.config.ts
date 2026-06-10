import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef2f3",
          100: "#fde6e9",
          200: "#f9c0c8",
          300: "#f38a98",
          400: "#ea4d62",
          500: "#E31837",
          600: "#c41430",
          700: "#a31128",
          800: "#861023",
          900: "#6f0f20",
          950: "#3d060f",
        },
        charcoal: {
          50: "#f7f7f7",
          100: "#ededed",
          200: "#d9d9d9",
          300: "#b8b8b8",
          400: "#8f8f8f",
          500: "#6b6b6b",
          600: "#4D4D4D",
          700: "#3d3d3d",
          800: "#2e2e2e",
          900: "#1f1f1f",
          950: "#141414",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(77, 77, 77, 0.1)",
        elevated: "0 12px 40px -8px rgba(227, 24, 55, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
