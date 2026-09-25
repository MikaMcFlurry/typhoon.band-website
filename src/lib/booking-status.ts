// Outcomes of a booking request sent as a plain form POST (no JavaScript).
// The API answers with a 303 redirect to /<locale>/booking/<slug>.
export const BOOKING_STATUS_SLUGS = ["sent", "fallback", "invalid", "error", "rate-limited"] as const;
export type BookingStatusSlug = (typeof BOOKING_STATUS_SLUGS)[number];
