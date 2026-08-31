import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#071527",
          900: "#0B1E3A",
          800: "#0F2444",
          700: "#132952"
        },
        brand: {
          600: "#2563EB",
          500: "#3B82F6",
          400: "#60A5FA"
        },
        surface: {
          50: "#F5F7FA",
          200: "#E5E7EB",
          500: "#6B7280",
          ink: "#111827"
        },
        success: "#16A34A",
        "on-dark": "#9CA8C4",
        whatsapp: "#16A34A"
      },
      fontFamily: {
        display: ["Plus Jakarta Sans Variable", "Plus Jakarta Sans", "Arial", "sans-serif"],
        sans: ["Plus Jakarta Sans Variable", "Plus Jakarta Sans", "Arial", "sans-serif"]
      },
      boxShadow: {
        soft: "0 4px 20px rgba(15,23,42,0.08)",
        lifted: "0 4px 20px rgba(15,23,42,0.08)",
        header: "0 4px 20px rgba(15,23,42,0.08)"
      },
      backgroundImage: {
        "hero-overlay":
          "linear-gradient(180deg, rgba(11,30,58,0.85) 0%, rgba(11,30,58,0.2) 100%)",
        "dark-stage": "linear-gradient(145deg, #071527 0%, #0B1E3A 45%, #132952 100%)"
      }
    }
  },
  plugins: []
};

export default config;
