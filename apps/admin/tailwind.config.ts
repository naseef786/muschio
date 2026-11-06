import type { Config } from "tailwindcss";
import preset from "@muschio/config/tailwind.preset.js";

const config: Config = {
  presets: [preset as any],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Figtree", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ["Figtree", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
