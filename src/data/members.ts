export type BandMember = {
  id: string;
  name: string;
  role: string;
  photo: string;
  sortOrder: number;
};

// Source of truth: docs/03-content-facts.md
// Gold rule: Typhoon (not Taifun), Schack on Sax, Jürgen on guitar, no Daniel.
export const members: BandMember[] = [
  {
    id: "typhoon",
    name: "Typhoon",
    role: "Gesang",
    photo: "/assets/band-cards/typhoon-band-card.jpg",
    sortOrder: 1,
  },
  {
    id: "mika",
    name: "Mika",
    role: "Posaune",
    photo: "/assets/band-cards/mika-band-card.jpg",
    sortOrder: 2,
  },
  {
    id: "schack",
    name: "Schack",
    role: "Saxophon",
    photo: "/assets/members/schack-sax.jpeg",
    sortOrder: 3,
  },
  {
    id: "hardy",
    name: "Hardy",
    role: "Trompete",
    photo: "/assets/members/hardy-trumpet.jpeg",
    sortOrder: 4,
  },
  {
    id: "stefan",
    name: "Stefan",
    role: "Funk-Bass",
    photo: "/assets/members/stefan-bass.jpeg",
    sortOrder: 5,
  },
  {
    id: "tom",
    name: "Tom",
    role: "Schlagzeug",
    photo: "/assets/members/tom-drums.jpeg",
    sortOrder: 6,
  },
  {
    id: "bugra",
    name: "Buğra",
    role: "Gitarre",
    photo: "/assets/members/bugra-guitar.jpeg",
    sortOrder: 7,
  },
  {
    id: "jurgen",
    name: "Jürgen",
    role: "Gitarre",
    photo: "/assets/members/jurgen-guitar.jpeg",
    sortOrder: 8,
  },
];
