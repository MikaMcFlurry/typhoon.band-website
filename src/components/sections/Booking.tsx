"use client";

import Image from "next/image";
import { useState } from "react";
import { useDict } from "@/components/i18n/DictProvider";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { site } from "@/data/site";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

// Layout matches handoff `.booking-grid`. On mobile we stack form-on-top,
// signature-image-below so the band photo and submit button always render
// at full width and intentional crop instead of fighting a 130px column.
export function Booking() {
  const { dict } = useDict();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.hp_field) return;
    if (!data.name || !data.email || !data.message) {
      setStatus({ kind: "error", message: dict.booking.requiredErr });
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
          message: body.message ?? dict.booking.requiredErr,
        });
        return;
      }
      setStatus({
        kind: "success",
        message: body.message ?? dict.booking.submitOk,
      });
      form.reset();
    } catch {
      setStatus({ kind: "error", message: dict.booking.networkErr });
    }
  }

  const submitLabel =
    status.kind === "submitting" ? dict.booking.submitting : dict.booking.submit;

  return (
    <section className="mx-auto mt-7 max-w-container px-4 md:px-8" id="booking">
      <SectionHeader kicker={dict.booking.kicker} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.45fr_1fr] md:gap-[10px]">
        <form
          className="flex min-w-0 flex-col gap-[8px] rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] p-3 md:grid md:grid-cols-2 md:gap-[10px] md:p-[18px]"
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
          <div className="field min-w-0">
            <input name="name" placeholder={dict.booking.nameLabel} required type="text" />
          </div>
          <div className="field min-w-0">
            <input name="email" placeholder={dict.booking.emailLabel} required type="email" />
          </div>
          <div className="field min-w-0 md:col-span-2">
            <input name="phone" placeholder={dict.booking.phoneLabel} type="tel" />
          </div>
          <div className="field min-w-0 md:col-span-1">
            <input name="event_date" placeholder={dict.booking.dateLabel} type="date" />
          </div>
          <div className="field min-w-0 md:col-span-1">
            <input name="event_location" placeholder={dict.booking.locationLabel} type="text" />
          </div>
          <div className="field min-w-0 md:col-span-2">
            <input name="event_type" placeholder={dict.booking.typeLabel} type="text" />
          </div>
          <div className="field min-w-0 md:col-span-2">
            <textarea name="message" placeholder={dict.booking.messageLabel} required />
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
            {dict.booking.backendNotice}
          </p>
        </form>

        <aside className="relative flex min-h-[220px] min-w-0 flex-col items-stretch justify-end overflow-hidden rounded-[var(--radius-card)] border border-[color:var(--line)] bg-[rgba(11,8,5,0.6)] p-3 md:min-h-full md:p-[18px]">
          <Image
            alt="Typhoon — Band mit Signatur"
            className="absolute inset-0 h-full w-full object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            src="/assets/gallery/gallery-3.jpg"
            style={{
              objectPosition: "center 65%",
              filter: "saturate(0.95) contrast(1.05) brightness(0.92)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(3,2,1,0.05) 0%, rgba(3,2,1,0.55) 60%, rgba(3,2,1,0.85) 100%)",
            }}
          />
          <button
            className="btn btn-primary relative z-[2] w-full md:w-auto md:self-end"
            disabled={status.kind === "submitting"}
            form="booking-form"
            type="submit"
          >
            {submitLabel}
          </button>
          <div className="relative z-[2] mt-3 text-[11px] text-[color:var(--muted-cream)] md:hidden">
            {site.contact.booking} · {site.contact.phone}
          </div>
        </aside>
      </div>
    </section>
  );
}
