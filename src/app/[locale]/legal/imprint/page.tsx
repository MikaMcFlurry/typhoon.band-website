import { site } from "@/data/site";

export const metadata = { title: "Impressum" };

export default function ImprintPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 pb-16 pt-24 text-sm leading-relaxed text-[color:var(--cream)] md:pt-32">
      <h1 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">
        Impressum
      </h1>
      <p className="mt-6">Angaben gemäß § 5 TMG</p>
      <address className="mt-3 not-italic text-[color:var(--muted-cream)]">
        {site.imprint.name}
        <br />
        {site.imprint.street}
        <br />
        {site.imprint.city}
        <br />
        {site.imprint.country}
      </address>
      <h2 className="mt-6 font-display text-xl">Kontakt</h2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        E-Mail:{" "}
        <a className="text-[color:var(--gold-soft)]" href={`mailto:${site.contact.info}`}>
          {site.contact.info}
        </a>
        <br />
        Telefon: {site.contact.phone}
      </p>
      <p className="mt-6 text-xs text-[color:var(--muted)]">
        Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: {site.imprint.name}.
      </p>
    </article>
  );
}
