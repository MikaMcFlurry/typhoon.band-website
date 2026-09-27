import type { Config } from "tailwindcss";

// Version B ("stage plot") tokens live as CSS custom properties in
// src/app/globals.css and are documented in the root DESIGN.md. Tailwind
// only maps names onto them so components never hard-code colours.
// The `ink / paper / gold …` names belong to the admin area and keep their
// previous values.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Public site (stage world) ──────────────────────────────────
        deck: "rgb(var(--deck-rgb) / <alpha-value>)",
        "deck-2": "rgb(var(--deck-2-rgb) / <alpha-value>)",
        "deck-3": "rgb(var(--deck-3-rgb) / <alpha-value>)",
        chalk: "rgb(var(--chalk-rgb) / <alpha-value>)",
        "chalk-2": "rgb(var(--chalk-2-rgb) / <alpha-value>)",
        "chalk-3": "rgb(var(--chalk-3-rgb) / <alpha-value>)",
        gaffer: "rgb(var(--gaffer-rgb) / <alpha-value>)",
        orange: "rgb(var(--tape-orange-rgb) / <alpha-value>)",
        pink: "rgb(var(--tape-pink-rgb) / <alpha-value>)",
        green: "rgb(var(--tape-green-rgb) / <alpha-value>)",
        blue: "rgb(var(--tape-blue-rgb) / <alpha-value>)",
        rule: "var(--rule)",
        "rule-2": "var(--rule-2)",
        alert: "var(--alert)",

        // ── Admin area (unchanged palette) ─────────────────────────────
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
        stage: ["var(--font-stage)", "Arial Narrow", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-display)", "Georgia", "ui-serif", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        card: "var(--r-md)",
        button: "var(--r-pill)",
      },
      maxWidth: {
        container: "1360px",
        prose: "68ch",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      screens: {
        xs: "420px",
      },
    },
  },
  plugins: [],
};

export default config;
