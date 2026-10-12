/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#d2042d",
          hover: "#b70327",
          subtle: "rgba(210, 4, 45, 0.08)",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#F3E5AB",
          dark: "#AA7A1E",
        },
        luxury: {
          canvas: "var(--bg-canvas)",
          surface: "var(--bg-surface)",
          surface2: "var(--bg-surface-2)",
          text: "var(--text-primary)",
          muted: "var(--text-muted)",
          border: "var(--border-subtle)",
          borderBold: "var(--border-bold)",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Playfair Display", "serif"],
        sans: ["var(--font-sans)", "Inter", "Plus Jakarta Sans", "sans-serif"],
        arabic: ["var(--font-arabic)", "Cairo", "Tajawal", "sans-serif"],
      },
      letterSpacing: {
        luxury: "0.2em",
        editorial: "0.1em",
      },
      boxShadow: {
        luxury: "0 10px 30px -10px rgba(0, 0, 0, 0.05)",
        "luxury-dark": "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
        glow: "0 0 25px rgba(210, 4, 45, 0.25)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
