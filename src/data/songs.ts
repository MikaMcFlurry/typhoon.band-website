export type Song = {
  id: string;
  title: string;
  src: string;
  /** Fallback artwork until real covers are uploaded in Admin → Music. */
  cover: string;
  /** Seconds, read from the MP3 header (shown before playback). */
  durationSeconds: number;
  sortOrder: number;
};

// Source: docs/03-content-facts.md and the demo MP3s under public/assets/audio/demos.
// Demo file names there are slightly different from the canonical track titles
// (e.g. "Sen-Benim.mp3" vs "*-demo.mp3"); the mapping below uses the actual
// shipped filenames so the player loads real audio.
export const songs: Song[] = [
  {
    id: "sen-benim",
    title: "Sen Benim",
    src: "/assets/audio/demos/Sen-Benim.mp3",
    cover: "/assets/hero/hero-collage.jpeg",
    durationSeconds: 335.14,
    sortOrder: 1,
  },
  {
    id: "karanfil",
    title: "Karanfil",
    src: "/assets/audio/demos/karanfil-demo.mp3",
    cover: "/assets/gallery/gallery-6.jpg",
    durationSeconds: 329.99,
    sortOrder: 2,
  },
  {
    id: "gece-yine-dustun",
    title: "Gece Yine Düştün",
    src: "/assets/audio/demos/gece-yine-dustun-demo.mp3",
    cover: "/assets/gallery/gallery-2.jpg",
    durationSeconds: 545.06,
    sortOrder: 3,
  },
  {
    id: "farksilin",
    title: "Farksilin",
    src: "/assets/audio/demos/farksilin-demo.mp3",
    cover: "/assets/gallery/gallery-4.jpg",
    durationSeconds: 242.12,
    sortOrder: 4,
  },
  {
    id: "cilgin",
    title: "Çılgın",
    src: "/assets/audio/demos/cilgin-demo.mp3",
    cover: "/assets/gallery/gallery-1.jpg",
    durationSeconds: 200.87,
    sortOrder: 5,
  },
  {
    id: "bir-tek-sen",
    title: "Bir Tek Sen",
    src: "/assets/audio/demos/bir-tek-sen-demo.mp3",
    cover: "/assets/gallery/gallery-8.jpg",
    durationSeconds: 214.35,
    sortOrder: 6,
  },
];

export const featuredSong: Song = songs[0];
