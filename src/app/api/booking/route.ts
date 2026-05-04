import { NextResponse } from "next/server";
import {
  isResendConfigured,
  isSupabaseAdminConfigured,
  readServerEnv,
} from "@/lib/env";
import { sendEmail } from "@/lib/resend/client";
import { getServerSupabase } from "@/lib/supabase/server";
import { validateBooking } from "@/lib/validation/booking";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Ungültiges JSON." },
      { status: 400 },
    );
  }

  const result = validateBooking(payload);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, message: result.message },
      { status: 400 },
    );
  }

  const env = readServerEnv();
  const stored = await tryStore(result.data);
  const mailed = await tryMail(env.bookingEmail, result.data);

  // Graceful disabled / dev fallback: nothing configured yet.
  if (!stored.attempted && !mailed.attempted) {
    return NextResponse.json({
      ok: true,
      message:
        "Anfrage erhalten — wir melden uns. (Hinweis: Backend-Versand wird im nächsten Batch angebunden.)",
    });
  }

  return NextResponse.json({
    ok: true,
    message: "Danke! Wir melden uns innerhalb 48 Stunden.",
    detail: {
      stored: stored.ok ? "ok" : stored.attempted ? stored.reason : "skipped",
      mailed: mailed.ok ? "ok" : mailed.attempted ? mailed.reason : "skipped",
    },
  });
}

type Outcome = { attempted: boolean; ok: boolean; reason?: string };

async function tryStore(
  data: ReturnType<typeof validateBooking> extends infer R
    ? R extends { ok: true; data: infer D }
      ? D
      : never
    : never,
): Promise<Outcome> {
  if (!isSupabaseAdminConfigured()) {
    return { attempted: false, ok: false, reason: "supabase missing" };
  }
  const sb = await getServerSupabase();
  if (!sb) return { attempted: true, ok: false, reason: "supabase init failed" };
  // Intentionally not calling supabase yet — the SDK will be added with the
  // first Supabase batch. The structure is here so swapping to a live insert
  // is a one-line change once the package and table exist.
  return { attempted: true, ok: false, reason: "client placeholder — sdk batch pending" };
}

async function tryMail(
  to: string,
  data: { name: string; email: string; message: string; phone: string; event_date: string; event_location: string; event_type: string },
): Promise<Outcome> {
  if (!isResendConfigured()) {
    return { attempted: false, ok: false, reason: "resend missing" };
  }
  const subject = `Booking-Anfrage: ${data.name}`;
  const text = [
    `Name: ${data.name}`,
    `E-Mail: ${data.email}`,
    data.phone ? `Telefon: ${data.phone}` : null,
    data.event_date ? `Datum: ${data.event_date}` : null,
    data.event_location ? `Ort: ${data.event_location}` : null,
    data.event_type ? `Art: ${data.event_type}` : null,
    "",
    data.message,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await sendEmail({ to, subject, text, replyTo: data.email });
  return { attempted: true, ok: res.ok, reason: res.reason };
}
