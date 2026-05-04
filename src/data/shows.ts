// Shows / Termine — until real dates land, keep TBA placeholders. We never
// invent fake events (per docs/14 + v5). When Admin/Supabase ships, this
// will read from the `shows` table.
export type Show = {
  id: string;
  day: string;
  month: string;
  year: string;
  venue: string;
  city: string;
  time: string;
};

export const upcomingShows: Show[] = [
  {
    id: "tba-1",
    day: "TBA",
    month: "2025",
    year: "",
    venue: "Neue Termine in Vorbereitung",
    city: "Deutschland",
    time: "Demnächst",
  },
  {
    id: "tba-2",
    day: "TBA",
    month: "2025",
    year: "",
    venue: "Festival-Saison",
    city: "Süddeutschland",
    time: "Demnächst",
  },
  {
    id: "tba-3",
    day: "TBA",
    month: "2025",
    year: "",
    venue: "Club-Tour",
    city: "DE / AT",
    time: "Demnächst",
  },
  {
    id: "tba-4",
    day: "TBA",
    month: "2025",
    year: "",
    venue: "Privat- & Firmenevents",
    city: "Anfrage",
    time: "Booking offen",
  },
];
