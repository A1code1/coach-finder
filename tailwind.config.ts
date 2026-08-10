import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fff8e6",
          100: "#ffe5b4",
          500: "#ffb81c",
          600: "#ff9500",
          700: "#ff6b00",
          900: "#cc4400",
        },
        accent: {
          500: "#ff0000",
          600: "#e60000",
          700: "#cc0000",
        },
        dark: {
          bg: "#1a1a1a",
          surface: "#2d2d2d",
          card: "#3a3a3a",
          text: "#f5f5f5",
          textSecondary: "#aaaaaa",
        },
      },
      backgroundImage: {
        "athletic-gradient": "linear-gradient(90deg, #ffb81c, #ff0000)",
        "dark-gradient": "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
