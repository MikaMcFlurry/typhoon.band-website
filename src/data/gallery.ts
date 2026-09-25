import type { Locale } from "@/i18n/locales";

export type GalleryItem = {
  id: string;
  src: string;
  alt: Record<Locale, string>;
};

// The 8 uploaded gallery JPGs in public/assets/gallery/. Alt texts describe
// what is actually in each picture (the old "Typhoon live, Foto N" labels
// were wrong for the rehearsal-room shots). Order keeps the two wide
// rehearsal-room shots (g2, g7) apart at every width.
export const gallery: GalleryItem[] = [
  {
    id: "g2",
    src: "/assets/gallery/gallery-2.jpg",
    alt: {
      de: "Proberaum mit Schlagzeug, Gitarren und Perserteppichen",
      en: "Rehearsal room with drums, guitars and Persian rugs",
      tr: "Davul, gitarlar ve İran halılarıyla prova odası",
    },
  },
  {
    id: "g4",
    src: "/assets/gallery/gallery-4.jpg",
    alt: {
      de: "Stratocaster auf einer Hammond-Orgel, schwarz-weiß",
      en: "Stratocaster resting on a Hammond organ, black and white",
      tr: "Hammond org üzerinde Stratocaster, siyah beyaz",
    },
  },
  {
    id: "g5",
    src: "/assets/gallery/gallery-5.jpg",
    alt: {
      de: "Typhoon singt live auf der Bühne",
      en: "Typhoon singing live on stage",
      tr: "Typhoon sahnede canlı söylüyor",
    },
  },
  {
    id: "g8",
    src: "/assets/gallery/gallery-8.jpg",
    alt: {
      de: "Hammond-Orgel im Proberaum",
      en: "Hammond organ in the rehearsal room",
      tr: "Prova odasında Hammond org",
    },
  },
  {
    id: "g1",
    src: "/assets/gallery/gallery-1.jpg",
    alt: {
      de: "Nord-Keyboards und Hammond-Orgel im Proberaum",
      en: "Nord keyboards and a Hammond organ in the rehearsal room",
      tr: "Prova odasında Nord klavyeler ve Hammond org",
    },
  },
  {
    id: "g6",
    src: "/assets/gallery/gallery-6.jpg",
    alt: {
      de: "Proberaum mit Saz, Verstärkern und Instrumenten",
      en: "Rehearsal room with a saz, amplifiers and instruments",
      tr: "Saz, amfiler ve enstrümanlarla prova odası",
    },
  },
  {
    id: "g7",
    src: "/assets/gallery/gallery-7.jpg",
    alt: {
      de: "Blick in den Proberaum mit Bühne und Instrumenten",
      en: "View of the rehearsal room with stage and instruments",
      tr: "Sahne ve enstrümanlarla prova odasına bakış",
    },
  },
  {
    id: "g3",
    src: "/assets/gallery/gallery-3.jpg",
    alt: {
      de: "Typhoon-Plakat: Collage der Band mit goldenem Schriftzug",
      en: "Typhoon poster: band collage with the gold signature",
      tr: "Typhoon afişi: altın imzalı grup kolajı",
    },
  },
];
