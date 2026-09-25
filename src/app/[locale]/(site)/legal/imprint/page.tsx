import { getDict } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/locales";
import { getLegalPage, getSeoEntry } from "@/lib/content";
import { LegalBody, LegalH2, LegalShell } from "@/components/legal/LegalShell";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const entry = await getSeoEntry("/legal/imprint", locale);
  return {
    title: entry.title ?? undefined,
    description: entry.description ?? undefined,
    openGraph: entry.ogImageUrl
      ? { images: [{ url: entry.ogImageUrl }] }
      : undefined,
  };
}

export default async function ImprintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const dict = getDict(locale);
  const page = await getLegalPage("imprint", locale);

  // `bodyMd` is non-empty only when Supabase has a published page with a
  // translation for this locale; otherwise we render the curated static
  // fallback bodies below.
  if (page.bodyMd.trim().length > 0) {
    return (
      <LegalShell
        kicker={dict.footer.legal}
        title={page.title}
        showDraftNote={false}
      >
        <LegalBody text={page.bodyMd} />
      </LegalShell>
    );
  }

  const body =
    locale === "en" ? <BodyEn /> : locale === "tr" ? <BodyTr /> : <BodyDe />;
  return (
    <LegalShell kicker={dict.footer.legal} title={page.title}>
      {body}
    </LegalShell>
  );
}

function Address() {
  return (
    <address className="mt-2 not-italic text-[color:var(--muted-cream)]">
      {site.imprint.name}
      <br />
      {site.imprint.street}
      <br />
      {site.imprint.city}
      <br />
      {site.imprint.country}
    </address>
  );
}

function Contact() {
  return (
    <p className="mt-2 text-[color:var(--muted-cream)]">
      <a
        className="text-[color:var(--gold-soft)] hover:text-[color:var(--gold)]"
        href={`mailto:${site.contact.booking}`}
      >
        {site.contact.booking}
      </a>
      <br />
      {site.contact.phone}
    </p>
  );
}

function BodyDe() {
  return (
    <>
      <LegalH2>Angaben gemäß § 5 TMG</LegalH2>
      <Address />
      <LegalH2>Kontakt</LegalH2>
      <Contact />
      <LegalH2>Verantwortlich für den Inhalt</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Verantwortlich nach § 55 Abs. 2 RStV: {site.imprint.name}, {site.imprint.street},{" "}
        {site.imprint.city}, {site.imprint.country}.
      </p>
      <LegalH2>Haftung für Inhalte</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf
        diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis
        10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte
        oder gespeicherte fremde Informationen zu überwachen.
      </p>
      <LegalH2>Streitbeilegung</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung
        bereit. Wir sind nicht verpflichtet und nicht bereit, an einem
        Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
        teilzunehmen.
      </p>
    </>
  );
}

function BodyEn() {
  return (
    <>
      <LegalH2>Details pursuant to § 5 TMG (German law)</LegalH2>
      <Address />
      <LegalH2>Contact</LegalH2>
      <Contact />
      <LegalH2>Responsible for the content</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Responsible under § 55 paragraph 2 RStV: {site.imprint.name},{" "}
        {site.imprint.street}, {site.imprint.city}, {site.imprint.country}.
      </p>
      <LegalH2>Liability for content</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        As a service provider we are responsible for our own content on these pages
        in accordance with general laws (§ 7 paragraph 1 TMG). Under §§ 8–10 TMG we
        are not, however, obliged to monitor transmitted or stored third-party
        information.
      </p>
      <LegalH2>Online dispute resolution</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        The European Commission provides a platform for online dispute resolution.
        We are neither obliged nor willing to participate in a dispute resolution
        procedure before a consumer arbitration board.
      </p>
    </>
  );
}

function BodyTr() {
  return (
    <>
      <LegalH2>§ 5 TMG kapsamındaki bilgiler</LegalH2>
      <Address />
      <LegalH2>İletişim</LegalH2>
      <Contact />
      <LegalH2>İçerikten sorumlu kişi</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        § 55 fıkra 2 RStV uyarınca sorumlu: {site.imprint.name}, {site.imprint.street},{" "}
        {site.imprint.city}, {site.imprint.country}.
      </p>
      <LegalH2>İçerik sorumluluğu</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Hizmet sağlayıcısı olarak, bu sayfalardaki kendi içeriklerimizden § 7 fıkra
        1 TMG uyarınca genel yasalar çerçevesinde sorumluyuz. Ancak §§ 8–10 TMG
        uyarınca iletilen veya saklanan üçüncü taraf bilgilerini izleme yükümlülüğümüz
        bulunmamaktadır.
      </p>
      <LegalH2>Çevrimiçi anlaşmazlık çözümü</LegalH2>
      <p className="mt-2 text-[color:var(--muted-cream)]">
        Avrupa Komisyonu çevrimiçi anlaşmazlık çözümü için bir platform sunmaktadır.
        Bir tüketici tahkim kurulu önünde anlaşmazlık çözüm sürecine katılma
        zorunluluğumuz veya isteğimiz bulunmamaktadır.
      </p>
    </>
  );
}
