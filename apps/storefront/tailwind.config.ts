import type { Config } from "tailwindcss";
import preset from "@muschio/config/tailwind.preset.js";

const config: Config = {
  presets: [preset as any],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../admin/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-figtree)", "var(--font-sans)", "Figtree", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
