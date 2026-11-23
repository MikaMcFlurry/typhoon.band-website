import type { Metadata } from "next";
import { NotFoundView } from "@/components/site/NotFoundView";

// Rendered for unknown paths under a locale (HTTP 404, noindex). Its own
// title and no canonical/hreflang: the layout's point at the home page.
export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <NotFoundView />;
}
