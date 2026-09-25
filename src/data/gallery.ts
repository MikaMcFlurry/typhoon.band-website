import type { Locale } from "@/i18n/locales";

export type GalleryItem = {
  id: string;
  src: string;
  alt: Record<Locale, string>;
};

// The 8 uploaded gallery JPGs in public/assets/gallery/. Alt texts describe
// what is actually in each picture (the old "Typhoon live, Foto N" labels
// were wrong for the rehearsal-room shots). Order keeps the two wide
// Only distinct frames: g7 repeats g2, g5 is the band-info photo and g3
// is the band poster shown in Termine, so they are not repeated here.
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
    id: "g1",
    src: "/assets/gallery/gallery-1.jpg",
    alt: {
      de: "Nord-Keyboards und Hammond-Orgel im Proberaum",
      en: "Nord keyboards and a Hammond organ in the rehearsal room",
      tr: "Prova odasında Nord klavyeler ve Hammond org",
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
    id: "g6",
    src: "/assets/gallery/gallery-6.jpg",
    alt: {
      de: "Proberaum mit Saz, Verstärkern und Instrumenten",
      en: "Rehearsal room with a saz, amplifiers and instruments",
      tr: "Saz, amfiler ve enstrümanlarla prova odası",
    },
  },
];
