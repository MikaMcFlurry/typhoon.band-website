export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
};

// Uses the 8 uploaded gallery JPGs in public/assets/gallery/.
export const gallery: GalleryItem[] = [
  { id: "g1", src: "/assets/gallery/gallery-1.jpg", alt: "Typhoon live, Foto 1" },
  { id: "g2", src: "/assets/gallery/gallery-2.jpg", alt: "Typhoon live, Foto 2" },
  { id: "g3", src: "/assets/gallery/gallery-3.jpg", alt: "Typhoon live, Foto 3" },
  { id: "g4", src: "/assets/gallery/gallery-4.jpg", alt: "Typhoon live, Foto 4" },
  { id: "g5", src: "/assets/gallery/gallery-5.jpg", alt: "Typhoon live, Foto 5" },
  { id: "g6", src: "/assets/gallery/gallery-6.jpg", alt: "Typhoon live, Foto 6" },
  { id: "g7", src: "/assets/gallery/gallery-7.jpg", alt: "Typhoon live, Foto 7" },
  { id: "g8", src: "/assets/gallery/gallery-8.jpg", alt: "Typhoon live, Foto 8" },
];
