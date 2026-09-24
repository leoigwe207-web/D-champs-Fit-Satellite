import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B0B",
        ink2: "#121212",
        gold: {
          DEFAULT: "#D9A441",
          light: "#F1D99B",
          dark: "#B27F22",
        },
        cream: "#F1D99B",
        accent: "#2563EB",
      },
      fontFamily: {
        display: ['"Bebas Neue"', "Oswald", "Impact", "sans-serif"],
        body: ["Inter", "Manrope", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 60px rgba(37, 99, 235, 0.22)",
        gold: "0 10px 40px rgba(217, 164, 65, 0.25)",
      },
      letterSpacing: {
        wider2: "0.08em",
      },
    },
  },
  plugins: [],
};

export default config;
