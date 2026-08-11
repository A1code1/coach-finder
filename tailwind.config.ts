import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Trusted Marketplace design system — navy + blue CTA, generated with
        // ui-ux-pro-max (design-system/coach-finder/MASTER.md is the source of truth).
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          400: "#38bdf8",
          500: "#0284c7",
          600: "#0369a1", // --color-accent (CTA)
          700: "#075985",
          900: "#0f172a", // --color-primary (navy)
        },
        accent: {
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626", // --color-destructive
        },
        dark: {
          bg: "#f8fafc",
          surface: "#f1f5f9",
          card: "#ffffff",
          text: "#020617",
          textSecondary: "#475569",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "Open Sans", "-apple-system", "sans-serif"],
        heading: ["var(--font-heading)", "Poppins", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        sm: "0 1px 2px rgba(15, 23, 42, 0.05)",
        md: "0 4px 6px rgba(15, 23, 42, 0.1)",
        lg: "0 10px 15px rgba(15, 23, 42, 0.1)",
        xl: "0 20px 25px rgba(15, 23, 42, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
