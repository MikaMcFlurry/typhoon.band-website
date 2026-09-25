import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";

// 1. Locale routing. Every page lives under /de, /en or /tr. Requests without
//    a locale prefix are redirected to the best match from Accept-Language
//    (no cookie is set, so no consent is needed).
//    Public locale paths get an `x-typhoon-locale` request header for the
//    global 404 page.
// 2. Admin session refresh. For /<locale>/admin/* the Supabase auth cookies
//    are refreshed here (the documented @supabase/ssr pattern). Server
//    Components cannot write cookies, so without this admins were logged
//    out once the access token expired (~1 h).
// API routes, Next internals and static files are excluded by the matcher.

function pickLocale(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? Number(q.slice(2)) || 0 : 1 };
    })
    .filter((entry) => entry.tag && entry.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

async function refreshAdminSession(request: NextRequest): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });
  try {
    // Validates the JWT with Supabase and refreshes it when needed.
    await supabase.auth.getUser();
  } catch {
    // Network hiccup: let the page-level guard decide.
  }
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const segments = pathname.split("/");
  const first = segments[1];

  if (isLocale(first)) {
    if (segments[2] === "admin") return refreshAdminSession(request);
    // Lets the global 404 page (which gets no route params) answer in the
    // visitor's language.
    const headers = new Headers(request.headers);
    headers.set("x-typhoon-locale", first);
    return NextResponse.next({ request: { headers } });
  }

  const locale = pickLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  url.search = search;
  const res = NextResponse.redirect(url, 307);
  res.headers.set("Vary", "Accept-Language");
  return res;
}

export const config = {
  // Skip API, Next internals, and anything that looks like a file.
  matcher: ["/((?!api|_next|assets|.*\\..*).*)"],
};
