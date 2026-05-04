export const metadata = { title: "Datenschutz" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 pb-16 pt-24 text-sm leading-relaxed text-[color:var(--cream)] md:pt-32">
      <h1 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">
        Datenschutzerklärung
      </h1>
      <p className="mt-6 text-[color:var(--muted-cream)]">
        Wir nehmen den Schutz personenbezogener Daten ernst und behandeln Ihre
        Daten vertraulich gemäß der DSGVO. Eine ausführliche Datenschutzerklärung
        wird im nächsten Batch ergänzt.
      </p>
      <h2 className="mt-8 font-display text-xl">Kontaktanfragen</h2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Beim Absenden des Booking-Formulars werden Name, E-Mail und Nachricht
        verarbeitet. Wir verwenden diese Daten ausschließlich zur Beantwortung
        Ihrer Anfrage.
      </p>
      <h2 className="mt-8 font-display text-xl">Hosting</h2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Diese Website wird auf Vercel gehostet. Daten werden gemäß den
        Vereinbarungen zur Auftragsverarbeitung verarbeitet.
      </p>
    </article>
  );
}
