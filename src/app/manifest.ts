import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Typhoon",
    short_name: "Typhoon",
    description: "Bluesrock, Funk, Soul, Jazz & Southern Rock mit türkischen Texten.",
    // Straight to the default locale (no redirect hop on launch).
    start_url: "/de",
    lang: "de",
    display: "standalone",
    background_color: "#121110",
    theme_color: "#121110",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
