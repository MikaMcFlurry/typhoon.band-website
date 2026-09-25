/** @type {import('next').NextConfig} */

// Supabase Storage public URLs (`<NEXT_PUBLIC_SUPABASE_URL>/storage/v1/object/public/...`)
// must be allow-listed for next/image. The site also runs without Supabase
// (static fallback), so the remote pattern is only added when configured.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const remotePatterns = [];
let supabaseOrigin = "";
if (supabaseUrl) {
  try {
    const u = new URL(supabaseUrl);
    supabaseOrigin = u.origin;
    remotePatterns.push({
      protocol: u.protocol.replace(":", ""),
      hostname: u.hostname,
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    // ignore invalid URL — image optimisation will simply reject the URL.
  }
}

// Conservative security headers. No third-party scripts, frames or trackers
// are loaded, so the policy can stay tight. Supabase is needed for admin
// uploads (direct-to-Storage) and public audio/images.
const connectSrc = ["'self'", supabaseOrigin, supabaseOrigin.replace("https://", "wss://")]
  .filter(Boolean)
  .join(" ");
const mediaSrc = ["'self'", "blob:", supabaseOrigin].filter(Boolean).join(" ");
const imgSrc = ["'self'", "data:", "blob:", supabaseOrigin].filter(Boolean).join(" ");

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  `img-src ${imgSrc}`,
  `media-src ${mediaSrc}`,
  "font-src 'self' data:",
  `connect-src ${connectSrc}`,
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns,
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // Demo audio: allow range requests + long cache, never "download" UI.
        source: "/assets/audio/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
    ];
  },
};

export default nextConfig;
