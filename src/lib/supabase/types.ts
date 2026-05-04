// Lightweight typed shapes for the public-readable rows. A future batch can
// replace these with generated Supabase types via `supabase gen types`.

export type AdminProfile = {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  role: "owner" | "admin" | "editor";
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  event_location: string | null;
  event_type: string | null;
  message: string;
  status: "new" | "read" | "answered" | "done" | "spam";
  ip_hash: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
};

export type SongRow = {
  id: string;
  title: string;
  slug: string;
  audio_url: string | null;
  cover_image_url: string | null;
  status: "demo" | "single" | "album_track" | "unreleased";
  is_streamable: boolean;
  is_downloadable: boolean;
  is_featured: boolean;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type MediaItem = {
  id: string;
  type: "image" | "video";
  file_url: string;
  thumbnail_url: string | null;
  category: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};
