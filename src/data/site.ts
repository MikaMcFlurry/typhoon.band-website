// Source: docs/03-content-facts.md + docs/14-old-site-content-and-ui-fix.md
export const site = {
  brand: {
    name: "Typhoon",
    tagline: "Bluesrock · Funk · Soul · Jazz · Southern Rock",
    genreLine: "BLUESROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK",
  },
  hero: {
    line1: "SMOOTH.",
    line2: "EXZEPTIONELL.",
    line3: "FUNK.",
    description:
      "Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock – kraftvoll, warm und live voller Energie.",
    ctaListen: "Songs anhören",
    ctaBook: "Booking Anfrage",
    ctaLive: "Live erleben",
  },
  about: {
    eyebrow: "Typhoon",
    headline:
      "Amerikanisches Feeling. Europäische Seele. Türkische Texte.",
    lead:
      "Typhoon präsentiert einen kraftvollen Mix aus Bluesrock, Funk, Soul, Jazz und Southern Rock mit amerikanisch-europäischem Sound. Selbstkomponierte Songs verbinden markante Blues-Riffs, funkige Grooves, soulige Melodien und jazzige Finessen. Türkischsprachige Texte geben den Songs Tiefe und kulturelle Eigenständigkeit.",
    body:
      "Typhoon sprengt Genregrenzen, ohne die eigene Handschrift zu verlieren: markante Blues-Riffs, funkige Grooves, soulige Melodien, jazzige Finessen und türkischsprachige Texte. Eine erfahrene Band, die live sofort zündet.",
    cta: "Mehr über die Band",
  },
  contact: {
    // Only booking@typhoon.band is active for now; info@typhoon.band is
    // not yet provisioned and is intentionally not exposed anywhere.
    booking: "booking@typhoon.band",
    phone: "+49 176 64472296",
  },
  social: {
    instagram: "",
    facebook: "",
    youtube: "",
    spotify: "",
    soundcloud: "",
    bandcamp: "",
  },
  imprint: {
    name: "Mika Hertler",
    street: "Am Schwarzen Steg 5a",
    city: "95448 Bayreuth",
    country: "Deutschland",
  },
  bookingDisabledNotice: "Booking-Versand wird im nächsten Batch angebunden.",
} as const;
