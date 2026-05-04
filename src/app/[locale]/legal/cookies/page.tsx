import { LegalH2, LegalShell } from "@/components/legal/LegalShell";

export const metadata = { title: "Cookies" };

export default function CookiesPage() {
  return (
    <LegalShell
      draftNote="Initialer Stand · wird ergänzt, sobald optionale Embeds aktiv sind"
      kicker="Legal"
      title="Cookie-Hinweise"
    >
      <p className="text-[color:var(--muted-cream)]">
        Diese Website verwendet aktuell ausschließlich technisch notwendige
        Cookies. Es findet keine Einbindung externer Tracker oder
        Analyse-Tools ohne ausdrückliche Einwilligung statt.
      </p>

      <LegalH2>Technisch notwendige Cookies</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Notwendige Cookies sorgen für grundlegende Funktionen wie sichere
        Verbindungsaufbauten und werden ohne eure Einwilligung gesetzt
        (Art. 6 Abs. 1 lit. f DSGVO).
      </p>

      <LegalH2>Optionale Embeds</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Sobald optionale Embeds (z. B. YouTube, Spotify, SoundCloud)
        aktiviert werden, erscheint hier ein Consent-Banner. Erst nach eurer
        aktiven Zustimmung werden Verbindungen zu den jeweiligen Anbietern
        aufgebaut.
      </p>

      <LegalH2>Auswahl ändern</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Eure Einstellungen könnt ihr jederzeit anpassen, sobald die
        Consent-Funktion in einem späteren Release aktiv ist.
      </p>
    </LegalShell>
  );
}
