export type BandMember = {
  id: string;
  name: string;
  role: string;
  photo: string;
  /** Short editorial bio per docs/typhoon-design-fix-v5.md §5. */
  bio: string;
  /** Mark members where the photo is a stand-in until a real shot ships. */
  isPlaceholder?: boolean;
  sortOrder: number;
};

// Source of truth: docs/03-content-facts.md and docs/typhoon-design-fix-v5.md.
// Gold rule: Typhoon (not Taifun), Schack on Sax, Jürgen on guitar, no Daniel.
export const members: BandMember[] = [
  {
    id: "typhoon",
    name: "Typhoon",
    role: "Gesang",
    photo: "/assets/band-cards/typhoon-band-card.jpg",
    bio: "Frontmann, türkischsprachige Texte und direkte Energie im Zentrum der Band.",
    sortOrder: 1,
  },
  {
    id: "mika",
    name: "Mika",
    role: "Posaune",
    photo: "/assets/band-cards/mika-band-card.jpg",
    bio: "Junger Posaunen-Sound, rauer Live-Charakter und warme Brass-Linien.",
    sortOrder: 2,
  },
  {
    id: "schack",
    name: "Schack",
    role: "Saxophon",
    photo: "/assets/members/schack-sax.jpeg",
    bio: "Erfahrung, warme Linien und ein souliger Ton für die Bläsersektion.",
    isPlaceholder: true,
    sortOrder: 3,
  },
  {
    id: "hardy",
    name: "Hardy",
    role: "Trompete",
    photo: "/assets/members/hardy-trumpet.jpeg",
    bio: "Markante Brass-Stimme zwischen Funk, Bluesrock und Bühnen-Druck.",
    isPlaceholder: true,
    sortOrder: 4,
  },
  {
    id: "stefan",
    name: "Stefan",
    role: "Funk-Bass",
    photo: "/assets/members/stefan-bass.jpeg",
    bio: "Groovendes Fundament, präziser Druck und warme Tiefe.",
    isPlaceholder: true,
    sortOrder: 5,
  },
  {
    id: "tom",
    name: "Tom",
    role: "Schlagzeug",
    photo: "/assets/members/tom-drums.jpeg",
    bio: "Treibender Puls, Live-Energie und rhythmische Stabilität.",
    isPlaceholder: true,
    sortOrder: 6,
  },
  {
    id: "bugra",
    name: "Buğra",
    role: "Gitarre",
    photo: "/assets/members/bugra-guitar.jpeg",
    bio: "Gitarrenlinien mit türkischer Prägung, Groove und melodischer Spannung.",
    isPlaceholder: true,
    sortOrder: 7,
  },
  {
    id: "jurgen",
    name: "Jürgen",
    role: "Gitarre",
    photo: "/assets/members/jurgen-guitar.jpeg",
    bio: "Gitarrensound zwischen Rhythmus, Wärme und rockiger Kante.",
    isPlaceholder: true,
    sortOrder: 8,
  },
];
