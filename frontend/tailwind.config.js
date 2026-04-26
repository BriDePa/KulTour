/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
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
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        display: ["'Syne'", "'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)",
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)",
        "card-hover": "0 4px 6px rgba(0,0,0,0.07), 0 16px 32px rgba(0,0,0,0.12)",
        glow: "0 0 0 3px rgba(26,79,255,0.15)",
        "glow-green": "0 0 0 3px rgba(16,185,129,0.15)",
        "glow-orange": "0 0 0 3px rgba(255,144,0,0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-up": "fadeUp 0.6s ease-out",
        "slide-in": "slideIn 0.4s ease-out",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-pattern":
          "radial-gradient(ellipse at 20% 50%, rgba(26,79,255,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(16,185,129,0.12) 0%, transparent 50%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
