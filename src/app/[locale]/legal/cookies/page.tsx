export const metadata = { title: "Cookies" };

export default function CookiesPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 pb-16 pt-24 text-sm leading-relaxed text-[color:var(--cream)] md:pt-32">
      <h1 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">
        Cookie-Hinweise
      </h1>
      <p className="mt-6 text-[color:var(--muted-cream)]">
        Diese Website verwendet aktuell ausschließlich technisch notwendige
        Cookies. Es findet keine Einbindung externer Tracker oder Analyse-Tools
        ohne ausdrückliche Einwilligung statt.
      </p>
      <p className="mt-4 text-[color:var(--muted-cream)]">
        Sobald optionale Embeds (z. B. YouTube, Spotify) aktiviert werden,
        erscheint hier ein Consent-Banner, mit dem Sie Ihre Auswahl jederzeit
        anpassen können.
      </p>
    </article>
  );
}
