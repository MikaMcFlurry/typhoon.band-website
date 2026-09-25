import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locales";

// Locale routing. Every page lives under /de, /en or /tr. Requests without a
// locale prefix are redirected to the best match from Accept-Language (no
// cookie is set, so no consent is needed). API routes, Next internals and
// static files are excluded by the matcher below.

function pickLocale(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="));
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

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split("/")[1];
  if (isLocale(first)) return NextResponse.next();

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
