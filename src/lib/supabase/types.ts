// Manually maintained Database type for the public schema. Mirrors
// `supabase/migrations/0001_init.sql` plus the additive
// `0002_supabase_foundation.sql` and `0004_admin_password_flow.sql`
// changes (TBA shows, media alt/title, site_settings.locale/is_public,
// booking_requests.locale, admin_profiles.must_change_password +
// password_changed_at).
//
// `Relationships: []` is intentionally empty: nested PostgREST joins are
// avoided in favour of explicit two-step queries. A future Admin phase
// can replace this whole file with `supabase gen types`.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type AdminRole = "owner" | "admin" | "editor";
type SongStatus = "demo" | "single" | "album_track" | "unreleased";
type BookingStatus = "new" | "read" | "answered" | "done" | "spam";
type MediaType = "image" | "video";

export type Database = {
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          email: string | null;
          role: AdminRole;
          is_active: boolean;
          must_change_password: boolean;
          password_changed_at: string | null;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string | null;
          email?: string | null;
          role?: AdminRole;
          is_active?: boolean;
          must_change_password?: boolean;
          password_changed_at?: string | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          display_name?: string | null;
          email?: string | null;
          role?: AdminRole;
          is_active?: boolean;
          must_change_password?: boolean;
          password_changed_at?: string | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          locale: string | null;
          is_public: boolean;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          locale?: string | null;
          is_public?: boolean;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          locale?: string | null;
          is_public?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      platform_links: {
        Row: {
          id: string;
          platform: string;
          url: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          platform: string;
          url: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          platform?: string;
          url?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      legal_pages: {
        Row: {
          id: string;
          slug: string;
          is_published: boolean;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          is_published?: boolean;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          is_published?: boolean;
          updated_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      legal_page_translations: {
        Row: {
          id: string;
          legal_page_id: string;
          locale: string;
          title: string;
          body_md: string;
        };
        Insert: {
          id?: string;
          legal_page_id: string;
          locale: string;
          title: string;
          body_md: string;
        };
        Update: {
          id?: string;
          legal_page_id?: string;
          locale?: string;
          title?: string;
          body_md?: string;
        };
        Relationships: [];
      };
      band_members: {
        Row: {
          id: string;
          slug: string;
          photo_url: string | null;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          photo_url?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          photo_url?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      band_member_translations: {
        Row: {
          id: string;
          band_member_id: string;
          locale: string;
          name: string;
          role: string;
          bio_md: string | null;
        };
        Insert: {
          id?: string;
          band_member_id: string;
          locale: string;
          name: string;
          role: string;
          bio_md?: string | null;
        };
        Update: {
          id?: string;
          band_member_id?: string;
          locale?: string;
          name?: string;
          role?: string;
          bio_md?: string | null;
        };
        Relationships: [];
      };
      songs: {
        Row: {
          id: string;
          title: string;
          slug: string;
          audio_url: string | null;
          cover_image_url: string | null;
          status: SongStatus;
          is_streamable: boolean;
          is_downloadable: boolean;
          is_featured: boolean;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          audio_url?: string | null;
          cover_image_url?: string | null;
          status?: SongStatus;
          is_streamable?: boolean;
          is_downloadable?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          audio_url?: string | null;
          cover_image_url?: string | null;
          status?: SongStatus;
          is_streamable?: boolean;
          is_downloadable?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      shows: {
        Row: {
          id: string;
          starts_at: string | null;
          is_tba: boolean;
          venue: string;
          city: string | null;
          country: string | null;
          ticket_url: string | null;
          is_visible: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          starts_at?: string | null;
          is_tba?: boolean;
          venue: string;
          city?: string | null;
          country?: string | null;
          ticket_url?: string | null;
          is_visible?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          starts_at?: string | null;
          is_tba?: boolean;
          venue?: string;
          city?: string | null;
          country?: string | null;
          ticket_url?: string | null;
          is_visible?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      show_translations: {
        Row: {
          id: string;
          show_id: string;
          locale: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          show_id: string;
          locale: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          show_id?: string;
          locale?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      booking_requests: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          event_date: string | null;
          event_location: string | null;
          event_type: string | null;
          message: string;
          status: BookingStatus;
          locale: string | null;
          ip_hash: string | null;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          event_date?: string | null;
          event_location?: string | null;
          event_type?: string | null;
          message: string;
          status?: BookingStatus;
          locale?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          event_date?: string | null;
          event_location?: string | null;
          event_type?: string | null;
          message?: string;
          status?: BookingStatus;
          locale?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media_items: {
        Row: {
          id: string;
          type: MediaType;
          file_url: string;
          thumbnail_url: string | null;
          alt_text: string | null;
          title: string | null;
          category: string | null;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: MediaType;
          file_url: string;
          thumbnail_url?: string | null;
          alt_text?: string | null;
          title?: string | null;
          category?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: MediaType;
          file_url?: string;
          thumbnail_url?: string | null;
          alt_text?: string | null;
          title?: string | null;
          category?: string | null;
          sort_order?: number;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      seo_entries: {
        Row: {
          id: string;
          path: string;
          locale: string;
          title: string | null;
          description: string | null;
          og_image_url: string | null;
        };
        Insert: {
          id?: string;
          path: string;
          locale: string;
          title?: string | null;
          description?: string | null;
          og_image_url?: string | null;
        };
        Update: {
          id?: string;
          path?: string;
          locale?: string;
          title?: string | null;
          description?: string | null;
          og_image_url?: string | null;
        };
        Relationships: [];
      };
      consent_settings: {
        Row: {
          id: string;
          category: string;
          label: string;
          description: string | null;
          is_required: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          label: string;
          description?: string | null;
          is_required?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          label?: string;
          description?: string | null;
          is_required?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenience row aliases for code that doesn't want the full path.
export type AdminProfile = Database["public"]["Tables"]["admin_profiles"]["Row"];
export type SiteSettingRow = Database["public"]["Tables"]["site_settings"]["Row"];
export type PlatformLinkRow =
  Database["public"]["Tables"]["platform_links"]["Row"];
export type LegalPageRow = Database["public"]["Tables"]["legal_pages"]["Row"];
export type LegalPageTranslationRow =
  Database["public"]["Tables"]["legal_page_translations"]["Row"];
export type BandMemberRow = Database["public"]["Tables"]["band_members"]["Row"];
export type BandMemberTranslationRow =
  Database["public"]["Tables"]["band_member_translations"]["Row"];
export type SongRow = Database["public"]["Tables"]["songs"]["Row"];
export type ShowRow = Database["public"]["Tables"]["shows"]["Row"];
export type ShowTranslationRow =
  Database["public"]["Tables"]["show_translations"]["Row"];
export type BookingRequest =
  Database["public"]["Tables"]["booking_requests"]["Row"];
export type BookingRequestInsert =
  Database["public"]["Tables"]["booking_requests"]["Insert"];
export type MediaItemRow = Database["public"]["Tables"]["media_items"]["Row"];
export type SeoEntryRow = Database["public"]["Tables"]["seo_entries"]["Row"];
export type ConsentSettingRow =
  Database["public"]["Tables"]["consent_settings"]["Row"];
