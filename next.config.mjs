/** @type {import('next').NextConfig} */

// Phase 05 introduces Supabase Storage uploads. Public asset URLs from
// Storage land on `<NEXT_PUBLIC_SUPABASE_URL>/storage/v1/object/public/<bucket>/<path>`
// and must be allow-listed for `next/image`. The site runs without
// Supabase configured (env empty → static fallback only), so we only
// inject the remote pattern when the env var is present.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const remotePatterns = [];
if (supabaseUrl) {
  try {
    const u = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: u.protocol.replace(":", ""),
      hostname: u.hostname,
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    // ignore invalid URL — image optimization will simply reject the URL.
  }
}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns,
  },
  async redirects() {
    return [
      { source: "/", destination: "/de", permanent: false },
    ];
  },
};

export default nextConfig;
