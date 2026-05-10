import type { AdminShowRow } from "@/lib/admin/shows";

type Mode = "create" | "edit";

type ShowFormProps = {
  mode: Mode;
  locale: string;
  action: (formData: FormData) => void | Promise<void>;
  show?: AdminShowRow;
  submitLabel: string;
};

function isoDateOrEmpty(iso: string | null): string {
  if (!iso) return "";
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

function isoTimeOrEmpty(iso: string | null): string {
  if (!iso) return "";
  const m = iso.match(/T(\d{2}:\d{2})/);
  if (!m) return "";
  // The validator forces 12:00 for date-only entries — surface empty so
  // editors don't see a fake clock time they didn't type.
  if (m[1] === "12:00") return "";
  return m[1];
}

export function ShowForm({
  mode,
  locale,
  action,
  show,
  submitLabel,
}: ShowFormProps) {
  const datePrefill = isoDateOrEmpty(show?.starts_at ?? null);
  const timePrefill = isoTimeOrEmpty(show?.starts_at ?? null);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="locale" value={locale} />
      {mode === "edit" && show ? (
        <input type="hidden" name="id" value={show.id} />
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Datum"
          name="date"
          type="date"
          defaultValue={datePrefill}
        />
        <Field
          label="Uhrzeit (optional)"
          name="time"
          type="time"
          defaultValue={timePrefill}
        />
        <Field
          label="Venue / Ort"
          name="venue"
          required
          defaultValue={show?.venue ?? ""}
        />
        <Field label="Stadt" name="city" defaultValue={show?.city ?? ""} />
        <Field
          label="Land"
          name="country"
          defaultValue={show?.country ?? "Deutschland"}
        />
        <Field
          label="Art der Veranstaltung"
          name="event_type"
          defaultValue={show?.event_type ?? ""}
        />
        <Field
          label="Ticket-Link (optional)"
          name="ticket_url"
          type="url"
          placeholder="https://"
          defaultValue={show?.ticket_url ?? ""}
        />
        <Field
          label="Sortierung"
          name="sort_order"
          type="number"
          defaultValue={String(show?.sort_order ?? 0)}
        />
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-[color:var(--cream)]">
        <Checkbox
          label="Datum noch offen (TBA)"
          name="is_tba"
          defaultChecked={Boolean(show?.is_tba)}
        />
        <Checkbox
          label="Auf Website anzeigen"
          name="is_visible"
          defaultChecked={show?.is_visible ?? true}
        />
        <Checkbox
          label="Veröffentlicht"
          name="is_published"
          defaultChecked={show?.is_published ?? true}
        />
      </div>

      <div>
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-xs text-[color:var(--muted-cream)]">
      <span className="kicker">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="rounded-md border border-[color:var(--line)] bg-transparent px-3 py-2 text-sm text-[color:var(--cream)] focus:border-[color:var(--gold-soft)] focus:outline-none"
      />
    </label>
  );
}

function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-[color:var(--cream)]">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-[color:var(--gold-soft)]"
      />
      {label}
    </label>
  );
}
