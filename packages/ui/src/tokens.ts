export const LUXURY_THEME = {
  colors: {
    ivory: "#FFFFFF",
    white: "#FFFFFF",
    nearBlack: "#171917",
    olive: "#46513B",
    mutedStone: "#737373",
    fineBorder: "#E8E8E8",
    accent: "#46513B", // Refined olive accent
    accentHover: "#353E2D",
    light: {
      canvas: "#FFFFFF",
      surface: "#FFFFFF",
      surface2: "#F7F7F8",
      text: "#171917",
      muted: "#737373",
      border: "#E8E8E8",
      borderBold: "#D4D4D4",
    },
    dark: {
      canvas: "#121412",
      surface: "#1A1D1A",
      surface2: "#222622",
      text: "#FFFFFF",
      muted: "#9E9E96",
      border: "#2C312C",
      borderBold: "#3E453E",
    },
  },
  typography: {
    serif: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    arabic: "'Cairo', 'Tajawal', sans-serif",
  },
  regional: {
    currencies: ["AED", "SAR", "USD"] as const,
    defaultCurrency: "AED" as const,
    languages: ["en", "ar"] as const,
    defaultLanguage: "en" as const,
  },
} as const;

