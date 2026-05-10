import { NextResponse } from "next/server";

import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { getSupabaseServerAuthClient } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  const locale = isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;

  const supabase = await getSupabaseServerAuthClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL(`/${locale}/admin/login`, url.origin), {
    status: 303,
  });
}
