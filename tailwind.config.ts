import type { Config } from "tailwindcss";

// Design tokens live as CSS custom properties in src/app/globals.css and are
// documented in docs/design/DESIGN.md. Tailwind only maps names onto them so
// components never hard-code colours.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Channel tokens so Tailwind opacity modifiers work (bg-ink/80).
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        "ink-2": "rgb(var(--ink-2-rgb) / <alpha-value>)",
        "ink-3": "rgb(var(--ink-3-rgb) / <alpha-value>)",
        paper: "rgb(var(--paper-rgb) / <alpha-value>)",
        "paper-2": "rgb(var(--paper-2-rgb) / <alpha-value>)",
        "paper-3": "rgb(var(--paper-3-rgb) / <alpha-value>)",
        gold: "rgb(var(--gold-rgb) / <alpha-value>)",
        "gold-hi": "rgb(var(--gold-hi-rgb) / <alpha-value>)",
        "gold-lo": "rgb(var(--gold-lo-rgb) / <alpha-value>)",
        oxblood: "rgb(var(--oxblood-rgb) / <alpha-value>)",
        "on-gold": "var(--on-gold)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        // Legacy aliases still used by the admin area.
        bg: "var(--bg)",
        "bg-2": "var(--bg-2)",
        "bg-3": "var(--bg-3)",
        panel: "var(--panel)",
        bronze: "var(--bronze)",
        "deep-gold": "var(--deep-gold)",
        "gold-soft": "var(--gold-soft)",
        cream: "var(--cream)",
        "muted-cream": "var(--muted-cream)",
        muted: "var(--muted)",
      },
      borderColor: {
        line: "var(--line)",
        "line-2": "var(--line-2)",
      },
      fontFamily: {
        display: ["var(--font-newsreader)", "Georgia", "ui-serif", "serif"],
        sans: ["var(--font-archivo)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        card: "var(--r-md)",
        button: "var(--r-pill)",
      },
      maxWidth: {
        container: "1320px",
        prose: "68ch",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      screens: {
        xs: "420px",
      },
    },
  },
  plugins: [],
};

export default config;
