"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDict } from "@/components/i18n/DictProvider";
import { Icon } from "@/components/ui/Icon";
import type { EventTypeKey } from "@/i18n/dictionaries";

type FieldKey = "name" | "email" | "phone" | "event_date" | "event_location" | "event_type" | "message";
type Errors = Partial<Record<FieldKey, string>>;

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "sent"; message: string }
  | { kind: "fallback"; message: string }
  | { kind: "error"; message: string };

type ApiResponse =
  | { ok: true; status: "sent" | "fallback"; message: string }
  | { ok: false; status: string; message: string; field?: string };

const EVENT_TYPES: EventTypeKey[] = ["festival", "club", "cityfest", "corporate", "private", "other"];
const ORDER: FieldKey[] = ["name", "email", "phone", "event_date", "event_location", "event_type", "message"];
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

function todayIso() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function BookingForm({ email }: { email: string }) {
  const { dict, locale } = useDict();
  const t = dict.booking;
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  const [minDate, setMinDate] = useState<string | undefined>(undefined);
  // Until hydration the form works as a plain POST with native validation;
  // afterwards JavaScript takes over (inline errors, no page reload).
  const [enhanced, setEnhanced] = useState(false);
  // Time trap: measured on the client with a monotonic clock and sent as a
  // duration, so a wrong device clock can never drop a real request.
  const startedAt = useRef<number>(0);
  const formRef = useRef<HTMLFormElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    startedAt.current = performance.now();
    setMinDate(todayIso());
    setEnhanced(true);
  }, []);

  useEffect(() => {
    if (status.kind === "sent" || status.kind === "fallback") resultRef.current?.focus();
  }, [status.kind]);

  function validate(data: Record<string, string>): Errors {
    const e: Errors = {};
    if ((data.name ?? "").trim().length < 2) e.name = t.errors.name;
    if (!EMAIL_RE.test((data.email ?? "").trim())) e.email = t.errors.email;
    if ((data.phone ?? "").trim().length > 60) e.phone = t.errors.phone;
    if ((data.event_location ?? "").trim().length < 2) e.event_location = t.errors.event_location;
    if (!(data.event_type ?? "").trim()) e.event_type = t.errors.event_type;
    if ((data.message ?? "").trim().length < 10) e.message = t.errors.message;
    return e;
  }

  function focusFirst(errs: Errors) {
    const first = ORDER.find((k) => errs[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const errs = validate(data);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setStatus({ kind: "error", message: t.requiredErr });
      focusFirst(errs);
      return;
    }
    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          locale,
          elapsed_ms: Math.round(performance.now() - startedAt.current),
        }),
      });
      const body = (await res.json().catch(() => null)) as ApiResponse | null;
      if (!body) {
        setStatus({ kind: "error", message: t.networkErr });
        return;
      }
      if (!body.ok) {
        const field = body.field as FieldKey | undefined;
        if (field && ORDER.includes(field)) {
          const next = { [field]: body.message } as Errors;
          setErrors(next);
          focusFirst(next);
        }
        setStatus({ kind: "error", message: body.message || t.submitError });
        return;
      }
      form.reset();
      setErrors({});
      setStatus(
        body.status === "fallback"
          ? { kind: "fallback", message: body.message || t.submitFallback }
          : { kind: "sent", message: body.message || t.submitOk },
      );
    } catch {
      setStatus({ kind: "error", message: t.networkErr });
    }
  }

  if (status.kind === "sent" || status.kind === "fallback") {
    return (
      <div
        className="flex min-h-[420px] flex-col items-start justify-center rounded-md border border-line-2 bg-ink-3 p-6 outline-none md:p-10"
        ref={resultRef}
        role="status"
        tabIndex={-1}
      >
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-gold text-on-gold">
          <Icon name={status.kind === "sent" ? "check" : "mail"} size={24} />
        </span>
        <h3 className="mt-6 font-display text-[2rem] leading-tight text-paper">
          {status.kind === "sent" ? t.submitOkTitle : t.direct}
        </h3>
        <p className="mt-3 max-w-[48ch] text-paper-2">{status.message}</p>
        {status.kind === "fallback" ? (
          <a className="btn btn-primary mt-6" href={`mailto:${email}`}>
            <Icon name="mail" size={18} />
            {email}
          </a>
        ) : (
          <button
            className="btn btn-secondary mt-6"
            onClick={() => {
              startedAt.current = performance.now();
              setStatus({ kind: "idle" });
            }}
            type="button"
          >
            {t.submitAnother}
          </button>
        )}
      </div>
    );
  }

  const submitting = status.kind === "submitting";

  const field = (
    name: FieldKey,
    label: string,
    input: React.ReactNode,
    opts: { required?: boolean; hint?: string; span?: boolean } = {},
  ) => {
    const err = errors[name];
    return (
      <div className={`field ${opts.span ? "sm:col-span-2" : ""}`}>
        <label htmlFor={`bk-${name}`}>
          {label}
          {opts.required ? (
            <span aria-hidden className="text-gold"> *</span>
          ) : (
            <span className="font-normal text-paper-3"> ({t.optional})</span>
          )}
        </label>
        {input}
        {opts.hint && !err ? (
          <p className="field-hint" id={`bk-${name}-hint`}>
            {opts.hint}
          </p>
        ) : null}
        {err ? (
          <p className="field-error" id={`bk-${name}-err`}>
            {err}
          </p>
        ) : null}
      </div>
    );
  };

  const a11y = (name: FieldKey, hint = false) => ({
    id: `bk-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `bk-${name}-err` : hint ? `bk-${name}-hint` : undefined,
  });

  return (
    <form
      action="/api/booking"
      className="relative rounded-md border border-line-2 bg-ink-3 p-5 sm:p-6 md:p-8"
      method="post"
      noValidate={enhanced}
      onSubmit={onSubmit}
      ref={formRef}
    >
      <input name="locale" type="hidden" value={locale} />
      {/* Honeypot: off-screen, not focusable, ignored by assistive tech. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input autoComplete="off" name="hp_field" tabIndex={-1} type="text" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", t.nameLabel, <input {...a11y("name")} autoComplete="name" minLength={2} required type="text" />, { required: true })}
        {field("email", t.emailLabel, <input {...a11y("email")} autoComplete="email" inputMode="email" required type="email" />, { required: true })}
        {field("phone", t.phoneLabel, <input {...a11y("phone")} autoComplete="tel" inputMode="tel" type="tel" />)}
        {field("event_date", t.dateLabel, <input {...a11y("event_date")} min={minDate} type="date" />)}
        {field(
          "event_location",
          t.locationLabel,
          <input {...a11y("event_location", true)} autoComplete="address-level2" minLength={2} required type="text" />,
          { required: true, hint: t.locationHint },
        )}
        {field(
          "event_type",
          t.typeLabel,
          <select {...a11y("event_type")} defaultValue="" required>
            <option disabled value="">
              {t.typePlaceholder}
            </option>
            {EVENT_TYPES.map((k) => (
              <option key={k} value={k}>
                {t.types[k]}
              </option>
            ))}
          </select>,
          { required: true },
        )}
        {field(
          "message",
          t.messageLabel,
          <textarea {...a11y("message", true)} minLength={10} required rows={6} />,
          { required: true, hint: t.messageHint, span: true },
        )}
      </div>

      <div className="mt-6 flex flex-col gap-5 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[46ch] text-[0.875rem] leading-relaxed text-paper-3">
          {t.privacyNote}{" "}
          <Link className="text-paper-2 underline decoration-line-2 underline-offset-4 hover:text-gold-hi" href={`/${locale}/legal/privacy`}>
            {t.privacyLink}
          </Link>
          .
        </p>
        <button className="btn btn-primary flex-none" disabled={submitting} type="submit">
          {submitting ? <Icon name="spinner" size={18} /> : null}
          {submitting ? t.submitting : t.submit}
          {submitting ? null : <Icon name="arrow-right" size={18} />}
        </button>
      </div>

      <div aria-live="polite" className="min-h-0">
        {status.kind === "error" ? (
          <p className="mt-4 rounded-sm border border-[rgba(240,160,146,0.4)] bg-[rgba(240,160,146,0.08)] px-4 py-3 text-[0.9375rem] text-[color:var(--danger)]" role="alert">
            {status.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
