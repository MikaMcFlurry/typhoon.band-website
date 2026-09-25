import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Typhoon",
    short_name: "Typhoon",
    description: "Bluesrock, Funk, Soul, Jazz & Southern Rock mit türkischen Texten.",
    start_url: "/",
    display: "standalone",
    background_color: "#0e0a07",
    theme_color: "#0e0a07",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
