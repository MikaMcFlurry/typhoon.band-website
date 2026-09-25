import { Archivo, Newsreader } from "next/font/google";

// Shared by the locale root layout and the global 404 page.
// `subsets` only controls which files are preloaded; the latin-ext faces
// (Turkish ğ ş ı İ) stay in the CSS and load on demand via unicode-range.
// Preloading just the latin files keeps the hero image (LCP) from being
// starved on slow mobile connections.
export const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal"],
  variable: "--font-newsreader",
  display: "swap",
});
