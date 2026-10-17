export const LUXURY_THEME = {
  colors: {
    ivory: "#F8F7F3",
    white: "#FFFFFF",
    nearBlack: "#171917",
    olive: "#46513B",
    mutedStone: "#77776F",
    fineBorder: "#E6E4DE",
    accent: "#46513B", // Refined olive accent
    accentHover: "#353E2D",
    light: {
      canvas: "#F8F7F3",
      surface: "#FFFFFF",
      surface2: "#F3F1EC",
      text: "#171917",
      muted: "#77776F",
      border: "#E6E4DE",
      borderBold: "#D4D1C8",
    },
    dark: {
      canvas: "#121412",
      surface: "#1A1D1A",
      surface2: "#222622",
      text: "#F8F7F3",
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

