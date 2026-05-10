// POST /api/booking — booking request handler.
//
// Phase 01 contract:
//   1. Parse + server-validate input (with honeypot).
//   2. If Supabase service role is configured → insert into booking_requests.
//   3. If Resend is configured → send mail to BOOKING_EMAIL with Reply-To
//      = sender address.
//   4. Always respond with a stable JSON shape:
//        { ok: true,  status: "sent" | "fallback", message }
//        { ok: false, status: "validation" | "error", message, field? }
//   5. Missing env vars must NEVER crash — they downgrade to a clear
//      "fallback" response so the public site stays online.

import { NextResponse } from "next/server";
import {
  buildBookingEmailHtml,
  buildBookingEmailText,
  getBookingEmailSubject,
} from "@/lib/email/booking-email";
import { isResendConfigured, readServerEnv } from "@/lib/env";
import { sendEmail } from "@/lib/resend/client";
import { storeBookingRequest } from "@/lib/supabase/booking";
import {
  validateBooking,
  type BookingData,
} from "@/lib/validation/booking";

export const runtime = "nodejs";

const MESSAGES = {
  ok: "Danke für deine Anfrage. Wir melden uns so schnell wie möglich.",
  fallback:
    "Booking ist vorbereitet, aber der Versand ist noch nicht vollständig angebunden.",
  error:
    "Die Anfrage konnte nicht gesendet werden. Bitte versuche es später erneut.",
  invalidJson: "Ungültige Anfrage.",
} as const;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, status: "validation", message: MESSAGES.invalidJson },
      { status: 400 },
    );
  }

  const result = validateBooking(payload);
  if (!result.ok) {
    // Honeypot hits return ok: true so bots can't probe validation.
    if (result.field === "hp_field") {
      return NextResponse.json({
        ok: true,
        status: "fallback",
        message: MESSAGES.ok,
      });
    }
    return NextResponse.json(
      {
        ok: false,
        status: "validation",
        field: result.field,
        message: result.message,
      },
      { status: 400 },
    );
  }

  const env = readServerEnv();
  const userAgent = request.headers.get("user-agent") ?? undefined;

  const [stored, mailed] = await Promise.all([
    storeBookingRequest(result.data, { userAgent }),
    deliverEmail(env.bookingEmail, result.data),
  ]);

  // Backend not wired yet (no env). Don't crash, don't lie.
  if (!stored.attempted && !mailed.attempted) {
    return NextResponse.json({
      ok: true,
      status: "fallback",
      message: MESSAGES.fallback,
    });
  }

  // At least one channel attempted. Treat any failure as an error so the
  // sender retries; only when both succeed (or one succeeds and the other
  // is intentionally not configured) do we report a clean send.
  const storedFailed = stored.attempted && !stored.ok;
  const mailedFailed = mailed.attempted && !mailed.ok;
  if (storedFailed && mailedFailed) {
    return NextResponse.json(
      { ok: false, status: "error", message: MESSAGES.error },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    status: "sent",
    message: MESSAGES.ok,
  });
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
