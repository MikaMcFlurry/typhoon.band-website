"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDict } from "@/components/i18n/DictProvider";
import { Icon } from "@/components/ui/Icon";
import type { EventTypeKey } from "@/i18n/dictionaries";
import { INTL_LOCALE } from "@/i18n/locales";

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

type Draft = Partial<Record<FieldKey, string>>;

export function BookingForm({ email, aside }: { email: string; aside?: React.ReactNode }) {
  const { dict, locale } = useDict();
  const t = dict.booking;
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  const [minDate, setMinDate] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState<Draft>({});
  const startedAt = useRef<number>(0);
  const formRef = useRef<HTMLFormElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    startedAt.current = Date.now();
    setMinDate(todayIso());
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
        body: JSON.stringify({ ...data, locale, started_at: startedAt.current }),
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
      setDraft({});
      setStatus(
        body.status === "fallback"
          ? { kind: "fallback", message: body.message || t.submitFallback }
          : { kind: "sent", message: body.message || t.submitOk },
      );
    } catch {
      setStatus({ kind: "error", message: t.networkErr });
    }
  }

  function onDraft(e: React.FormEvent<HTMLFormElement>) {
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setDraft({
      name: data.name,
      email: data.email,
      event_date: data.event_date,
      event_location: data.event_location,
      event_type: data.event_type,
      message: data.message,
    });
  }

  const done = status.kind === "sent" || status.kind === "fallback";
  const submitting = status.kind === "submitting";

  const field = (
    name: FieldKey,
    label: string,
    input: React.ReactNode,
    opts: { required?: boolean; hint?: string; span?: boolean } = {},
  ) => {
    const err = errors[name];
    return (
      <div className={`st-field ${opts.span ? "sm:col-span-2" : ""}`}>
        <label htmlFor={`bk-${name}`}>
          {label}
          {opts.required ? (
            <span aria-hidden className="text-orange"> *</span>
          ) : (
            <span className="normal-case tracking-normal text-chalk-3"> ({t.optional})</span>
          )}
        </label>
        {input}
        {opts.hint && !err ? (
          <p className="st-field-hint" id={`bk-${name}-hint`}>
            {opts.hint}
          </p>
        ) : null}
        {err ? (
          <p className="st-field-error" id={`bk-${name}-err`}>
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

  const typeKey = draft.event_type as EventTypeKey | undefined;
  const dateText = draft.event_date
    ? new Intl.DateTimeFormat(INTL_LOCALE[locale], {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${draft.event_date}T00:00:00Z`))
    : null;
  const empty = <span className="text-[rgba(18,17,16,0.62)]">{dict.stage.previewEmpty}</span>;
  const from = [draft.name?.trim(), draft.email?.trim() ? `<${draft.email.trim()}>` : ""].filter(Boolean).join(" ");
  const previewRows: [string, React.ReactNode][] = [
    [dict.stage.previewTo, email],
    [dict.stage.previewFrom, from || empty],
    [t.dateLabel, dateText || empty],
    [t.locationLabel, draft.event_location?.trim() || empty],
    [t.typeLabel, typeKey && t.types[typeKey] ? t.types[typeKey] : empty],
  ];

  return (
    <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
      <div className="lg:col-span-5">
        {aside}
        {!done ? (
          <aside aria-label={dict.stage.previewTitle} className="relative mt-12 hidden bg-chalk p-5 lg:block">
            <span aria-hidden className="tape-piece -top-2.5 left-5 -rotate-3 !bg-[#121110] !opacity-90" />
            <p className="font-stage text-[1.375rem] font-extrabold uppercase leading-none">{dict.stage.previewTitle}</p>
            <dl className="mono mt-4 flex flex-col gap-1.5">
              {previewRows.map(([k, v]) => (
                <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-3" key={k}>
                  <dt className="text-[rgba(18,17,16,0.62)]">{k}</dt>
                  <dd className="min-w-0 break-words">{v}</dd>
                </div>
              ))}
            </dl>
            {draft.message?.trim() ? (
              <p className="mt-4 line-clamp-4 border-t border-[rgba(18,17,16,0.25)] pt-3 text-[0.9375rem] leading-relaxed">
                {draft.message.trim()}
              </p>
            ) : null}
          </aside>
        ) : null}
      </div>

      <div className="lg:col-span-7 [--focus:var(--chalk)]">
        {done ? (
          <div
            className="flex min-h-[420px] flex-col items-start justify-center bg-deck p-6 text-chalk outline-none md:p-10"
            ref={resultRef}
            role="status"
            tabIndex={-1}
          >
            <span className="inline-flex size-12 items-center justify-center bg-green text-[#121110]">
              <Icon name={status.kind === "sent" ? "check" : "mail"} size={26} />
            </span>
            <h3 className="mt-6 font-stage text-[2.5rem] font-black uppercase leading-[0.95]">
              {status.kind === "sent" ? t.submitOkTitle : t.direct}
            </h3>
            <p className="copy mt-3">{status.message}</p>
            {status.kind === "fallback" ? (
              <a className="btn-tape mt-6" href={`mailto:${email}`}>
                <Icon name="mail" size={18} />
                {email}
              </a>
            ) : (
              <button
                className="btn-line mt-6"
                onClick={() => {
                  startedAt.current = Date.now();
                  setStatus({ kind: "idle" });
                }}
                type="button"
              >
                {t.submitAnother}
              </button>
            )}
          </div>
        ) : (
          <form
            className="relative bg-deck p-5 text-chalk sm:p-7 md:p-9"
            noValidate
            onInput={onDraft}
            onSubmit={onSubmit}
            ref={formRef}
          >
            {/* Honeypot: off-screen, not focusable, ignored by assistive tech. */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Website
                <input autoComplete="off" name="hp_field" tabIndex={-1} type="text" />
              </label>
            </div>

            <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
              {field("name", t.nameLabel, <input {...a11y("name")} autoComplete="name" required type="text" />, { required: true })}
              {field("email", t.emailLabel, <input {...a11y("email")} autoComplete="email" inputMode="email" required type="email" />, { required: true })}
              {field("phone", t.phoneLabel, <input {...a11y("phone")} autoComplete="tel" inputMode="tel" type="tel" />)}
              {field("event_date", t.dateLabel, <input {...a11y("event_date")} min={minDate} type="date" />)}
              {field(
                "event_location",
                t.locationLabel,
                <input {...a11y("event_location", true)} autoComplete="address-level2" required type="text" />,
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
                <textarea {...a11y("message", true)} required rows={6} />,
                { required: true, hint: t.messageHint, span: true },
              )}
            </div>

            <div className="mt-8 flex flex-col gap-5 border-t border-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-[46ch] text-[0.875rem] leading-relaxed text-chalk-2">
                {t.privacyNote}{" "}
                <Link className="link-u text-chalk" href={`/${locale}/legal/privacy`}>
                  {t.privacyLink}
                </Link>
                .
              </p>
              <button className="btn-tape flex-none" disabled={submitting} type="submit">
                {submitting ? <Icon name="spinner" size={18} /> : null}
                {submitting ? t.submitting : t.submit}
                {submitting ? null : <Icon name="arrow-right" size={20} />}
              </button>
            </div>

            <div aria-live="polite" className="min-h-0">
              {status.kind === "error" ? (
                <p className="mt-4 bg-[rgba(255,138,122,0.1)] px-4 py-3 text-[0.9375rem] text-alert" role="alert">
                  {status.message}
                </p>
              ) : null}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
