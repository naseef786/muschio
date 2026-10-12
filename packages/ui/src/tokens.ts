export const LUXURY_THEME = {
  colors: {
    accent: "#d2042d", // Crimson luxury signature
    accentHover: "#b70327",
    gold: "#D4AF37",
    light: {
      canvas: "#FFFFFF",
      surface: "#FAF9F6",
      surface2: "#F3F1EC",
      text: "#0F172A",
      muted: "#64748B",
      border: "#E2E8F0",
      borderBold: "#CBD5E1",
    },
    dark: {
      canvas: "#090D14",
      surface: "#111622",
      surface2: "#182030",
      text: "#F8FAFC",
      muted: "#94A3B8",
      border: "#1E293B",
      borderBold: "#334155",
    },
  },
  typography: {
    serif: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    sans: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
    arabic: "'Cairo', 'Tajawal', sans-serif",
  },
  regional: {
    currencies: ["AED", "SAR", "USD"] as const,
    defaultCurrency: "AED" as const,
    languages: ["en", "ar"] as const,
    defaultLanguage: "en" as const,
  },
} as const;
