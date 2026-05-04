import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        "bg-3": "var(--bg-3)",
        panel: "var(--panel)",
        bronze: "var(--bronze)",
        "deep-gold": "var(--deep-gold)",
        gold: "var(--gold)",
        "gold-soft": "var(--gold-soft)",
        cream: "var(--cream)",
        "muted-cream": "var(--muted-cream)",
        muted: "var(--muted)",
      },
      fontFamily: {
        display: ["Georgia", "Times New Roman", "ui-serif", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
        button: "7px",
      },
      maxWidth: {
        container: "1180px",
      },
    },
  },
  plugins: [],
};

export default config;
