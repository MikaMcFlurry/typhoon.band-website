import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Unknown paths under a locale render the styled not-found page. The same
// metadata as not-found.tsx is set on the matched route as well, so the
// head stays "404" (noindex, no canonical) after the client takes over.
export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
};

export default function CatchAll() {
  notFound();
}
