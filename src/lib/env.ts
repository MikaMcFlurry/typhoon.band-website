// Centralised env access. Server-only secrets are read from process.env on the
// server only — never exposed to the client. NEXT_PUBLIC_* values may be read
// from anywhere.

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
};

export type ServerEnv = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  resendApiKey: string;
  bookingEmail: string;
  fromEmail: string;
};

export function readServerEnv(): ServerEnv {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    resendApiKey: process.env.RESEND_API_KEY ?? "",
    bookingEmail: process.env.BOOKING_EMAIL ?? "booking@typhoon.band",
    fromEmail: process.env.WEBSITE_FROM_EMAIL ?? "website@typhoon.band",
  };
}

export const isSupabaseConfigured = () =>
  Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);

export const isSupabaseAdminConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

export const isResendConfigured = () => Boolean(process.env.RESEND_API_KEY);
