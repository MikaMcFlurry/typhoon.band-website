"use client";

import Image from "next/image";
import { useState } from "react";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { site } from "@/data/site";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

// Layout matches handoff/desktop.html `.booking-grid` (1.45fr 1fr) and
// handoff/mobile.html `.booking-grid-m` (1.4fr 1fr). Submit button lives
// inside the stage panel and is wired to the form via `form="booking-form"`.
export function Booking() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.hp_field) return;
    if (!data.name || !data.email || !data.message) {
      setStatus({ kind: "error", message: "Bitte fülle alle Pflichtfelder aus." });
      return;
    }
    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json()) as { ok: boolean; message?: string };
      if (!res.ok || !body.ok) {
        setStatus({
          kind: "error",
          message: body.message ?? "Etwas ist schiefgelaufen.",
        });
        return;
      }
      setStatus({
        kind: "success",
        message: body.message ?? "Danke! Wir melden uns innerhalb 48 Stunden.",
      });
      form.reset();
    } catch {
      setStatus({ kind: "error", message: "Netzwerkfehler. Bitte später erneut versuchen." });
    }
  }

  const submitLabel =
    status.kind === "submitting" ? "Wird gesendet…" : "Booking anfragen";

  return (
    <section className="mx-auto mt-7 max-w-container px-4 md:px-8" id="booking">
      <SectionHeader kicker="Booking" />
      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-[6px] md:grid-cols-[1.45fr_1fr] md:gap-[10px]">
        <form
          className="flex min-w-0 flex-col gap-[6px] rounded-[6px] border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] p-2.5 md:grid md:grid-cols-2 md:gap-[10px] md:p-[18px]"
          id="booking-form"
          noValidate
          onSubmit={onSubmit}
        >
          <input
            aria-hidden
            autoComplete="off"
            className="absolute -left-[9999px]"
            name="hp_field"
            tabIndex={-1}
            type="text"
          />
          <div className="field">
            <input name="name" placeholder="Name *" required type="text" />
          </div>
          <div className="field">
            <input name="email" placeholder="E-Mail *" required type="email" />
          </div>
          <div className="field md:col-span-2">
            <input name="phone" placeholder="Telefon (optional)" type="tel" />
          </div>
          <div className="field md:col-span-2">
            <input name="event_date" placeholder="Veranstaltungsdatum" type="date" />
          </div>
          <div className="field md:col-span-2">
            <input name="event_location" placeholder="Ort" type="text" />
          </div>
          <div className="field md:col-span-2">
            <input name="event_type" placeholder="Art der Veranstaltung" type="text" />
          </div>
          <div className="field md:col-span-2">
            <textarea name="message" placeholder="Nachricht *" required />
          </div>
          {status.kind === "success" || status.kind === "error" ? (
            <div
              aria-live="polite"
              className={`rounded border px-3 py-2 text-[11px] md:col-span-2 md:text-xs ${
                status.kind === "success"
                  ? "border-[rgba(232,201,130,0.45)] bg-[rgba(199,154,75,0.14)] text-[color:var(--gold-soft)]"
                  : "border-[rgba(220,120,90,0.4)] bg-[rgba(180,70,50,0.18)] text-[#f4c8b3]"
              }`}
            >
              {status.message}
            </div>
          ) : null}
          <p className="text-[9px] uppercase tracking-[0.16em] text-[color:var(--muted)] md:col-span-2 md:text-[10px]">
            {site.bookingDisabledNotice}
          </p>
        </form>

        <aside className="relative flex min-h-full flex-col justify-end overflow-hidden rounded-[6px] border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] p-3 md:p-[18px]">
          <Image
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover sepia-img-strong"
            fill
            src="/assets/hero/singer-stage.jpeg"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(3,2,1,0.15) 0%, rgba(3,2,1,0.55) 100%)",
            }}
          />
          <button
            className="btn btn-primary relative z-[2] self-end !px-3 !py-2 !text-[9px] md:!px-[22px] md:!py-3 md:!text-[11px]"
            disabled={status.kind === "submitting"}
            form="booking-form"
            type="submit"
          >
            {submitLabel}
          </button>
        </aside>
      </div>
    </section>
  );
}
