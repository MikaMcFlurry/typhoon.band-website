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
// Vercel preview deployments inject the Vercel toolbar (comments for
// reviewers). Allow it on previews only; production stays locked down.
const isPreview = process.env.VERCEL_ENV === "preview";
const toolbar = isPreview
  ? {
      script: "https://vercel.live",
      connect: "https://vercel.live wss://ws-us3.pusher.com",
      img: "https://vercel.live https://vercel.com",
      frame: "https://vercel.live",
      style: "https://vercel.live",
      font: "https://vercel.live https://assets.vercel.com",
    }
  : null;

const join = (...parts) => parts.filter(Boolean).join(" ");
const connectSrc = join("'self'", supabaseOrigin, supabaseOrigin.replace("https://", "wss://"), toolbar?.connect);
const mediaSrc = join("'self'", "blob:", supabaseOrigin);
const imgSrc = join("'self'", "data:", "blob:", supabaseOrigin, toolbar?.img);

const csp = [
  "default-src 'self'",
  join("script-src 'self' 'unsafe-inline'", process.env.NODE_ENV === "development" ? "'unsafe-eval'" : "", toolbar?.script),
  join("style-src 'self' 'unsafe-inline'", toolbar?.style),
  `img-src ${imgSrc}`,
  `media-src ${mediaSrc}`,
  join("font-src 'self' data:", toolbar?.font),
  `connect-src ${connectSrc}`,
  toolbar ? `frame-src ${toolbar.frame}` : "frame-src 'none'",
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
