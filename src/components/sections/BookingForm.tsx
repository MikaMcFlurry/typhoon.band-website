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
  // `delivery`: the request itself was fine but could not be delivered
  // (network or server); the visitor gets the draft as a ready e-mail.
  | { kind: "error"; message: string; delivery?: boolean };

type ApiResponse =
  | { ok: true; status: "sent" | "fallback"; message: string }
  | { ok: false; status: string; message: string; field?: string };

const EVENT_TYPES: EventTypeKey[] = ["festival", "club", "cityfest", "corporate", "private", "other"];
// Visual order of the fields (core questions first, optional last); the
// first invalid field in this order gets focus.
const ORDER: FieldKey[] = ["name", "email", "event_type", "event_location", "event_date", "message", "phone"];
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

function todayIso() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

type Draft = Partial<Record<FieldKey, string>>;

// Layout (booker on a phone first): the rider heading and direct contact,
// then the form, then the rider facts. From lg the heading and facts share
// the left column and the form spans both rows on the right.
export function BookingForm({
  email,
  intro,
  facts,
}: {
  email: string;
  intro?: React.ReactNode;
  facts?: React.ReactNode;
}) {
  const { dict, locale } = useDict();
  const t = dict.booking;
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  const [minDate, setMinDate] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState<Draft>({});
  const startedAt = useRef<number>(0);
  const lastDraft = useRef<Draft>({});
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");
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
    lastDraft.current = data;
    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale, started_at: startedAt.current }),
      });
      const body = (await res.json().catch(() => null)) as ApiResponse | null;
      if (!body) {
        setStatus({ kind: "error", message: t.networkErr, delivery: true });
        return;
      }
      if (!body.ok) {
        const field = body.field as FieldKey | undefined;
        if (field && ORDER.includes(field)) {
          const next = { [field]: body.message } as Errors;
          setErrors(next);
          focusFirst(next);
        }
        setStatus({
          kind: "error",
          message: body.message || t.submitError,
          delivery: !field && body.status !== "rate_limited",
        });
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
      setStatus({ kind: "error", message: t.networkErr, delivery: true });
    }
  }

  // The visitor's request as plain text and as a ready-to-send e-mail, so
  // nothing typed is lost when online delivery is unavailable. While the
  // form is still on screen (delivery error) it is built from the current
  // fields, so a correction made after the error is what gets sent; after
  // the fallback the form is gone and the submitted snapshot is used.
  function draftSubject(d: Draft) {
    const typeLabel = d.event_type && t.types[d.event_type as EventTypeKey];
    return [t.title, typeLabel, d.event_location?.trim()].filter(Boolean).join(" · ");
  }
  function draftText(d: Draft) {
    const typeLabel = d.event_type && t.types[d.event_type as EventTypeKey];
    const lines = [
      [t.nameLabel, d.name],
      [t.emailLabel, d.email],
      [t.phoneLabel, d.phone],
      [t.dateLabel, d.event_date],
      [t.locationLabel, d.event_location],
      [t.typeLabel, typeLabel],
    ]
      .filter(([, v]) => v && String(v).trim())
      .map(([k, v]) => `${k}: ${String(v).trim()}`);
    return [...lines, "", d.message?.trim() ?? ""].join("\n").trim();
  }
  function mailtoHref(d: Draft) {
    const body = draftText(d).replace(/\r?\n/g, "\r\n");
    return `mailto:${email}?subject=${encodeURIComponent(draftSubject(d))}&body=${encodeURIComponent(body)}`;
  }
  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(`${draftSubject(lastDraft.current)}\n\n${draftText(lastDraft.current)}`);
      setCopyState("ok");
    } catch {
      setCopyState("fail");
    }
  }

  // WebKit ignores scroll-padding when it scrolls a focused field into
  // view, so a field can end up behind the player dock: nudge it up.
  function keepClearOfDock(e: React.FocusEvent<HTMLFormElement>) {
    const el = e.target as HTMLElement;
    const dock = parseFloat(getComputedStyle(document.body).paddingBottom) || 0;
    if (!dock || !el.getBoundingClientRect) return;
    const r = el.getBoundingClientRect();
    const limit = window.innerHeight - dock - 12;
    if (r.bottom > limit) window.scrollBy({ top: Math.min(r.bottom - limit, r.top - 96) });
  }

  function onDraft(e: React.FormEvent<HTMLFormElement>) {
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setDraft({
      name: data.name,
      email: data.email,
      phone: data.phone,
      event_date: data.event_date,
      event_location: data.event_location,
      event_type: data.event_type,
      message: data.message,
    });
    // Once a field was flagged, re-check it while the visitor corrects it;
    // the summary alert goes away when nothing is left to fix.
    if (Object.keys(errors).length > 0) {
      const now = validate(data);
      const next: Errors = {};
      for (const k of Object.keys(errors) as FieldKey[]) if (now[k]) next[k] = now[k];
      setErrors(next);
      if (Object.keys(next).length === 0 && status.kind === "error") setStatus({ kind: "idle" });
    }
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
  const from = [draft.name?.trim(), draft.email?.trim() ? `<${draft.email.trim()}>` : ""].filter(Boolean).join(" ");
  // The preview lists only what is already filled in (plus the address it
  // goes to), so an empty form does not push the submit button a screen
  // further down.
  const previewRows = (
    [
      [dict.stage.previewTo, email],
      [dict.stage.previewFrom, from],
      [t.typeLabel, typeKey && t.types[typeKey] ? t.types[typeKey] : ""],
      [t.locationLabel, draft.event_location?.trim() ?? ""],
      [t.dateLabel, dateText ?? ""],
      [t.phoneLabel, draft.phone?.trim() ?? ""],
    ] as [string, string][]
  ).filter(([, v]) => v);
  const previewMessage = draft.message?.trim();
  const typeErr = errors.event_type;

  const form = done ? (
    <div
      className="flex min-h-[420px] flex-col items-start justify-center bg-deck-2 p-6 text-chalk outline-none md:p-10"
      ref={resultRef}
      role="status"
      tabIndex={-1}
    >
      <h3 className="font-stage text-[2.5rem] font-black uppercase leading-[1.02]">
        <span className="tape -rotate-[0.8deg]">
          {status.kind === "sent" ? t.submitOkTitle : t.direct}
        </span>
      </h3>
      <p className="copy mt-3">{status.message}</p>
      {status.kind === "fallback" ? (
        <>
          <div className="mt-6 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            <a className="btn-tape" href={mailtoHref(lastDraft.current)}>
              <Icon name="mail" size={18} />
              {t.sendByMail}
            </a>
            <button className="btn-line" onClick={copyDraft} type="button">
              {copyState === "ok" ? <Icon name="check" size={18} /> : null}
              {copyState === "ok" ? t.copied : t.copyDraft}
            </button>
          </div>
          <p className="mono mt-3 text-chalk-2 [overflow-wrap:anywhere]">{email}</p>
          {copyState === "fail" ? (
            <div className="st-field mt-6 w-full">
              <label htmlFor="bk-draft-copy">{t.copyFailed}</label>
              <textarea
                id="bk-draft-copy"
                onFocus={(e) => e.currentTarget.select()}
                readOnly
                rows={8}
                value={`${draftSubject(lastDraft.current)}\n\n${draftText(lastDraft.current)}`}
              />
            </div>
          ) : null}
        </>
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
      className="relative bg-deck-2 p-5 text-chalk sm:p-7 md:p-9"
      noValidate
      onFocus={keepClearOfDock}
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

      <p className="mono-cap mb-6 text-chalk-3">
        <span aria-hidden className="text-orange">* </span>
        {t.required}
      </p>

      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
        {field("name", t.nameLabel, <input {...a11y("name")} autoComplete="name" required type="text" />, { required: true })}
        {field("email", t.emailLabel, <input {...a11y("email")} autoComplete="email" inputMode="email" required type="email" />, { required: true })}

        {/* Event type as one-tap choices instead of a select menu. Same
            values as before, so the API and the inbox stay unchanged. */}
        <fieldset
          aria-describedby={typeErr ? "bk-event_type-err" : undefined}
          className="st-field st-choices sm:col-span-2"
          data-invalid={typeErr ? "" : undefined}
        >
          <legend>
            {t.typeLabel}
            <span aria-hidden className="text-orange"> *</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((k) => (
              <label className="st-chip" key={k}>
                <input
                  name="event_type"
                  required
                  type="radio"
                  value={k}
                />
                <span>{t.types[k]}</span>
              </label>
            ))}
          </div>
          {typeErr ? (
            <p className="st-field-error" id="bk-event_type-err">
              {typeErr}
            </p>
          ) : null}
        </fieldset>

        {field(
          "event_location",
          t.locationLabel,
          <input {...a11y("event_location", true)} autoComplete="address-level2" required type="text" />,
          { required: true, hint: t.locationHint },
        )}
        {field("event_date", t.dateLabel, <input {...a11y("event_date")} min={minDate} type="date" />)}
        {field(
          "message",
          t.messageLabel,
          <textarea {...a11y("message", true)} required rows={5} />,
          { required: true, hint: t.messageHint, span: true },
        )}
        {field(
          "phone",
          t.phoneLabel,
          <input {...a11y("phone", true)} autoComplete="tel" inputMode="tel" type="tel" />,
          { hint: t.phoneHint },
        )}
      </div>

      <aside aria-label={dict.stage.previewTitle} className="relative mt-10 bg-chalk p-4 text-[#121110] sm:p-5">
        <span aria-hidden className="tape-piece -top-2.5 left-5 -rotate-3 !bg-orange" />
        <p className="font-stage text-[1.375rem] font-extrabold uppercase leading-none">{dict.stage.previewTitle}</p>
        <dl className="mono mt-4 flex flex-col gap-2.5 sm:gap-1.5">
          {previewRows.map(([k, v]) => (
            <div className="grid grid-cols-1 gap-x-3 gap-y-0.5 sm:grid-cols-[12rem_minmax(0,1fr)]" key={k}>
              <dt className="text-[rgba(18,17,16,0.66)]">{k}</dt>
              <dd className="min-w-0 [overflow-wrap:anywhere]">{v}</dd>
            </div>
          ))}
        </dl>
        {previewMessage ? (
          <p className="mt-4 whitespace-pre-line border-t border-[rgba(18,17,16,0.25)] pt-3 text-[0.9375rem] leading-relaxed [overflow-wrap:anywhere]">
            {previewMessage}
          </p>
        ) : previewRows.length === 1 ? (
          <p className="mt-3 text-[0.9375rem] text-[rgba(18,17,16,0.66)]">{dict.stage.previewEmpty}</p>
        ) : null}
      </aside>

      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-[46ch] text-[0.875rem] leading-relaxed text-chalk-2">
          {t.privacyNote}{" "}
          <Link className="link-u py-[15px] text-chalk" href={`/${locale}/legal/privacy`}>
            {t.privacyLink}
          </Link>
          .
        </p>
        <div className="flex flex-col gap-2 sm:items-end">
          <button className="btn-tape flex-none" disabled={submitting} type="submit">
            {submitting ? <Icon name="spinner" size={18} /> : null}
            {submitting ? t.submitting : t.submit}
            {submitting ? null : <Icon name="arrow-right" size={20} />}
          </button>
          <p className="text-[0.875rem] text-chalk-2 sm:whitespace-nowrap sm:text-right">{t.reply}</p>
        </div>
      </div>

      <div aria-live="polite" className="min-h-0">
        {status.kind === "error" ? (
          <div className="mt-4 bg-[rgba(255,138,122,0.1)] px-4 py-3 text-[0.9375rem] text-alert" role="alert">
            <p>{status.message}</p>
            {status.delivery ? (
              <a className="link-u mt-2 inline-flex min-h-11 items-center gap-2 text-chalk" href={mailtoHref({ ...lastDraft.current, ...draft })}>
                <Icon name="mail" size={18} />
                {t.sendByMail}
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </form>
  );

  return (
    <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-y-8">
      <div className="lg:col-span-5 lg:col-start-1 lg:row-start-1">{intro}</div>
      <div className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 [--focus:var(--chalk)]">{form}</div>
      {facts ? <div className="lg:col-span-5 lg:col-start-1 lg:row-start-2">{facts}</div> : null}
    </div>
  );
}
