import { getDict } from "@/i18n/dictionaries";
import { fill } from "@/i18n/dictionaries";
import { getPublicPageContent } from "@/lib/content";
import { absoluteUrl } from "@/lib/site-url";

// /llms.txt: a plain-text summary for AI answer engines and assistants
// (llmstxt.org). Built from the same live content and owner-approved copy
// as the page, so it can never claim more than the site does.
export const revalidate = 3600;

export async function GET() {
  const de = getDict("de");
  const en = getDict("en");
  const content = await getPublicPageContent("en");
  const count = content.members.length;
  const email = content.siteSettings.contactBookingEmail;
  const phone = content.siteSettings.contactPhone;

  const lines = [
    "# Typhoon",
    "",
    `> ${en.meta.description}`,
    "",
    en.about.body,
    "",
    "## Facts for promoters",
    ...en.booking.facts.map((f) => `- ${f.label}: ${fill(f.value, { count })}`),
    `- Booking: ${email}, ${phone} (${en.booking.reply})`,
    "",
    "## Line-up",
    ...content.members.map((m) => `- ${m.name}: ${m.role}`),
    "",
    "## Demos (stream on the website, no downloads)",
    ...content.songs.map((s) => `- ${s.title}`),
    "",
    "## Questions from promoters",
    ...en.faq.items.flatMap((f) => [`### ${f.q}`, fill(f.a, { count }), ""]),
    "## Pages",
    `- [Typhoon (Deutsch)](${absoluteUrl("/de")}): ${de.meta.description}`,
    `- [Typhoon (English)](${absoluteUrl("/en")}): ${en.meta.description}`,
    `- [Typhoon (Türkçe)](${absoluteUrl("/tr")})`,
    `- [Booking request](${absoluteUrl("/en#booking")})`,
    `- [Imprint](${absoluteUrl("/de/legal/imprint")})`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
