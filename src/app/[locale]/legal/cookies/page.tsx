"use client";

import { useDict } from "@/components/i18n/DictProvider";
import { LegalH2, LegalShell } from "@/components/legal/LegalShell";

export default function CookiesPage() {
  const { dict, locale } = useDict();
  return (
    <LegalShell kicker={dict.footer.legal} title={dict.legal.cookiesTitle}>
      {locale === "en" ? <BodyEn /> : locale === "tr" ? <BodyTr /> : <BodyDe />}
    </LegalShell>
  );
}

function BodyDe() {
  return (
    <>
      <p className="text-[color:var(--muted-cream)]">
        Diese Website verwendet aktuell ausschließlich technisch notwendige
        Cookies. Es findet keine Einbindung externer Tracker oder Analyse-Tools
        statt.
      </p>
      <LegalH2>Technisch notwendige Cookies</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Notwendige Cookies sorgen für grundlegende Funktionen wie sichere
        Verbindungsaufbauten und werden ohne eure Einwilligung gesetzt
        (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
      <LegalH2>Optionale Embeds</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Sobald optionale Embeds (z. B. YouTube, Spotify, SoundCloud) aktiviert
        werden, erscheint ein Consent-Banner. Erst nach eurer aktiven Zustimmung
        werden Verbindungen zu den jeweiligen Anbietern aufgebaut.
      </p>
      <LegalH2>Cookie-Banner</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Eure Zustimmung wird ausschließlich lokal in eurem Browser
        (localStorage) gespeichert. Es werden keine Daten an Server gesendet.
      </p>
    </>
  );
}

function BodyEn() {
  return (
    <>
      <p className="text-[color:var(--muted-cream)]">
        This site currently only uses technically required cookies. No external
        trackers or analytics tools are loaded.
      </p>
      <LegalH2>Technically required cookies</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Required cookies enable basic functionality such as secure connections
        and are set without your consent (Art. 6(1)(f) GDPR).
      </p>
      <LegalH2>Optional embeds</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        When optional embeds are enabled in the future (e.g. YouTube, Spotify,
        SoundCloud), a consent banner will appear. Connections to those
        providers will only be opened after your active confirmation.
      </p>
      <LegalH2>Cookie banner</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Your choice is stored exclusively in your browser (localStorage). No
        data is sent to a server.
      </p>
    </>
  );
}

function BodyTr() {
  return (
    <>
      <p className="text-[color:var(--muted-cream)]">
        Bu site şu anda yalnızca teknik olarak gerekli çerezleri kullanır.
        Harici izleyici veya analiz aracı yüklenmez.
      </p>
      <LegalH2>Teknik olarak gerekli çerezler</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Gerekli çerezler güvenli bağlantı gibi temel işlevleri sağlar ve
        onayınız olmadan ayarlanır (GDPR Madde 6(1)(f)).
      </p>
      <LegalH2>Opsiyonel gömülü içerikler</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        İleride opsiyonel gömülü içerikler (örn. YouTube, Spotify, SoundCloud)
        etkinleştirildiğinde bir onay bildirimi görüntülenecektir. Bu
        sağlayıcılarla bağlantı, ancak aktif onayınızdan sonra kurulur.
      </p>
      <LegalH2>Çerez bildirimi</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Tercihiniz yalnızca tarayıcınızda (localStorage) saklanır. Sunucuya
        veri gönderilmez.
      </p>
    </>
  );
}
