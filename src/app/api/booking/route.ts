// POST /api/booking — booking request handler.
//
// Contract (Phase 01, hardened in the redesign):
//   1. Same-origin only; basic per-IP rate limit; honeypot + time trap.
//      JSON from the enhanced form; a plain form POST (no JavaScript, or a
//      submit before hydration) is accepted too and answered with a 303
//      redirect to /<locale>/booking/<status> instead of JSON.
//   2. Server-validate input (lib/validation/booking.ts).
//   3. If Supabase service role is configured → insert into booking_requests.
//   4. If Resend is configured → mail to BOOKING_EMAIL, Reply-To = sender.
//   5. Stable JSON response, messages in the visitor's language:
//        { ok: true,  status: "sent" | "fallback", message }
//        { ok: false, status: "validation" | "error" | "rate_limited", message, field? }
//   6. Missing env never crashes; it downgrades to "fallback".
//   7. "sent" only when at least one configured channel actually succeeded.

import { NextResponse } from "next/server";
import type { BookingStatusSlug } from "@/lib/booking-status";
import { getDict } from "@/i18n/dictionaries";
import { isLocale, type Locale } from "@/i18n/locales";
import {
  buildBookingEmailHtml,
  buildBookingEmailText,
  getBookingEmailSubject,
} from "@/lib/email/booking-email";
import { isResendConfigured, readServerEnv } from "@/lib/env";
import { sendEmail } from "@/lib/resend/client";
import { storeBookingRequest } from "@/lib/supabase/booking";
import { validateBooking, type BookingData } from "@/lib/validation/booking";

export const runtime = "nodejs";

// Best-effort, per-instance limiter (serverless instances do not share
// memory). Stops bursts from one client without storing anything.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MIN_FILL_MS = 2500;
const hits = new Map<string, number[]>();

function clientKey(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? request.headers.get("x-real-ip") ?? "unknown").trim();
}

function rateLimited(key: string, now: number): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
    }
  }
  return false;
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients; other checks still apply
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

type Kind = "sent" | "fallback" | "validation" | "error" | "rate_limited";

const SLUG: Record<Kind, BookingStatusSlug> = {
  sent: "sent",
  fallback: "fallback",
  validation: "invalid",
  error: "error",
  rate_limited: "rate-limited",
};

function formRedirect(request: Request, locale: Locale, kind: Kind) {
  return NextResponse.redirect(new URL(`/${locale}/booking/${SLUG[kind]}`, request.url), 303);
}

async function readForm(request: Request): Promise<Record<string, string>> {
  const form = await request.formData();
  const out: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") out[k] = v;
  return out;
}

function localeOf(payload: unknown): Locale {
  if (payload && typeof payload === "object") {
    const l = (payload as Record<string, unknown>).locale;
    if (typeof l === "string" && isLocale(l)) return l;
  }
  return "de";
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const isForm =
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data");
  const isJson = contentType.includes("application/json");

  let payload: unknown = null;
  if (isJson || isForm) {
    try {
      payload = isForm ? await readForm(request) : await request.json();
    } catch {
      payload = null;
    }
  }
  const locale = localeOf(payload);
  const t = getDict(locale).booking;

  // One place that answers both clients: JSON for the enhanced form, a
  // redirect to a status page for a plain form POST.
  const reply = (
    kind: Kind,
    message: string,
    init: { status?: number; field?: string; headers?: Record<string, string> } = {},
  ) => {
    if (isForm) return formRedirect(request, locale, kind);
    const ok = kind === "sent" || kind === "fallback";
    return NextResponse.json(
      { ok, status: kind, message, ...(init.field ? { field: init.field } : {}) },
      { status: init.status ?? 200, headers: init.headers },
    );
  };

  if (!sameOrigin(request)) return reply("error", t.submitError, { status: 403 });
  if (!isJson && !isForm) return reply("validation", t.submitError, { status: 415 });
  if (payload === null) return reply("validation", t.submitError, { status: 400 });

  if (rateLimited(clientKey(request), Date.now())) {
    return reply("rate_limited", t.errors.rate, { status: 429, headers: { "Retry-After": "600" } });
  }

  // Time trap: humans need more than a couple of seconds to fill the form.
  // The client measures the time itself (performance.now), so a wrong
  // device clock can never drop a real request. No value (plain form POST
  // without JavaScript) means no check.
  const elapsed = Number((payload as Record<string, unknown>).elapsed_ms);
  const tooFast = Number.isFinite(elapsed) && elapsed >= 0 && elapsed < MIN_FILL_MS;

  const result = validateBooking(payload);
  if (!result.ok) {
    // Honeypot hits get a fake success so bots can't probe the check.
    if (result.field === "hp_field") return reply("sent", t.submitOk);
    const message =
      result.field === "_global" ? t.submitError : t.errors[result.field];
    return reply("validation", message, { status: 400, field: result.field });
  }
  if (tooFast) return reply("sent", t.submitOk);

  const env = readServerEnv();
  const userAgent = request.headers.get("user-agent")?.slice(0, 400) ?? undefined;

  const [stored, mailed] = await Promise.all([
    storeBookingRequest(result.data, { userAgent }),
    deliverEmail(env.bookingEmail, result.data),
  ]);

  if (!stored.attempted && !mailed.attempted) {
    return reply("fallback", t.submitFallback);
  }

  if (stored.attempted && !stored.ok) {
    console.error("[booking] Supabase insert failed:", stored.reason);
  }
  if (mailed.attempted && !mailed.ok) {
    console.error("[booking] Resend delivery failed:", mailed.reason);
  }

  // Report success only if a configured channel really got the request.
  if (!stored.ok && !mailed.ok) {
    return reply("error", t.submitError, { status: 502 });
  }

  return reply("sent", t.submitOk);
}

type Outcome = { attempted: boolean; ok: boolean; reason?: string };

async function deliverEmail(to: string, data: BookingData): Promise<Outcome> {
  if (!isResendConfigured()) {
    return { attempted: false, ok: false, reason: "resend missing" };
  }
  const receivedAt = new Date();
  const text = buildBookingEmailText({ ...data, receivedAt });
  const html = buildBookingEmailHtml({ ...data, receivedAt });

  const res = await sendEmail({
    to,
    subject: getBookingEmailSubject(),
    text,
    html,
    replyTo: data.email,
  });
  return { attempted: true, ok: res.ok, reason: res.reason };
}
