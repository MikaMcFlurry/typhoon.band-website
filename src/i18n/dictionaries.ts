import type { Locale } from "@/i18n/locales";

export type Dict = {
  nav: {
    home: string;
    band: string;
    music: string;
    shows: string;
    media: string;
    booking: string;
    contact: string;
  };
  hero: {
    line1: string;
    line2: string;
    line3: string;
    description: string;
    ctaListen: string;
    ctaBook: string;
  };
  brand: {
    genreLine: string;
  };
  about: {
    kicker: string;
    eyebrow: string;
    headline: string;
    body: string;
    cta: string;
    ctaBook: string;
  };
  members: {
    kicker: string;
    instrument: Record<string, string>;
    bio: Record<string, string>;
  };
  demos: {
    kicker: string;
    featuredTag: string;
  };
  shows: {
    kicker: string;
    link: string;
    placeholderTitles: string[];
    placeholderRegion: string[];
    placeholderTime: string[];
  };
  media: {
    kicker: string;
    open: string;
    close: string;
    prev: string;
    next: string;
  };
  booking: {
    kicker: string;
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    dateLabel: string;
    locationLabel: string;
    typeLabel: string;
    messageLabel: string;
    submit: string;
    submitting: string;
    requiredErr: string;
    networkErr: string;
    backendNotice: string;
    submitFallback: string;
    submitOk: string;
  };
  footer: {
    contact: string;
    follow: string;
    legal: string;
    imprint: string;
    privacy: string;
    cookies: string;
    blurb: string;
    copyrightTemplate: string;
  };
  cookies: {
    title: string;
    body: string;
    accept: string;
    decline: string;
    privacyLink: string;
    cookiesLink: string;
  };
  legal: {
    backToHome: string;
    imprintTitle: string;
    privacyTitle: string;
    cookiesTitle: string;
    draftNote: string;
  };
  player: {
    play: string;
    pause: string;
    prev: string;
    next: string;
    volumeUp: string;
    volumeDown: string;
    mute: string;
    unmute: string;
    more: string;
  };
};

const memberInstruments: Record<string, Record<Locale, string>> = {
  typhoon: { de: "Gesang", en: "Vocals", tr: "Vokal" },
  mika: { de: "Posaune", en: "Trombone", tr: "Trombon" },
  schack: { de: "Saxophon", en: "Saxophone", tr: "Saksofon" },
  hardy: { de: "Trompete", en: "Trumpet", tr: "Trompet" },
  stefan: { de: "Funk-Bass", en: "Funk Bass", tr: "Funk Bas" },
  tom: { de: "Schlagzeug", en: "Drums", tr: "Davul" },
  bugra: { de: "Gitarre", en: "Guitar", tr: "Gitar" },
  jurgen: { de: "Gitarre", en: "Guitar", tr: "Gitar" },
};

const memberBios: Record<string, Record<Locale, string>> = {
  typhoon: {
    de: "Frontmann, türkischsprachige Texte und direkte Energie im Zentrum der Band.",
    en: "Frontman — Turkish-language lyrics and the live energy at the heart of the band.",
    tr: "Sahnenin önünde Türkçe sözler ve grubun merkezindeki canlı enerji.",
  },
  mika: {
    de: "Junger Posaunen-Sound, rauer Live-Charakter und warme Brass-Linien.",
    en: "Young trombone sound, raw live character, warm brass lines.",
    tr: "Genç trombon tonu, sahnedeki ham karakter ve sıcak nefesli partileri.",
  },
  schack: {
    de: "Erfahrung, warme Linien und ein souliger Ton für die Bläsersektion.",
    en: "Experience, warm phrasing and a soulful tone driving the brass section.",
    tr: "Tecrübe, sıcak frazeler ve nefesli grubuna soul katan bir saksofon tonu.",
  },
  hardy: {
    de: "Markante Brass-Stimme zwischen Funk, Bluesrock und Bühnen-Druck.",
    en: "Punchy brass voice between funk, blues rock and stage power.",
    tr: "Funk, blues rock ve sahne gücü arasında etkileyici bir trompet sesi.",
  },
  stefan: {
    de: "Groovendes Fundament, präziser Druck und warme Tiefe.",
    en: "Grooving foundation, precise punch and warm low end.",
    tr: "Groove temeli, isabetli vuruş ve sıcak alt bant.",
  },
  tom: {
    de: "Treibender Puls, Live-Energie und rhythmische Stabilität.",
    en: "Driving pulse, live energy and rhythmic stability.",
    tr: "Sürükleyici nabız, sahne enerjisi ve sağlam ritim zemini.",
  },
  bugra: {
    de: "Gitarrenlinien mit türkischer Prägung, Groove und melodischer Spannung.",
    en: "Guitar lines with a Turkish accent, groove and melodic tension.",
    tr: "Türk müzik izi taşıyan, groove ve melodik gerilim dolu gitar partileri.",
  },
  jurgen: {
    de: "Gitarrensound zwischen Rhythmus, Wärme und rockiger Kante.",
    en: "Guitar tone balancing rhythm, warmth and a rock edge.",
    tr: "Ritim, sıcaklık ve rock kenarını birleştiren gitar tonu.",
  },
};

const buildMemberMaps = (locale: Locale) => ({
  instrument: Object.fromEntries(
    Object.entries(memberInstruments).map(([id, map]) => [id, map[locale]]),
  ),
  bio: Object.fromEntries(
    Object.entries(memberBios).map(([id, map]) => [id, map[locale]]),
  ),
});

const de: Dict = {
  nav: {
    home: "Home",
    band: "Band",
    music: "Music",
    shows: "Termine",
    media: "Media",
    booking: "Booking",
    contact: "Kontakt",
  },
  hero: {
    line1: "SMOOTH.",
    line2: "EXZEPTIONELL.",
    line3: "FUNK.",
    description:
      "Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock – kraftvoll, warm und live voller Energie.",
    ctaListen: "Songs anhören",
    ctaBook: "Booking Anfrage",
  },
  brand: {
    genreLine: "BLUESROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK",
  },
  about: {
    kicker: "Über Typhoon",
    eyebrow: "Typhoon",
    headline: "Amerikanisches Feeling. Europäische Seele. Türkische Texte.",
    body:
      "Typhoon sprengt Genregrenzen, ohne die eigene Handschrift zu verlieren: markante Blues-Riffs, funkige Grooves, soulige Melodien, jazzige Finessen und türkischsprachige Texte. Eine erfahrene Band, die live sofort zündet.",
    cta: "Mehr über die Band",
    ctaBook: "Booking Anfrage",
  },
  members: {
    kicker: "Band Mitglieder",
    ...buildMemberMaps("de"),
  },
  demos: {
    kicker: "Demos",
    featuredTag: "Aktueller Demo · Single",
  },
  shows: {
    kicker: "Termine",
    link: "Alle Termine ansehen →",
    placeholderTitles: [
      "Neue Termine in Vorbereitung",
      "Festival-Saison",
      "Club-Tour",
      "Privat- & Firmenevents",
    ],
    placeholderRegion: [
      "Deutschland",
      "Süddeutschland",
      "DE / AT",
      "Anfrage",
    ],
    placeholderTime: ["Demnächst", "Demnächst", "Demnächst", "Booking offen"],
  },
  media: {
    kicker: "Media",
    open: "Bild öffnen",
    close: "Schließen",
    prev: "Zurück",
    next: "Weiter",
  },
  booking: {
    kicker: "Booking",
    nameLabel: "Name *",
    emailLabel: "E-Mail *",
    phoneLabel: "Telefon (optional)",
    dateLabel: "Veranstaltungsdatum",
    locationLabel: "Ort",
    typeLabel: "Art der Veranstaltung",
    messageLabel: "Nachricht *",
    submit: "Booking anfragen",
    submitting: "Wird gesendet…",
    requiredErr: "Bitte fülle alle Pflichtfelder aus.",
    networkErr: "Netzwerkfehler. Bitte später erneut versuchen.",
    backendNotice: "Booking-Versand wird im nächsten Batch angebunden.",
    submitFallback:
      "Anfrage erhalten — wir melden uns. (Hinweis: Backend-Versand wird im nächsten Batch angebunden.)",
    submitOk: "Danke! Wir melden uns innerhalb 48 Stunden.",
  },
  footer: {
    contact: "Kontakt",
    follow: "Folge uns",
    legal: "Legal",
    imprint: "Impressum",
    privacy: "Datenschutz",
    cookies: "Cookies",
    blurb:
      "Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock.",
    copyrightTemplate: "© {year} Typhoon. Alle Rechte vorbehalten.",
  },
  cookies: {
    title: "Cookies & Privatsphäre",
    body:
      "Diese Website verwendet nur technisch notwendige Cookies. Es findet kein Tracking statt.",
    accept: "Verstanden",
    decline: "Nicht jetzt",
    privacyLink: "Datenschutz",
    cookiesLink: "Cookies",
  },
  legal: {
    backToHome: "Zur Startseite",
    imprintTitle: "Impressum",
    privacyTitle: "Datenschutzerklärung",
    cookiesTitle: "Cookie-Hinweise",
    draftNote: "Initialer Stand — wird laufend ergänzt.",
  },
  player: {
    play: "Abspielen",
    pause: "Pause",
    prev: "Vorheriger Track",
    next: "Nächster Track",
    volumeUp: "Lauter",
    volumeDown: "Leiser",
    mute: "Stumm",
    unmute: "Ton an",
    more: "Mehr",
  },
};

const en: Dict = {
  nav: {
    home: "Home",
    band: "Band",
    music: "Music",
    shows: "Shows",
    media: "Media",
    booking: "Booking",
    contact: "Contact",
  },
  hero: {
    line1: "SMOOTH.",
    line2: "EXCEPTIONAL.",
    line3: "FUNK.",
    description:
      "Typhoon blends Turkish-language lyrics with blues rock, funk, soul, jazz and southern rock — powerful, warm, full of live energy.",
    ctaListen: "Listen to songs",
    ctaBook: "Booking request",
  },
  brand: {
    genreLine: "BLUES ROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK",
  },
  about: {
    kicker: "About Typhoon",
    eyebrow: "Typhoon",
    headline: "American feeling. European soul. Turkish lyrics.",
    body:
      "Typhoon breaks genre boundaries without losing their handwriting: punchy blues riffs, funky grooves, soulful melodies, jazz finesse and Turkish-language lyrics. An experienced band that ignites the moment they hit the stage.",
    cta: "More about the band",
    ctaBook: "Booking request",
  },
  members: {
    kicker: "Band Members",
    ...buildMemberMaps("en"),
  },
  demos: {
    kicker: "Demos",
    featuredTag: "Current demo · Single",
  },
  shows: {
    kicker: "Shows",
    link: "All shows →",
    placeholderTitles: [
      "New dates in preparation",
      "Festival season",
      "Club tour",
      "Private & corporate events",
    ],
    placeholderRegion: ["Germany", "Southern Germany", "DE / AT", "On request"],
    placeholderTime: ["Soon", "Soon", "Soon", "Booking open"],
  },
  media: {
    kicker: "Media",
    open: "Open image",
    close: "Close",
    prev: "Previous",
    next: "Next",
  },
  booking: {
    kicker: "Booking",
    nameLabel: "Name *",
    emailLabel: "Email *",
    phoneLabel: "Phone (optional)",
    dateLabel: "Event date",
    locationLabel: "Location",
    typeLabel: "Type of event",
    messageLabel: "Message *",
    submit: "Send booking request",
    submitting: "Sending…",
    requiredErr: "Please fill in all required fields.",
    networkErr: "Network error. Please try again later.",
    backendNotice: "Booking delivery is wired up in the next batch.",
    submitFallback:
      "Request received — we'll get back to you. (Note: backend delivery ships in the next batch.)",
    submitOk: "Thanks! We'll reply within 48 hours.",
  },
  footer: {
    contact: "Contact",
    follow: "Follow us",
    legal: "Legal",
    imprint: "Imprint",
    privacy: "Privacy",
    cookies: "Cookies",
    blurb:
      "Typhoon blends Turkish-language lyrics with blues rock, funk, soul, jazz and southern rock.",
    copyrightTemplate: "© {year} Typhoon. All rights reserved.",
  },
  cookies: {
    title: "Cookies & privacy",
    body:
      "This site only uses technically required cookies. No tracking is in place.",
    accept: "Got it",
    decline: "Not now",
    privacyLink: "Privacy",
    cookiesLink: "Cookies",
  },
  legal: {
    backToHome: "Back to home",
    imprintTitle: "Imprint",
    privacyTitle: "Privacy policy",
    cookiesTitle: "Cookie notice",
    draftNote: "Initial draft — extended over time.",
  },
  player: {
    play: "Play",
    pause: "Pause",
    prev: "Previous track",
    next: "Next track",
    volumeUp: "Volume up",
    volumeDown: "Volume down",
    mute: "Mute",
    unmute: "Unmute",
    more: "More",
  },
};

const tr: Dict = {
  nav: {
    home: "Ana Sayfa",
    band: "Grup",
    music: "Müzik",
    shows: "Tarihler",
    media: "Medya",
    booking: "Booking",
    contact: "İletişim",
  },
  hero: {
    line1: "SMOOTH.",
    line2: "OLAĞANÜSTÜ.",
    line3: "FUNK.",
    description:
      "Typhoon, Türkçe sözleri blues rock, funk, soul, jazz ve southern rock ile birleştirir — güçlü, sıcak ve sahnede dolu enerjik.",
    ctaListen: "Şarkıları dinle",
    ctaBook: "Booking talebi",
  },
  brand: {
    genreLine: "BLUES ROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK",
  },
  about: {
    kicker: "Typhoon Hakkında",
    eyebrow: "Typhoon",
    headline: "Amerikan tını. Avrupalı ruh. Türkçe sözler.",
    body:
      "Typhoon, kendi imzasını kaybetmeden tür sınırlarını aşar: vurucu blues riff'leri, funky groove'lar, ruhlu melodiler, jazz incelikleri ve Türkçe sözler. Sahneye çıktığı an alev alan tecrübeli bir grup.",
    cta: "Grup hakkında daha fazla",
    ctaBook: "Booking talebi",
  },
  members: {
    kicker: "Grup Üyeleri",
    ...buildMemberMaps("tr"),
  },
  demos: {
    kicker: "Demolar",
    featuredTag: "Güncel demo · Single",
  },
  shows: {
    kicker: "Tarihler",
    link: "Tüm tarihler →",
    placeholderTitles: [
      "Yeni tarihler hazırlanıyor",
      "Festival sezonu",
      "Kulüp turnesi",
      "Özel & kurumsal etkinlikler",
    ],
    placeholderRegion: ["Almanya", "Güney Almanya", "DE / AT", "Talep üzerine"],
    placeholderTime: ["Yakında", "Yakında", "Yakında", "Booking açık"],
  },
  media: {
    kicker: "Medya",
    open: "Görseli aç",
    close: "Kapat",
    prev: "Önceki",
    next: "Sonraki",
  },
  booking: {
    kicker: "Booking",
    nameLabel: "İsim *",
    emailLabel: "E-posta *",
    phoneLabel: "Telefon (isteğe bağlı)",
    dateLabel: "Etkinlik tarihi",
    locationLabel: "Yer",
    typeLabel: "Etkinlik türü",
    messageLabel: "Mesaj *",
    submit: "Booking talebi gönder",
    submitting: "Gönderiliyor…",
    requiredErr: "Lütfen tüm zorunlu alanları doldurun.",
    networkErr: "Ağ hatası. Lütfen daha sonra tekrar deneyin.",
    backendNotice: "Booking gönderimi bir sonraki batch'te bağlanacak.",
    submitFallback:
      "Talep alındı — size geri döneceğiz. (Not: backend gönderimi bir sonraki batch'te eklenecek.)",
    submitOk: "Teşekkürler! 48 saat içinde dönüş yapacağız.",
  },
  footer: {
    contact: "İletişim",
    follow: "Bizi takip edin",
    legal: "Hukuki",
    imprint: "Künye",
    privacy: "Gizlilik",
    cookies: "Çerezler",
    blurb:
      "Typhoon, Türkçe sözleri blues rock, funk, soul, jazz ve southern rock ile birleştirir.",
    copyrightTemplate: "© {year} Typhoon. Tüm hakları saklıdır.",
  },
  cookies: {
    title: "Çerezler & gizlilik",
    body:
      "Bu site yalnızca teknik olarak gerekli çerezleri kullanır. Hiçbir izleme yapılmaz.",
    accept: "Anladım",
    decline: "Şimdi değil",
    privacyLink: "Gizlilik",
    cookiesLink: "Çerezler",
  },
  legal: {
    backToHome: "Ana sayfaya dön",
    imprintTitle: "Künye",
    privacyTitle: "Gizlilik politikası",
    cookiesTitle: "Çerez bildirimi",
    draftNote: "İlk taslak — zaman içinde genişletilecektir.",
  },
  player: {
    play: "Oynat",
    pause: "Duraklat",
    prev: "Önceki parça",
    next: "Sonraki parça",
    volumeUp: "Sesi aç",
    volumeDown: "Sesi kıs",
    mute: "Sessize al",
    unmute: "Sesi aç",
    more: "Daha fazla",
  },
};

export const dictionaries: Record<Locale, Dict> = { de, en, tr };

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}
