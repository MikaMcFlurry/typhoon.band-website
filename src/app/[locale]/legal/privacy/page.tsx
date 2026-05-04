import { LegalH2, LegalShell } from "@/components/legal/LegalShell";
import { site } from "@/data/site";

export const metadata = { title: "Datenschutz" };

export default function PrivacyPage() {
  return (
    <LegalShell
      draftNote="Initialer Stand · final wird mit Backend-Anschluss aktualisiert"
      kicker="Legal"
      title="Datenschutzerklärung"
    >
      <p className="text-[color:var(--muted-cream)]">
        Wir nehmen den Schutz personenbezogener Daten ernst und behandeln eure
        Daten vertraulich gemäß den gesetzlichen Vorschriften (DSGVO, BDSG)
        und dieser Datenschutzerklärung.
      </p>

      <LegalH2>Verantwortlicher</LegalH2>
      <address className="mt-2 not-italic text-[color:var(--muted-cream)]">
        {site.imprint.name}
        <br />
        {site.imprint.street}
        <br />
        {site.imprint.city}, {site.imprint.country}
        <br />
        {site.contact.info} · {site.contact.phone}
      </address>

      <LegalH2>Booking-Anfragen</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Wenn ihr unser Booking-Formular nutzt, verarbeiten wir die angegebenen
        Daten (Name, E-Mail, Telefon, Veranstaltungsdatum, Ort, Art der
        Veranstaltung, Nachricht) ausschließlich zur Beantwortung eurer
        Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Die Daten
        werden nicht an Dritte weitergegeben.
      </p>

      <LegalH2>Hosting</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Diese Website wird auf Vercel gehostet. Beim Aufruf der Seite werden
        technisch notwendige Logdaten verarbeitet. Eine Auftragsverarbeitung
        gemäß Art. 28 DSGVO liegt vor.
      </p>

      <LegalH2>Externe Plattformen</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Verlinkungen zu externen Diensten (Spotify, YouTube, Instagram, Facebook,
        SoundCloud, Bandcamp) werden ausschließlich als reine Links eingebunden.
        Es findet kein Embed und keine Datenübertragung an die Anbieter statt,
        bevor ihr aktiv klickt.
      </p>

      <LegalH2>Eure Rechte</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Ihr habt das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung
        der Verarbeitung, Datenübertragbarkeit sowie Widerspruch. Wendet euch
        dafür an{" "}
        <a
          className="text-[color:var(--gold-soft)] hover:text-[color:var(--gold)]"
          href={`mailto:${site.contact.info}`}
        >
          {site.contact.info}
        </a>
        .
      </p>
    </LegalShell>
  );
}
