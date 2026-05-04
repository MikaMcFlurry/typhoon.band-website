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

export function Booking() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.hp_field) return; // honeypot
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

  return (
    <section className="mx-auto mt-10 max-w-container px-4 md:mt-12 md:px-8" id="booking">
      <SectionHeader kicker="Booking" />
      <div className="grid gap-3 md:grid-cols-[1.45fr_1fr]">
        <form
          className="grid gap-2.5 rounded-[6px] border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] p-4 md:grid-cols-2 md:p-5"
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
          <div className="field">
            <input name="event_date" placeholder="Veranstaltungsdatum" type="date" />
          </div>
          <div className="field">
            <input name="event_location" placeholder="Ort" type="text" />
          </div>
          <div className="field md:col-span-2">
            <input name="event_type" placeholder="Art der Veranstaltung" type="text" />
          </div>
          <div className="field md:col-span-2">
            <textarea name="message" placeholder="Nachricht *" required />
          </div>
          <div className="md:col-span-2 flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
              {site.bookingDisabledNotice}
            </p>
            <button
              className="btn btn-primary"
              disabled={status.kind === "submitting"}
              type="submit"
            >
              {status.kind === "submitting" ? "Wird gesendet…" : "Booking anfragen"}
            </button>
          </div>
          {status.kind === "success" || status.kind === "error" ? (
            <div
              aria-live="polite"
              className={`md:col-span-2 rounded border px-3 py-2 text-xs ${
                status.kind === "success"
                  ? "border-[rgba(232,201,130,0.45)] bg-[rgba(199,154,75,0.14)] text-[color:var(--gold-soft)]"
                  : "border-[rgba(220,120,90,0.4)] bg-[rgba(180,70,50,0.18)] text-[#f4c8b3]"
              }`}
            >
              {status.message}
            </div>
          ) : null}
        </form>
        <aside className="relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[6px] border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] p-4 md:p-5">
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
          <div className="relative z-[2] text-xs text-[color:var(--cream)]">
            <p className="font-display text-lg leading-snug">
              Bringt Typhoon auf eure Bühne.
            </p>
            <p className="mt-2 text-[color:var(--muted-cream)]">
              {site.contact.booking}
            </p>
            <p className="text-[color:var(--muted-cream)]">{site.contact.phone}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
