"use client";

import { useDict } from "@/components/i18n/DictProvider";
import { LegalH2, LegalShell } from "@/components/legal/LegalShell";
import { site } from "@/data/site";

export default function PrivacyPage() {
  const { dict, locale } = useDict();
  return (
    <LegalShell kicker={dict.footer.legal} title={dict.legal.privacyTitle}>
      {locale === "en" ? <BodyEn /> : locale === "tr" ? <BodyTr /> : <BodyDe />}
    </LegalShell>
  );
}

function Responsible() {
  return (
    <address className="mt-2 not-italic text-[color:var(--muted-cream)]">
      {site.imprint.name}
      <br />
      {site.imprint.street}
      <br />
      {site.imprint.city}, {site.imprint.country}
      <br />
      {site.contact.booking} · {site.contact.phone}
    </address>
  );
}

function BodyDe() {
  return (
    <>
      <p className="text-[color:var(--muted-cream)]">
        Wir nehmen den Schutz personenbezogener Daten ernst und behandeln eure
        Daten vertraulich gemäß den gesetzlichen Vorschriften (DSGVO, BDSG) und
        dieser Datenschutzerklärung.
      </p>
      <LegalH2>Verantwortlicher</LegalH2>
      <Responsible />
      <LegalH2>Booking-Anfragen</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Wenn ihr unser Booking-Formular nutzt, verarbeiten wir die angegebenen
        Daten (Name, E-Mail, Telefon, Veranstaltungsdatum, Ort, Art der
        Veranstaltung, Nachricht) ausschließlich zur Beantwortung eurer Anfrage.
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Die Daten werden nicht an
        Dritte weitergegeben.
      </p>
      <LegalH2>Hosting</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Diese Website wird auf Vercel gehostet. Beim Aufruf der Seite werden
        technisch notwendige Logdaten verarbeitet. Eine Auftragsverarbeitung gemäß
        Art. 28 DSGVO liegt vor.
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
          href={`mailto:${site.contact.booking}`}
        >
          {site.contact.booking}
        </a>
        .
      </p>
    </>
  );
}

function BodyEn() {
  return (
    <>
      <p className="text-[color:var(--muted-cream)]">
        We take the protection of personal data seriously and process your data
        confidentially in accordance with the GDPR, the German Federal Data
        Protection Act and this privacy policy.
      </p>
      <LegalH2>Controller</LegalH2>
      <Responsible />
      <LegalH2>Booking requests</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        When you use our booking form we process the data you provide (name,
        email, phone, event date, location, event type, message) solely to
        answer your request. The legal basis is Art. 6(1)(b) GDPR. Data is not
        shared with third parties.
      </p>
      <LegalH2>Hosting</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        This site is hosted on Vercel. When the site is loaded, technically
        required log data is processed. Data processing follows Art. 28 GDPR.
      </p>
      <LegalH2>External platforms</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Links to external services (Spotify, YouTube, Instagram, Facebook,
        SoundCloud, Bandcamp) are plain links only. No embeds load and no data
        is transmitted to those providers until you actively click through.
      </p>
      <LegalH2>Your rights</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        You have the right to access, rectify, erase or restrict processing of
        your data, to data portability, and to object. Please contact{" "}
        <a
          className="text-[color:var(--gold-soft)] hover:text-[color:var(--gold)]"
          href={`mailto:${site.contact.booking}`}
        >
          {site.contact.booking}
        </a>
        .
      </p>
    </>
  );
}

function BodyTr() {
  return (
    <>
      <p className="text-[color:var(--muted-cream)]">
        Kişisel verilerin korunmasını ciddiye alır, verilerinizi GDPR, Alman
        Federal Veri Koruma Yasası ve bu gizlilik bildirimi uyarınca gizli
        tutarız.
      </p>
      <LegalH2>Veri sorumlusu</LegalH2>
      <Responsible />
      <LegalH2>Booking talepleri</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Booking formumuzu kullandığınızda verdiğiniz bilgileri (isim, e-posta,
        telefon, etkinlik tarihi, yer, etkinlik türü, mesaj) yalnızca
        talebinize cevap vermek için işleriz. Yasal dayanak GDPR Madde 6(1)(b)
        kapsamındadır. Veriler üçüncü taraflarla paylaşılmaz.
      </p>
      <LegalH2>Barındırma</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Bu site Vercel üzerinde barındırılmaktadır. Site yüklendiğinde teknik
        olarak gerekli günlük verileri işlenir. Veri işleme GDPR Madde 28
        kapsamındadır.
      </p>
      <LegalH2>Harici platformlar</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Harici hizmetlere (Spotify, YouTube, Instagram, Facebook, SoundCloud,
        Bandcamp) yalnızca düz bağlantı verilir. Aktif olarak tıklamadığınız
        sürece bu sağlayıcılara gömülü içerik veya veri aktarımı yoktur.
      </p>
      <LegalH2>Haklarınız</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Verilerinize erişme, düzeltme, silme, işlemeyi kısıtlama, veri
        taşınabilirliği ve itiraz hakkına sahipsiniz. Lütfen{" "}
        <a
          className="text-[color:var(--gold-soft)] hover:text-[color:var(--gold)]"
          href={`mailto:${site.contact.booking}`}
        >
          {site.contact.booking}
        </a>{" "}
        adresine yazın.
      </p>
    </>
  );
}
