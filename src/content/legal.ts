// Curated fallback texts for the legal pages (DE / EN / TR).
//
// Shown when Admin → Legal has no published page for the locale. Written
// as plain data so the same renderer serves Supabase Markdown and these
// fallbacks. This is not legal advice — the owner should have it reviewed.
//
// Changes vs. the previous live texts: § 5 DDG instead of § 5 TMG,
// § 18 Abs. 2 MStV instead of § 55 Abs. 2 RStV, the discontinued EU ODR
// platform reference removed, the actual processors (Vercel, Supabase,
// Resend) named, storage duration and the right to complain added, and
// the incorrect "no cookies/no third parties" statements corrected.

import type { Locale } from "@/i18n/locales";
import type { LegalPageType } from "@/lib/content/types";

export type LegalBlock = string | { list: string[] };
export type LegalSection = { heading?: string; blocks: LegalBlock[] };
export type LegalDoc = { updated: string; sections: LegalSection[] };

type Facts = {
  name: string;
  street: string;
  city: string;
  country: string;
  email: string;
  phone: string;
};

const UPDATED: Record<Locale, string> = {
  de: "September 2026",
  en: "September 2026",
  tr: "Eylül 2026",
};

function address(f: Facts) {
  return `${f.name}\n${f.street}\n${f.city}\n${f.country}`;
}

function imprint(locale: Locale, f: Facts): LegalSection[] {
  if (locale === "en") {
    return [
      { heading: "Information pursuant to § 5 DDG (German Digital Services Act)", blocks: [address(f)] },
      { heading: "Contact", blocks: [`Email: ${f.email}\nPhone: ${f.phone}`] },
      {
        heading: "Responsible for content pursuant to § 18 (2) MStV",
        blocks: [`${f.name}, ${f.street}, ${f.city}`],
      },
      {
        heading: "Liability for content and links",
        blocks: [
          "We are responsible for our own content on these pages under general law. Operators of linked external websites are solely responsible for their content. We check links when setting them; if we become aware of any infringement, we will remove the link or content immediately.",
        ],
      },
      {
        heading: "Copyright",
        blocks: [
          "Music, recordings, photos and texts on this website are protected by copyright. The demo recordings are provided for listening only; downloading or redistributing them is not permitted.",
        ],
      },
      {
        heading: "Consumer dispute resolution",
        blocks: [
          "We are neither obliged nor willing to take part in dispute resolution proceedings before a consumer arbitration board.",
        ],
      },
    ];
  }
  if (locale === "tr") {
    return [
      { heading: "§ 5 DDG (Alman Dijital Hizmetler Yasası) uyarınca bilgiler", blocks: [address(f)] },
      { heading: "İletişim", blocks: [`E-posta: ${f.email}\nTelefon: ${f.phone}`] },
      {
        heading: "§ 18 (2) MStV uyarınca içerikten sorumlu kişi",
        blocks: [`${f.name}, ${f.street}, ${f.city}`],
      },
      {
        heading: "İçerik ve bağlantılar için sorumluluk",
        blocks: [
          "Bu sayfalardaki kendi içeriklerimizden genel yasalar çerçevesinde sorumluyuz. Bağlantı verilen harici sitelerin içeriğinden yalnızca o sitelerin işletmecileri sorumludur. Bir hak ihlalinden haberdar olursak ilgili bağlantıyı veya içeriği derhal kaldırırız.",
        ],
      },
      {
        heading: "Telif hakkı",
        blocks: [
          "Bu sitedeki müzik, kayıtlar, fotoğraflar ve metinler telif hakkıyla korunmaktadır. Demo kayıtları yalnızca dinlemek içindir; indirilmesi veya yeniden dağıtılması yasaktır.",
        ],
      },
      {
        heading: "Tüketici uyuşmazlıklarının çözümü",
        blocks: [
          "Bir tüketici hakem kurulu önünde uyuşmazlık çözüm sürecine katılma yükümlülüğümüz ve isteğimiz bulunmamaktadır.",
        ],
      },
    ];
  }
  return [
    { heading: "Angaben gemäß § 5 DDG", blocks: [address(f)] },
    { heading: "Kontakt", blocks: [`E-Mail: ${f.email}\nTelefon: ${f.phone}`] },
    {
      heading: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",
      blocks: [`${f.name}, ${f.street}, ${f.city}`],
    },
    {
      heading: "Haftung für Inhalte und Links",
      blocks: [
        "Für eigene Inhalte auf diesen Seiten sind wir nach den allgemeinen Gesetzen verantwortlich. Für die Inhalte verlinkter externer Seiten sind ausschließlich deren Betreiber verantwortlich. Wir prüfen Links beim Setzen; werden uns Rechtsverletzungen bekannt, entfernen wir den Link oder Inhalt umgehend.",
      ],
    },
    {
      heading: "Urheberrecht",
      blocks: [
        "Musik, Aufnahmen, Fotos und Texte auf dieser Website sind urheberrechtlich geschützt. Die Demo-Aufnahmen stehen nur zum Anhören bereit; Download und Weiterverbreitung sind nicht gestattet.",
      ],
    },
    {
      heading: "Verbraucherstreitbeilegung",
      blocks: [
        "Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
      ],
    },
  ];
}

function privacy(locale: Locale, f: Facts): LegalSection[] {
  if (locale === "en") {
    return [
      {
        blocks: [
          "This policy explains which personal data is processed when you visit this website or send us a booking request. The website uses no tracking, analytics or advertising cookies and loads no third-party content such as external fonts, videos or players without your consent.",
        ],
      },
      { heading: "Controller", blocks: [`${address(f)}\nEmail: ${f.email} · Phone: ${f.phone}`] },
      {
        heading: "Hosting and server logs",
        blocks: [
          "The website is hosted by Vercel Inc. (USA). When you open a page, technically necessary data is processed: IP address, date and time, requested page, referrer and browser information. This serves the secure and stable operation of the site (Art. 6(1)(f) GDPR). Vercel acts as our processor under Art. 28 GDPR.",
        ],
      },
      {
        heading: "Booking requests",
        blocks: [
          "If you use the booking form, we process the data you enter (name, email, phone, event date, location, type of event, message), the language of the page and your browser's user-agent string, in order to answer your request and prepare a possible booking (Art. 6(1)(b) GDPR).",
          { list: [
            "Supabase Inc. stores the request in our database (processor).",
            "Resend Inc. (USA) delivers the notification email to our booking address (processor).",
          ] },
          "We delete requests permanently once they are no longer needed to handle them, or when you ask us to, unless statutory retention obligations apply (for example after a booking contract).",
        ],
      },
      {
        heading: "Contact by email or phone",
        blocks: [
          "If you write to us by email or call us, we process your contact details and the content of your message to answer your enquiry (Art. 6(1)(b) GDPR for booking enquiries, otherwise Art. 6(1)(f) GDPR). We delete this data once the enquiry has been dealt with, unless statutory retention obligations apply.",
        ],
      },
      {
        heading: "Music and images",
        blocks: [
          "Demo recordings and photos are delivered by our hosting provider or from the Supabase storage. Your IP address is processed for technical reasons when these files are loaded (Art. 6(1)(f) GDPR). Recordings are streamed only; no download is offered.",
        ],
      },
      {
        heading: "Transfers to third countries",
        blocks: [
          "Where processors are based in or access data from the USA, transfers rely on appropriate safeguards (EU–US Data Privacy Framework and/or EU Standard Contractual Clauses).",
        ],
      },
      {
        heading: "Local storage instead of cookies",
        blocks: [
          "The public website sets no cookies. Your privacy choice is stored only in your browser (localStorage, key “typhoon.consent.v1”) and can be changed at any time via “Privacy settings” in the footer. The band's login area uses technically necessary cookies for band members only.",
        ],
      },
      {
        heading: "External platforms",
        blocks: [
          "Links to Spotify, YouTube, Instagram and similar services are plain links. Data is only transmitted to these providers when you follow a link. Embedded players or videos, if offered, load only after you allow “External media”.",
        ],
      },
      {
        heading: "Your rights",
        blocks: [
          `You have the right of access, rectification, erasure, restriction of processing, data portability and objection (Art. 15–21 GDPR), and you can withdraw any consent with effect for the future. Contact: ${f.email}.`,
          "You also have the right to lodge a complaint with a data protection supervisory authority, for example the Bavarian Data Protection Authority (BayLDA) in Ansbach.",
        ],
      },
      {
        heading: "Right to object (Art. 21 GDPR)",
        blocks: [
          `Where we process data on the basis of Art. 6(1)(f) GDPR (legitimate interests, e.g. server logs and the delivery of music and images), you have the right to object to this processing at any time on grounds relating to your particular situation. We will then stop the processing unless we can demonstrate compelling legitimate grounds that override your interests, or the processing serves the establishment, exercise or defence of legal claims. An informal message to ${f.email} is sufficient.`,
        ],
      },
    ];
  }
  if (locale === "tr") {
    return [
      {
        blocks: [
          "Bu metin, siteyi ziyaret ettiğinizde veya bize booking talebi gönderdiğinizde hangi kişisel verilerin işlendiğini açıklar. Site izleme, analiz ya da reklam çerezi kullanmaz; harici yazı tipi, video veya oynatıcı gibi üçüncü taraf içerikleri onayınız olmadan yüklemez.",
        ],
      },
      { heading: "Veri sorumlusu", blocks: [`${address(f)}\nE-posta: ${f.email} · Telefon: ${f.phone}`] },
      {
        heading: "Barındırma ve sunucu kayıtları",
        blocks: [
          "Site Vercel Inc. (ABD) tarafından barındırılır. Bir sayfa açıldığında teknik olarak gerekli veriler işlenir: IP adresi, tarih ve saat, açılan sayfa, yönlendiren sayfa ve tarayıcı bilgileri. Bu, sitenin güvenli ve istikrarlı çalışmasına hizmet eder (GDPR Madde 6(1)(f)). Vercel, GDPR Madde 28 kapsamında veri işleyenimizdir.",
        ],
      },
      {
        heading: "Booking talepleri",
        blocks: [
          "Booking formunu kullandığınızda girdiğiniz bilgileri (isim, e-posta, telefon, etkinlik tarihi, yer, etkinlik türü, mesaj), sayfa dilini ve tarayıcınızın user-agent bilgisini talebinizi yanıtlamak ve olası bir anlaşmayı hazırlamak için işleriz (GDPR Madde 6(1)(b)).",
          { list: [
            "Supabase Inc. talebi veritabanımızda saklar (veri işleyen).",
            "Resend Inc. (ABD) bildirim e-postasını booking adresimize iletir (veri işleyen).",
          ] },
          "Talepleri, işlenmeleri için artık gerekli olmadığında veya siz talep ettiğinizde, yasal saklama yükümlülüğü bulunmadığı sürece kalıcı olarak sileriz.",
        ],
      },
      {
        heading: "E-posta veya telefonla iletişim",
        blocks: [
          "Bize e-posta yazdığınızda veya telefon ettiğinizde, talebinizi yanıtlamak için iletişim bilgilerinizi ve mesajınızın içeriğini işleriz (booking talepleri için GDPR Madde 6(1)(b), diğer durumlarda GDPR Madde 6(1)(f)). Talebiniz sonuçlandıktan sonra, yasal saklama yükümlülüğü bulunmadığı sürece bu verileri sileriz.",
        ],
      },
      {
        heading: "Müzik ve görseller",
        blocks: [
          "Demo kayıtları ve fotoğraflar barındırma sağlayıcımız veya Supabase depolama alanı üzerinden sunulur. Bu dosyalar yüklenirken IP adresiniz teknik nedenlerle işlenir (GDPR Madde 6(1)(f)). Kayıtlar yalnızca dinlenebilir; indirme sunulmaz.",
        ],
      },
      {
        heading: "Üçüncü ülkelere aktarım",
        blocks: [
          "Veri işleyenler ABD'de bulunuyorsa veya verilere oradan erişiyorsa, aktarım uygun güvencelere (AB–ABD Veri Gizliliği Çerçevesi ve/veya AB Standart Sözleşme Maddeleri) dayanır.",
        ],
      },
      {
        heading: "Çerez yerine yerel depolama",
        blocks: [
          "Herkese açık site çerez kullanmaz. Gizlilik tercihiniz yalnızca tarayıcınızda saklanır (localStorage, anahtar “typhoon.consent.v1”) ve alt bilgideki “Gizlilik ayarları” ile her zaman değiştirilebilir. Grubun giriş alanı yalnızca grup üyeleri için teknik olarak gerekli çerezler kullanır.",
        ],
      },
      {
        heading: "Harici platformlar",
        blocks: [
          "Spotify, YouTube, Instagram ve benzeri hizmetlere verilen bağlantılar düz bağlantılardır. Veriler yalnızca bir bağlantıya tıkladığınızda bu sağlayıcılara aktarılır. Gömülü oynatıcılar veya videolar sunulursa, yalnızca “Harici medya”ya izin verdikten sonra yüklenir.",
        ],
      },
      {
        heading: "Haklarınız",
        blocks: [
          `Erişim, düzeltme, silme, işlemeyi kısıtlama, veri taşınabilirliği ve itiraz haklarına sahipsiniz (GDPR Madde 15–21) ve verdiğiniz onayı ileriye dönük olarak geri alabilirsiniz. İletişim: ${f.email}.`,
          "Ayrıca bir veri koruma denetim makamına, örneğin Ansbach'taki Bavyera Veri Koruma Denetim Dairesi'ne (BayLDA) şikâyette bulunma hakkınız vardır.",
        ],
      },
      {
        heading: "İtiraz hakkı (GDPR Madde 21)",
        blocks: [
          `Verileri GDPR Madde 6(1)(f) (meşru menfaat; örneğin sunucu kayıtları, müzik ve görsellerin sunulması) kapsamında işlediğimiz durumlarda, özel durumunuzdan kaynaklanan nedenlerle bu işlemeye her zaman itiraz etme hakkınız vardır. Bu durumda, menfaatlerinize üstün gelen zorlayıcı meşru gerekçeler ya da işlemenin hukuki taleplerin ileri sürülmesi, kullanılması veya savunulması için gerekli olduğunu ortaya koyamadığımız sürece işlemeyi durdururuz. ${f.email} adresine kısa bir mesaj yeterlidir.`,
        ],
      },
    ];
  }
  return [
    {
      blocks: [
        "Diese Erklärung beschreibt, welche personenbezogenen Daten verarbeitet werden, wenn ihr diese Website besucht oder uns eine Booking-Anfrage schickt. Die Website nutzt keine Tracking-, Analyse- oder Werbe-Cookies und lädt keine Inhalte von Drittanbietern wie externe Schriftarten, Videos oder Player ohne eure Einwilligung.",
      ],
    },
    { heading: "Verantwortlicher", blocks: [`${address(f)}\nE-Mail: ${f.email} · Telefon: ${f.phone}`] },
    {
      heading: "Hosting und Server-Logs",
      blocks: [
        "Die Website wird von Vercel Inc. (USA) gehostet. Beim Aufruf einer Seite werden technisch notwendige Daten verarbeitet: IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Referrer und Browser-Informationen. Das dient dem sicheren und stabilen Betrieb der Website (Art. 6 Abs. 1 lit. f DSGVO). Vercel ist unser Auftragsverarbeiter nach Art. 28 DSGVO.",
      ],
    },
    {
      heading: "Booking-Anfragen",
      blocks: [
        "Wenn ihr das Booking-Formular nutzt, verarbeiten wir eure Angaben (Name, E-Mail, Telefon, Veranstaltungsdatum, Ort, Art der Veranstaltung, Nachricht), die Sprache der Seite und die Browser-Kennung (User-Agent), um eure Anfrage zu beantworten und ein mögliches Booking vorzubereiten (Art. 6 Abs. 1 lit. b DSGVO).",
        { list: [
          "Supabase Inc. speichert die Anfrage in unserer Datenbank (Auftragsverarbeiter).",
          "Resend Inc. (USA) stellt die Benachrichtigungs-E-Mail an unsere Booking-Adresse zu (Auftragsverarbeiter).",
        ] },
        "Wir löschen Anfragen endgültig, sobald sie für die Bearbeitung nicht mehr erforderlich sind oder ihr die Löschung verlangt, soweit keine gesetzlichen Aufbewahrungspflichten bestehen (z. B. nach einem Booking-Vertrag).",
      ],
    },
    {
      heading: "Kontakt per E-Mail oder Telefon",
      blocks: [
        "Wenn ihr uns per E-Mail schreibt oder anruft, verarbeiten wir eure Kontaktdaten und den Inhalt eurer Nachricht, um die Anfrage zu beantworten (bei Booking-Anfragen Art. 6 Abs. 1 lit. b DSGVO, sonst Art. 6 Abs. 1 lit. f DSGVO). Wir löschen diese Daten, sobald die Anfrage erledigt ist, soweit keine gesetzlichen Aufbewahrungspflichten bestehen.",
      ],
    },
    {
      heading: "Musik und Bilder",
      blocks: [
        "Demo-Aufnahmen und Fotos werden von unserem Hosting oder aus dem Speicher von Supabase ausgeliefert. Beim Laden dieser Dateien wird eure IP-Adresse technisch bedingt verarbeitet (Art. 6 Abs. 1 lit. f DSGVO). Die Aufnahmen werden nur gestreamt; ein Download wird nicht angeboten.",
      ],
    },
    {
      heading: "Übermittlung in Drittländer",
      blocks: [
        "Soweit Auftragsverarbeiter ihren Sitz in den USA haben oder von dort auf Daten zugreifen, erfolgt die Übermittlung auf Grundlage geeigneter Garantien (EU-US Data Privacy Framework und/oder EU-Standardvertragsklauseln).",
      ],
    },
    {
      heading: "Lokale Speicherung statt Cookies",
      blocks: [
        "Die öffentliche Website setzt keine Cookies. Eure Datenschutz-Auswahl wird nur in eurem Browser gespeichert (localStorage, Schlüssel „typhoon.consent.v1“) und lässt sich jederzeit über „Datenschutz-Einstellungen“ im Footer ändern. Der Login-Bereich der Band nutzt technisch notwendige Cookies, ausschließlich für Bandmitglieder.",
      ],
    },
    {
      heading: "Externe Plattformen",
      blocks: [
        "Links zu Spotify, YouTube, Instagram und ähnlichen Diensten sind reine Links. Daten werden erst an die Anbieter übertragen, wenn ihr einem Link folgt. Eingebettete Player oder Videos laden – falls angeboten – erst, nachdem ihr „Externe Medien“ erlaubt habt.",
      ],
    },
    {
      heading: "Eure Rechte",
      blocks: [
        `Ihr habt das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15–21 DSGVO) und könnt erteilte Einwilligungen jederzeit mit Wirkung für die Zukunft widerrufen. Kontakt: ${f.email}.`,
        "Außerdem habt ihr das Recht, euch bei einer Datenschutz-Aufsichtsbehörde zu beschweren, zum Beispiel beim Bayerischen Landesamt für Datenschutzaufsicht (BayLDA) in Ansbach.",
      ],
    },
    {
      heading: "Widerspruchsrecht (Art. 21 DSGVO)",
      blocks: [
        `Soweit wir Daten auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO verarbeiten (berechtigtes Interesse, z. B. Server-Logs und die Auslieferung von Musik und Bildern), könnt ihr dieser Verarbeitung aus Gründen, die sich aus eurer besonderen Situation ergeben, jederzeit widersprechen. Wir verarbeiten die Daten dann nicht mehr, es sei denn, wir können zwingende schutzwürdige Gründe nachweisen, die eure Interessen überwiegen, oder die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen. Eine formlose Nachricht an ${f.email} genügt.`,
      ],
    },
  ];
}

function cookies(locale: Locale): LegalSection[] {
  if (locale === "en") {
    return [
      {
        blocks: [
          "The public website sets no cookies and uses no tracking, analytics or advertising technology.",
        ],
      },
      {
        heading: "What is stored",
        blocks: [
          { list: [
            "Necessary: your privacy choice in your browser's localStorage (key “typhoon.consent.v1”). Nothing is sent to us.",
            "External media: off by default. Only if you allow it will embedded players or videos from providers such as YouTube or Spotify be loaded.",
          ] },
        ],
      },
      {
        heading: "Band login",
        blocks: [
          "The password-protected area for band members uses technically necessary session cookies (Supabase Auth). They are only set after logging in.",
        ],
      },
      {
        heading: "Changing your choice",
        blocks: [
          "Use “Privacy settings” in the footer at any time. Deleting your browser's site data also resets the choice.",
        ],
      },
    ];
  }
  if (locale === "tr") {
    return [
      {
        blocks: [
          "Herkese açık site çerez kullanmaz ve hiçbir izleme, analiz ya da reklam teknolojisi kullanmaz.",
        ],
      },
      {
        heading: "Neler saklanır",
        blocks: [
          { list: [
            "Gerekli: gizlilik tercihiniz tarayıcınızın localStorage alanında (anahtar “typhoon.consent.v1”). Bize hiçbir şey gönderilmez.",
            "Harici medya: varsayılan olarak kapalı. Yalnızca izin verirseniz YouTube veya Spotify gibi sağlayıcıların gömülü oynatıcıları ya da videoları yüklenir.",
          ] },
        ],
      },
      {
        heading: "Grup girişi",
        blocks: [
          "Grup üyelerine yönelik şifre korumalı alan, teknik olarak gerekli oturum çerezleri (Supabase Auth) kullanır. Bunlar yalnızca giriş yapıldıktan sonra ayarlanır.",
        ],
      },
      {
        heading: "Tercihinizi değiştirme",
        blocks: [
          "Alt bilgideki “Gizlilik ayarları” ile tercihinizi her zaman değiştirebilirsiniz. Tarayıcınızdaki site verilerini silmek de tercihi sıfırlar.",
        ],
      },
    ];
  }
  return [
    {
      blocks: [
        "Die öffentliche Website setzt keine Cookies und nutzt keine Tracking-, Analyse- oder Werbetechnologien.",
      ],
    },
    {
      heading: "Was gespeichert wird",
      blocks: [
        { list: [
          "Notwendig: eure Datenschutz-Auswahl im localStorage eures Browsers (Schlüssel „typhoon.consent.v1“). An uns wird nichts übertragen.",
          "Externe Medien: standardmäßig aus. Nur wenn ihr zustimmt, werden eingebettete Player oder Videos von Anbietern wie YouTube oder Spotify geladen.",
        ] },
      ],
    },
    {
      heading: "Band-Login",
      blocks: [
        "Der passwortgeschützte Bereich für Bandmitglieder nutzt technisch notwendige Sitzungs-Cookies (Supabase Auth). Sie werden erst nach dem Login gesetzt.",
      ],
    },
    {
      heading: "Auswahl ändern",
      blocks: [
        "Über „Datenschutz-Einstellungen“ im Footer könnt ihr eure Auswahl jederzeit ändern. Auch das Löschen der Website-Daten im Browser setzt sie zurück.",
      ],
    },
  ];
}

export function legalFallback(type: LegalPageType, locale: Locale, facts: Facts): LegalDoc {
  const sections =
    type === "imprint" ? imprint(locale, facts) : type === "privacy" ? privacy(locale, facts) : cookies(locale);
  return { updated: UPDATED[locale], sections };
}
