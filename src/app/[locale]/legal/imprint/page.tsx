import { LegalH2, LegalShell } from "@/components/legal/LegalShell";
import { site } from "@/data/site";

export const metadata = { title: "Impressum" };

export default function ImprintPage() {
  return (
    <LegalShell
      draftNote="Initialer Stand · später über Admin pflegbar"
      kicker="Legal"
      title="Impressum"
    >
      <LegalH2>Angaben gemäß § 5 TMG</LegalH2>
      <address className="mt-2 not-italic text-[color:var(--muted-cream)]">
        {site.imprint.name}
        <br />
        {site.imprint.street}
        <br />
        {site.imprint.city}
        <br />
        {site.imprint.country}
      </address>

      <LegalH2>Kontakt</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        E-Mail:{" "}
        <a
          className="text-[color:var(--gold-soft)] hover:text-[color:var(--gold)]"
          href={`mailto:${site.contact.info}`}
        >
          {site.contact.info}
        </a>
        <br />
        Telefon: {site.contact.phone}
      </p>

      <LegalH2>Verantwortlich für den Inhalt</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Verantwortlich nach § 55 Abs. 2 RStV: {site.imprint.name},{" "}
        {site.imprint.street}, {site.imprint.city}, {site.imprint.country}.
      </p>

      <LegalH2>Haftung für Inhalte</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte
        auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§
        8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
        übermittelte oder gespeicherte fremde Informationen zu überwachen.
      </p>

      <LegalH2>Streitbeilegung</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Die Europäische Kommission stellt eine Plattform zur
        Online-Streitbeilegung bereit. Wir sind nicht verpflichtet und nicht
        bereit, an einem Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </LegalShell>
  );
}
