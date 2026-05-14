/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["DM Sans", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Kultour brand palette
        brand: {
          blue: {
            50:  "#EEF3FF",
            100: "#D9E3FF",
            200: "#B3C7FF",
            300: "#7DA1FF",
            400: "#4975FF",
            500: "#1A4FFF",
            600: "#1040E0",
            700: "#0C30B8",
            800: "#0B2490",
            900: "#0A1C6E",
            950: "#060E40",
          },
          green: {
            50:  "#EDFDF5",
            100: "#D1FAE5",
            200: "#A7F3D0",
            300: "#6EE7B7",
            400: "#34D399",
            500: "#10B981",
            600: "#059669",
            700: "#047857",
            800: "#065F46",
            900: "#064E3B",
          },
          orange: {
            50:  "#FFF8ED",
            100: "#FFEFD3",
            200: "#FFDB9A",
            300: "#FFC461",
            400: "#FFAA29",
            500: "#FF9000",
            600: "#E07200",
            700: "#BA5500",
            800: "#933F00",
            900: "#7A3200",
          },
        },
        // Neutral slate
        surface: {
          50:  "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
        // Dark mode specific surface colors (with more contrast)
        "surface-dark": {
          50:  "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#1E293B",
          800: "#0F172A",
          900: "#020617",
        },
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)",
        "soft-dark": "0 2px 15px -3px rgba(0,0,0,0.3), 0 10px 20px -2px rgba(0,0,0,0.2)",
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)",
        "card-dark": "0 1px 3px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.3)",
        "card-hover": "0 4px 6px rgba(0,0,0,0.07), 0 16px 32px rgba(0,0,0,0.12)",
        "card-hover-dark": "0 4px 6px rgba(0,0,0,0.25), 0 16px 32px rgba(0,0,0,0.35)",
        glow: "0 0 0 3px rgba(26,79,255,0.15)",
        "glow-dark": "0 0 0 3px rgba(26,79,255,0.3)",
        "glow-green": "0 0 0 3px rgba(16,185,129,0.15)",
        "glow-green-dark": "0 0 0 3px rgba(16,185,129,0.3)",
        "glow-orange": "0 0 0 3px rgba(255,144,0,0.15)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-pattern":
          "radial-gradient(ellipse at 20% 50%, rgba(26,79,255,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.12) 0%, transparent 50%)",
        "hero-pattern-dark":
          "radial-gradient(ellipse at 20% 50%, rgba(26,79,255,0.25) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.2) 0%, transparent 50%)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};
