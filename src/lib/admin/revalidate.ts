import "server-only";

import { revalidatePath } from "next/cache";

import { LOCALES } from "@/i18n/locales";

// After an Admin change, refresh the public home page in every language,
// not only in the Admin's current locale (otherwise EN/TR would show the
// old content until the page's ISR window runs out).
export function revalidatePublicHome() {
  for (const l of LOCALES) revalidatePath(`/${l}`);
}
