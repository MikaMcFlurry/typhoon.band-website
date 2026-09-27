import { deleteMemberAction } from "./actions";

// Only for musicians added in Admin. Needs the confirm checkbox so a
// stray click cannot remove anyone.
export function DeleteMemberForm({ locale, slug }: { locale: string; slug: string }) {
  return (
    <form
      action={deleteMemberAction}
      className="mt-4 flex flex-wrap items-center gap-3 border-t border-[color:var(--line)] pt-3"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="slug" value={slug} />
      <label className="flex items-center gap-2 text-xs text-[color:var(--muted-cream)]">
        <input type="hidden" name="confirm" value="" />
        <input className="h-4 w-4" name="confirm" type="checkbox" />
        Ja, dieses Mitglied endgültig löschen
      </label>
      <button className="btn btn-secondary" type="submit">
        Löschen
      </button>
    </form>
  );
}
