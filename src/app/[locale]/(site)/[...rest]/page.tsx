import { notFound } from "next/navigation";

// Unknown paths under a locale render the styled not-found page below.
export default function CatchAll() {
  notFound();
}
