import { absoluteUrl } from "@/lib/site-url";

// JSON-LD for the home page as one linked @graph: the website, the page,
// the band (MusicGroup with members, demos, booking contact and upcoming
// shows) and the promoter FAQ. Every value comes from live content or the
// owner-approved copy; nothing is invented here (no ratings, prices,
// reviews or dates that do not exist).

export type JsonLdShow = {
  name: string;
  startDate: string;
  venue: string;
  city: string | null;
  country: string | null;
  url: string | null;
};

export type HomeJsonLdInput = {
  locale: string;
  title: string;
  description: string;
  members: { name: string; role: string }[];
  tracks: { title: string }[];
  sameAs: string[];
  email: string;
  phone: string;
  images: string[];
  /** The visible hero image (band collage). */
  heroImage: string;
  shows: JsonLdShow[];
  faq: { q: string; a: string }[];
};

const LANGUAGES = ["de", "en", "tr"];

export function buildHomeJsonLd(input: HomeJsonLdInput): string {
  const pageUrl = absoluteUrl(`/${input.locale}`);
  const bandId = absoluteUrl("/#band");
  const siteId = absoluteUrl("/#website");
  const pageId = `${pageUrl}#webpage`;

  const band = {
    "@type": "MusicGroup",
    "@id": bandId,
    name: "Typhoon",
    alternateName: "Typhoon Band",
    url: pageUrl,
    description: input.description,
    image: input.images.map((src) => absoluteUrl(src)),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/assets/branding/typhoon-signature-gold.png"),
      width: 2099,
      height: 724,
    },
    genre: ["Blues rock", "Funk", "Soul", "Jazz", "Southern rock"],
    // Base town only: the studio name is not an owner-approved public
    // attribution yet (PRODUCT.md, "Undecided").
    location: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Hechingen",
        addressRegion: "Baden-Württemberg",
        addressCountry: "DE",
      },
    },
    email: input.email,
    telephone: input.phone.replace(/\s+/g, ""),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "booking",
      email: input.email,
      telephone: input.phone.replace(/\s+/g, ""),
      url: `${pageUrl}#booking`,
    },
    member: input.members.map((m) => ({
      "@type": "OrganizationRole",
      member: { "@type": "Person", name: m.name },
      roleName: m.role,
    })),
    ...(input.tracks.length
      ? {
          track: {
            "@type": "ItemList",
            numberOfItems: input.tracks.length,
            itemListElement: input.tracks.map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "MusicRecording",
                name: t.title,
                inLanguage: "tr",
                byArtist: { "@id": bandId },
                url: `${pageUrl}#music`,
              },
            })),
          },
        }
      : {}),
    ...(input.sameAs.length ? { sameAs: input.sameAs } : {}),
    ...(input.shows.length
      ? {
          event: input.shows.map((s) => ({
            "@type": "MusicEvent",
            name: s.name,
            startDate: s.startDate,
            eventStatus: "https://schema.org/EventScheduled",
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            location: {
              "@type": "Place",
              name: s.venue,
              address: {
                "@type": "PostalAddress",
                ...(s.city ? { addressLocality: s.city } : {}),
                ...(s.country ? { addressCountry: s.country } : {}),
              },
            },
            performer: { "@id": bandId },
            ...(s.url ? { offers: { "@type": "Offer", url: s.url } } : {}),
          })),
        }
      : {}),
  };

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": siteId,
      url: absoluteUrl("/"),
      name: "Typhoon",
      alternateName: "Typhoon Band",
      inLanguage: LANGUAGES,
      publisher: { "@id": bandId },
    },
    {
      "@type": "WebPage",
      "@id": pageId,
      url: pageUrl,
      name: input.title,
      description: input.description,
      inLanguage: input.locale,
      isPartOf: { "@id": siteId },
      about: { "@id": bandId },
      primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(input.heroImage) },
    },
    band,
  ];

  if (input.faq.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      inLanguage: input.locale,
      isPartOf: { "@id": pageId },
      mainEntity: input.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  // Escape "<" so user-provided strings can never close the script tag.
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}
