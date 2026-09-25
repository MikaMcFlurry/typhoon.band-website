import type { Locale } from "@/i18n/locales";

// All public UI copy for DE / EN / TR. Band facts (member names, bios,
// headline, band text) are the owner's wording from the live site and
// docs/03-content-facts.md — do not paraphrase them without the owner.
//
// Keys under `hero`, `about`, `members`, `shows.placeholder*`, `legal`
// and `brand` are also read by src/lib/content/fallback.ts and the admin.

export type EventTypeKey =
  | "festival"
  | "club"
  | "cityfest"
  | "corporate"
  | "private"
  | "other";

export type Dict = {
  meta: {
    title: string;
    description: string;
    ogAlt: string;
  };
  a11y: {
    skip: string;
    mainNav: string;
    langNav: string;
    openMenu: string;
    closeMenu: string;
    home: string;
  };
  nav: {
    band: string;
    music: string;
    shows: string;
    media: string;
    booking: string;
  };
  hero: {
    line1: string;
    line2: string;
    line3: string;
    description: string;
    ctaListen: string;
    ctaBook: string;
    playFeatured: string;
  };
  brand: {
    genreLine: string;
    genres: string[];
  };
  music: {
    title: string;
    intro: string;
    featuredLabel: string;
    tracklist: string;
    trackCount: string;
    nowPlaying: string;
    paused: string;
    loading: string;
    error: string;
    noDownload: string;
    showAll: string;
    showLess: string;
    alsoOn: string;
  };
  about: {
    eyebrow: string;
    headline: string;
    body: string;
    lead: string;
    more: string;
    imageAlt: string;
    cta: string;
    ctaBook: string;
    facts: { label: string; value: string }[];
  };
  members: {
    title: string;
    showAll: string;
    showLess: string;
    instrument: Record<string, string>;
    bio: Record<string, string>;
  };
  shows: {
    title: string;
    intro: string;
    tickets: string;
    tba: string;
    emptyTitle: string;
    emptyBody: string;
    emptyCta: string;
    past: string;
    placeholderTitles: string[];
    placeholderRegion: string[];
    placeholderTime: string[];
    eventTypes: Record<string, string>;
  };
  media: {
    title: string;
    open: string;
    close: string;
    prev: string;
    next: string;
    counter: string;
  };
  booking: {
    title: string;
    intro: string;
    factsTitle: string;
    facts: { label: string; value: string }[];
    direct: string;
    reply: string;
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    dateLabel: string;
    locationLabel: string;
    locationHint: string;
    typeLabel: string;
    typePlaceholder: string;
    types: Record<EventTypeKey, string>;
    messageLabel: string;
    messageHint: string;
    required: string;
    optional: string;
    privacyNote: string;
    privacyLink: string;
    submit: string;
    submitting: string;
    requiredErr: string;
    networkErr: string;
    submitFallback: string;
    submitOk: string;
    submitOkTitle: string;
    submitAnother: string;
    submitError: string;
    errors: {
      name: string;
      email: string;
      event_location: string;
      event_type: string;
      message: string;
      event_date: string;
      phone: string;
      rate: string;
    };
  };
  footer: {
    contact: string;
    follow: string;
    listen: string;
    legal: string;
    imprint: string;
    privacy: string;
    cookies: string;
    consentSettings: string;
    blurb: string;
    copyrightTemplate: string;
    toTop: string;
  };
  cookies: {
    title: string;
    body: string;
    acceptShort: string;
    decline: string;
    save: string;
    cancel: string;
    necessary: string;
    necessaryBody: string;
    external: string;
    externalBody: string;
    privacyLink: string;
    cookiesLink: string;
  };
  gate: {
    title: string;
    body: string;
    load: string;
    always: string;
  };
  legal: {
    backToHome: string;
    imprintTitle: string;
    privacyTitle: string;
    cookiesTitle: string;
    draftNote: string;
    updated: string;
  };
  player: {
    play: string;
    pause: string;
    playTrack: string;
    pauseTrack: string;
    prev: string;
    next: string;
    volume: string;
    mute: string;
    unmute: string;
    close: string;
    seek: string;
    by: string;
    dock: string;
  };
  notFound: {
    title: string;
    body: string;
    cta: string;
  };
  stage: {
    setlist: string;
    setlistNote: string;
    plotLabel: string;
    plotHint: string;
    audience: string;
    more: string;
    previewTitle: string;
    previewTo: string;
    previewFrom: string;
    previewEmpty: string;
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
  meta: {
    title: "Typhoon · Bluesrock, Funk & Soul mit türkischen Texten",
    description:
      "Typhoon aus Hechingen verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock. Demos anhören, Konzerte finden, Band buchen.",
    ogAlt: "Typhoon: acht Musiker in einer Sepia-Collage mit goldenem Schriftzug",
  },
  a11y: {
    skip: "Zum Inhalt springen",
    mainNav: "Hauptnavigation",
    langNav: "Sprache wählen",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    home: "Typhoon Startseite",
  },
  nav: {
    band: "Band",
    music: "Musik",
    shows: "Termine",
    media: "Bilder",
    booking: "Booking",
  },
  hero: {
    line1: "SMOOTH.",
    line2: "EXZEPTIONELL.",
    line3: "FUNK.",
    description:
      "Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock – kraftvoll, warm und live voller Energie.",
    ctaListen: "Songs anhören",
    ctaBook: "Booking anfragen",
    playFeatured: "{title} anhören",
  },
  brand: {
    genreLine: "BLUESROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK",
    genres: ["Bluesrock", "Funk", "Soul", "Jazz", "Southern Rock"],
  },
  music: {
    title: "Hör rein",
    intro:
      "Demos mit türkischen Texten, Blues-Riffs und einem Bläsersatz, der nach vorne drückt. Die Wiedergabe läuft weiter, während du scrollst.",
    featuredLabel: "Aktuelle Single",
    tracklist: "Alle Demos",
    trackCount: "{count} Demos",
    nowPlaying: "Läuft gerade",
    paused: "Pausiert",
    loading: "Lädt …",
    error: "Dieser Song konnte nicht geladen werden.",
    noDownload: "Nur zum Anhören",
    showAll: "Alle Demos zeigen",
    showLess: "Weniger zeigen",
    alsoOn: "Auch zu hören auf",
  },
  about: {
    eyebrow: "Typhoon",
    headline: "Amerikanisches Feeling. Europäische Seele. Türkische Texte.",
    body:
      "Typhoon sprengt Genregrenzen, ohne die eigene Handschrift zu verlieren: markante Blues-Riffs, funkige Grooves, soulige Melodien, jazzige Finessen und türkischsprachige Texte. Eine erfahrene Band, die live sofort zündet.",
    lead:
      "Typhoon präsentiert einen kraftvollen Mix aus Bluesrock, Funk, Soul, Jazz und Southern Rock mit amerikanisch-europäischem Sound. Selbstkomponierte Songs verbinden markante Blues-Riffs, funkige Grooves, soulige Melodien und jazzige Finessen. Türkischsprachige Texte geben den Songs Tiefe und kulturelle Eigenständigkeit.\n\nIm Zentrum steht ein eingespieltes Kollektiv aus acht erfahrenen Musikern mit über 30 Jahren Bühnenerfahrung, getragen von Gesang, Bläsersatz und einer groovenden Rhythmusgruppe.\n\nIm eigenen Kanzlei Studio in Hechingen produziert die Band ihre Arrangements mit viel Liebe zum Detail und moderner Technik. Das Ergebnis ist ein Gesamtpaket aus handwerklicher Präzision und authentischer Spielfreude.",
    more: "Mehr über Typhoon",
    imageAlt: "Typhoon singt live auf der Bühne",
    cta: "Die Besetzung",
    ctaBook: "Booking anfragen",
    facts: [
      { label: "Besetzung", value: "{count} Musiker mit Bläsersatz" },
      { label: "Texte", value: "Türkisch, eigene Songs" },
      { label: "Homebase", value: "Kanzlei Studio, Hechingen" },
    ],
  },
  members: {
    title: "Die Besetzung",
    showAll: "Alle Musiker zeigen",
    showLess: "Weniger zeigen",
    ...buildMemberMaps("de"),
  },
  shows: {
    title: "Termine",
    intro: "Die nächsten Konzerte. Tickets und Details direkt beim Veranstalter.",
    tickets: "Tickets",
    tba: "Datum folgt",
    emptyTitle: "Neue Termine sind in Planung.",
    emptyBody:
      "Festival, Club, Stadtfest oder Firmenevent: Holt Typhoon auf eure Bühne.",
    emptyCta: "Booking anfragen",
    past: "Vergangene Konzerte",
    placeholderTitles: [
      "Neue Termine in Vorbereitung",
      "Festival-Saison",
      "Club-Tour",
      "Privat- & Firmenevents",
    ],
    placeholderRegion: ["Deutschland", "Süddeutschland", "DE / AT", "Anfrage"],
    placeholderTime: ["Demnächst", "Demnächst", "Demnächst", "Booking offen"],
    eventTypes: {
      festival: "Festival",
      club: "Clubkonzert",
      concert: "Konzert",
      cityfest: "Stadtfest",
      corporate: "Firmenevent",
      private: "Private Feier",
      wedding: "Hochzeit",
      other: "Konzert",
    },
  },
  media: {
    title: "Bilder",
    open: "Bild öffnen",
    close: "Schließen",
    prev: "Vorheriges Bild",
    next: "Nächstes Bild",
    counter: "Bild {index} von {total}",
  },
  booking: {
    title: "Typhoon buchen",
    intro:
      "Erzählt uns kurz von eurem Event. Wir melden uns persönlich mit Verfügbarkeit und Konditionen.",
    factsTitle: "Für Veranstalter",
    facts: [
      { label: "Besetzung", value: "{count} Musiker mit Gesang, Bläsersatz und Rhythmusgruppe" },
      { label: "Programm", value: "Eigene Songs mit türkischen Texten" },
      { label: "Stil", value: "Bluesrock, Funk, Soul, Jazz, Southern Rock" },
      { label: "Anlässe", value: "Festival, Club, Stadtfest, Firmen- und Privatevents" },
      { label: "Basis", value: "Hechingen, Baden-Württemberg – gerne auch weiter weg" },
    ],
    direct: "Direkt erreichbar",
    reply: "Antwort in der Regel innerhalb von 48 Stunden.",
    nameLabel: "Name",
    emailLabel: "E-Mail",
    phoneLabel: "Telefon",
    dateLabel: "Datum der Veranstaltung",
    locationLabel: "Ort",
    locationHint: "Stadt und, falls bekannt, Location",
    typeLabel: "Art der Veranstaltung",
    typePlaceholder: "Bitte wählen",
    types: {
      festival: "Festival",
      club: "Club / Konzert",
      cityfest: "Stadtfest",
      corporate: "Firmenevent",
      private: "Private Feier / Hochzeit",
      other: "Sonstiges",
    },
    messageLabel: "Nachricht",
    messageHint: "Zeitrahmen, Publikum, Technik vor Ort, Budget – alles hilft.",
    required: "Pflichtfeld",
    optional: "optional",
    privacyNote:
      "Wir nutzen deine Angaben nur zur Bearbeitung der Anfrage. Details in der",
    privacyLink: "Datenschutzerklärung",
    submit: "Anfrage senden",
    submitting: "Wird gesendet …",
    requiredErr: "Bitte fülle die markierten Felder aus.",
    networkErr:
      "Die Anfrage konnte nicht gesendet werden. Bitte versuche es später erneut oder schreib uns direkt.",
    submitFallback:
      "Der Online-Versand ist gerade nicht verfügbar. Bitte schreib uns direkt an booking@typhoon.band.",
    submitOk: "Danke für deine Anfrage. Wir melden uns so schnell wie möglich.",
    submitOkTitle: "Anfrage ist angekommen",
    submitAnother: "Weitere Anfrage senden",
    submitError:
      "Die Anfrage konnte nicht gesendet werden. Bitte versuche es später erneut oder schreib uns direkt.",
    errors: {
      name: "Bitte gib deinen Namen an.",
      email: "Bitte gib eine gültige E-Mail-Adresse an.",
      event_location: "Bitte gib den Ort an.",
      event_type: "Bitte wähle die Art der Veranstaltung.",
      message: "Bitte schreib uns ein paar Zeilen mehr (mindestens 10 Zeichen).",
      event_date: "Bitte wähle ein gültiges Datum.",
      phone: "Die Telefonnummer ist zu lang.",
      rate: "Zu viele Anfragen in kurzer Zeit. Bitte versuche es in ein paar Minuten erneut.",
    },
  },
  footer: {
    contact: "Kontakt",
    follow: "Folge uns",
    listen: "Hören & folgen",
    legal: "Rechtliches",
    imprint: "Impressum",
    privacy: "Datenschutz",
    cookies: "Cookies",
    consentSettings: "Datenschutz-Einstellungen",
    blurb:
      "Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock.",
    copyrightTemplate: "© {year} Typhoon. Alle Rechte vorbehalten.",
    toTop: "Nach oben",
  },
  cookies: {
    title: "Privatsphäre",
    body:
      "Diese Website setzt keine Tracking- oder Werbe-Cookies. Externe Inhalte wie Videos oder Streaming-Player laden wir nur, wenn du zustimmst.",
    acceptShort: "Alle erlauben",
    decline: "Nur notwendige",
    save: "Auswahl speichern",
    cancel: "Abbrechen",
    necessary: "Notwendig",
    necessaryBody: "Speichert nur diese Auswahl in deinem Browser.",
    external: "Externe Medien",
    externalBody: "Videos und Player von YouTube, Spotify & Co. nach Zustimmung laden.",
    privacyLink: "Datenschutz",
    cookiesLink: "Cookies",
  },
  gate: {
    title: "Externer Inhalt",
    body: "Beim Laden werden Daten an {provider} übertragen.",
    load: "Einmal laden",
    always: "Immer erlauben",
  },
  legal: {
    backToHome: "Zur Startseite",
    imprintTitle: "Impressum",
    privacyTitle: "Datenschutzerklärung",
    cookiesTitle: "Cookie-Hinweise",
    draftNote: "Initialer Stand — wird laufend ergänzt.",
    updated: "Stand",
  },
  player: {
    play: "Abspielen",
    pause: "Pause",
    playTrack: "{title} abspielen",
    pauseTrack: "{title} pausieren",
    prev: "Vorheriger Song",
    next: "Nächster Song",
    volume: "Lautstärke",
    mute: "Stumm schalten",
    unmute: "Ton an",
    close: "Player schließen",
    seek: "Position in {title}",
    by: "Typhoon",
    dock: "Audioplayer",
  },
  notFound: {
    title: "Diese Seite gibt es nicht.",
    body: "Vielleicht hilft ein Neustart auf der Startseite. Die Musik läuft dort.",
    cta: "Zur Startseite",
  },
  stage: {
    setlist: "Setlist",
    setlistNote: "Tippen zum Abspielen · nur Stream, kein Download",
    plotLabel: "Bühnenplan der Besetzung",
    plotHint: "Tippe auf eine Position, um die Musiker kennenzulernen.",
    audience: "Publikum",
    more: "Weitere Musiker",
    previewTitle: "So kommt deine Anfrage an",
    previewTo: "An",
    previewFrom: "Von",
    previewEmpty: "noch offen",
  },
};

const en: Dict = {
  meta: {
    title: "Typhoon · Blues rock, funk & soul with Turkish lyrics",
    description:
      "Typhoon from Hechingen, Germany, blends Turkish-language lyrics with blues rock, funk, soul, jazz and southern rock. Listen to the demos, find a show, book the band.",
    ogAlt: "Typhoon: eight musicians in a sepia collage with a gold signature logo",
  },
  a11y: {
    skip: "Skip to content",
    mainNav: "Main navigation",
    langNav: "Choose language",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    home: "Typhoon home",
  },
  nav: {
    band: "Band",
    music: "Music",
    shows: "Shows",
    media: "Photos",
    booking: "Booking",
  },
  hero: {
    line1: "SMOOTH.",
    line2: "EXCEPTIONAL.",
    line3: "FUNK.",
    description:
      "Typhoon blends Turkish-language lyrics with blues rock, funk, soul, jazz and southern rock — powerful, warm, full of live energy.",
    ctaListen: "Listen to songs",
    ctaBook: "Booking request",
    playFeatured: "Play {title}",
  },
  brand: {
    genreLine: "BLUES ROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK",
    genres: ["Blues rock", "Funk", "Soul", "Jazz", "Southern rock"],
  },
  music: {
    title: "Listen",
    intro:
      "Demos with Turkish lyrics, blues riffs and a horn section that pushes forward. Playback keeps going while you scroll.",
    featuredLabel: "Current single",
    tracklist: "All demos",
    trackCount: "{count} demos",
    nowPlaying: "Now playing",
    paused: "Paused",
    loading: "Loading …",
    error: "This song could not be loaded.",
    noDownload: "Streaming only",
    showAll: "Show all demos",
    showLess: "Show fewer",
    alsoOn: "Also on",
  },
  about: {
    eyebrow: "Typhoon",
    headline: "American feeling. European soul. Turkish lyrics.",
    body:
      "Typhoon breaks genre boundaries without losing their handwriting: punchy blues riffs, funky grooves, soulful melodies, jazz finesse and Turkish-language lyrics. An experienced band that ignites the moment they hit the stage.",
    lead:
      "Typhoon delivers a powerful mix of blues rock, funk, soul, jazz and southern rock with an American-European sound. Self-written songs combine punchy blues riffs, funky grooves, soulful melodies and jazz finesse. Turkish-language lyrics give the songs depth and a cultural identity of their own.\n\nAt its core is a well-rehearsed collective of eight experienced musicians with more than 30 years of stage experience, built on vocals, a horn section and a grooving rhythm section.\n\nIn their own Kanzlei Studio in Hechingen, the band works out its arrangements with great attention to detail and modern equipment. The result is a complete package of craftsmanship and genuine joy of playing.",
    more: "More about Typhoon",
    imageAlt: "Typhoon singing live on stage",
    cta: "Meet the line-up",
    ctaBook: "Booking request",
    facts: [
      { label: "Line-up", value: "{count} musicians incl. horn section" },
      { label: "Lyrics", value: "Turkish, original songs" },
      { label: "Home base", value: "Kanzlei Studio, Hechingen (DE)" },
    ],
  },
  members: {
    title: "The line-up",
    showAll: "Show all musicians",
    showLess: "Show fewer",
    ...buildMemberMaps("en"),
  },
  shows: {
    title: "Shows",
    intro: "Upcoming concerts. Tickets and details come straight from the promoter.",
    tickets: "Tickets",
    tba: "Date to be announced",
    emptyTitle: "New dates are being planned.",
    emptyBody: "Festival, club, city festival or corporate event: bring Typhoon to your stage.",
    emptyCta: "Booking request",
    past: "Past shows",
    placeholderTitles: [
      "New dates in preparation",
      "Festival season",
      "Club tour",
      "Private & corporate events",
    ],
    placeholderRegion: ["Germany", "Southern Germany", "DE / AT", "On request"],
    placeholderTime: ["Soon", "Soon", "Soon", "Booking open"],
    eventTypes: {
      festival: "Festival",
      club: "Club show",
      concert: "Concert",
      cityfest: "City festival",
      corporate: "Corporate event",
      private: "Private event",
      wedding: "Wedding",
      other: "Concert",
    },
  },
  media: {
    title: "Photos",
    open: "Open image",
    close: "Close",
    prev: "Previous image",
    next: "Next image",
    counter: "Image {index} of {total}",
  },
  booking: {
    title: "Book Typhoon",
    intro:
      "Tell us a little about your event. We'll reply personally with availability and terms.",
    factsTitle: "For promoters",
    facts: [
      { label: "Line-up", value: "{count} musicians: vocals, horn section, rhythm section" },
      { label: "Set", value: "Original songs with Turkish lyrics" },
      { label: "Style", value: "Blues rock, funk, soul, jazz, southern rock" },
      { label: "Occasions", value: "Festivals, clubs, city festivals, corporate and private events" },
      { label: "Based in", value: "Hechingen, Baden-Württemberg, Germany; happy to travel" },
    ],
    direct: "Reach us directly",
    reply: "We usually reply within 48 hours.",
    nameLabel: "Name",
    emailLabel: "Email",
    phoneLabel: "Phone",
    dateLabel: "Event date",
    locationLabel: "Location",
    locationHint: "City and venue, if known",
    typeLabel: "Type of event",
    typePlaceholder: "Please choose",
    types: {
      festival: "Festival",
      club: "Club / concert",
      cityfest: "City festival",
      corporate: "Corporate event",
      private: "Private party / wedding",
      other: "Other",
    },
    messageLabel: "Message",
    messageHint: "Timing, audience, on-site tech, budget: every detail helps.",
    required: "required",
    optional: "optional",
    privacyNote: "We only use your details to handle this request. See our",
    privacyLink: "privacy policy",
    submit: "Send request",
    submitting: "Sending …",
    requiredErr: "Please fill in the highlighted fields.",
    networkErr:
      "We couldn't send your request. Please try again later or email us directly.",
    submitFallback:
      "Online sending is unavailable right now. Please email us at booking@typhoon.band.",
    submitOk: "Thanks for your request. We'll get back to you as soon as possible.",
    submitOkTitle: "Request received",
    submitAnother: "Send another request",
    submitError:
      "We couldn't send your request. Please try again later or email us directly.",
    errors: {
      name: "Please enter your name.",
      email: "Please enter a valid email address.",
      event_location: "Please enter the location.",
      event_type: "Please choose the type of event.",
      message: "Please write a few more lines (at least 10 characters).",
      event_date: "Please choose a valid date.",
      phone: "The phone number is too long.",
      rate: "Too many requests in a short time. Please try again in a few minutes.",
    },
  },
  footer: {
    contact: "Contact",
    follow: "Follow us",
    listen: "Listen & follow",
    legal: "Legal",
    imprint: "Imprint",
    privacy: "Privacy",
    cookies: "Cookies",
    consentSettings: "Privacy settings",
    blurb:
      "Typhoon blends Turkish-language lyrics with blues rock, funk, soul, jazz and southern rock.",
    copyrightTemplate: "© {year} Typhoon. All rights reserved.",
    toTop: "Back to top",
  },
  cookies: {
    title: "Privacy",
    body:
      "This site sets no tracking or advertising cookies. External content such as videos or streaming players only loads with your consent.",
    acceptShort: "Allow all",
    decline: "Necessary only",
    save: "Save choice",
    cancel: "Cancel",
    necessary: "Necessary",
    necessaryBody: "Only stores this choice in your browser.",
    external: "External media",
    externalBody: "Load videos and players from YouTube, Spotify & co. after consent.",
    privacyLink: "Privacy",
    cookiesLink: "Cookies",
  },
  gate: {
    title: "External content",
    body: "Loading it sends data to {provider}.",
    load: "Load once",
    always: "Always allow",
  },
  legal: {
    backToHome: "Back to home",
    imprintTitle: "Imprint",
    privacyTitle: "Privacy policy",
    cookiesTitle: "Cookie notice",
    draftNote: "Initial draft — extended over time.",
    updated: "Last updated",
  },
  player: {
    play: "Play",
    pause: "Pause",
    playTrack: "Play {title}",
    pauseTrack: "Pause {title}",
    prev: "Previous song",
    next: "Next song",
    volume: "Volume",
    mute: "Mute",
    unmute: "Unmute",
    close: "Close player",
    seek: "Position in {title}",
    by: "Typhoon",
    dock: "Audio player",
  },
  notFound: {
    title: "This page doesn't exist.",
    body: "Head back to the home page. The music is playing there.",
    cta: "Back to home",
  },
  stage: {
    setlist: "Setlist",
    setlistNote: "Tap to play · streaming only, no download",
    plotLabel: "Stage plot of the line-up",
    plotHint: "Tap a position to meet the musicians.",
    audience: "Audience",
    more: "More musicians",
    previewTitle: "This is how your request arrives",
    previewTo: "To",
    previewFrom: "From",
    previewEmpty: "not set yet",
  },
};

const tr: Dict = {
  meta: {
    title: "Typhoon · Türkçe sözlerle blues rock, funk ve soul",
    description:
      "Hechingen'den Typhoon, Türkçe sözleri blues rock, funk, soul, jazz ve southern rock ile birleştirir. Demoları dinleyin, konserleri bulun, grubu davet edin.",
    ogAlt: "Typhoon: altın imzalı sepya bir kolajda sekiz müzisyen",
  },
  a11y: {
    skip: "İçeriğe geç",
    mainNav: "Ana menü",
    langNav: "Dil seçin",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    home: "Typhoon ana sayfa",
  },
  nav: {
    band: "Grup",
    music: "Müzik",
    shows: "Konserler",
    media: "Fotoğraflar",
    booking: "Booking",
  },
  hero: {
    line1: "SMOOTH.",
    line2: "OLAĞANÜSTÜ.",
    line3: "FUNK.",
    description:
      "Typhoon, Türkçe sözleri blues rock, funk, soul, caz ve southern rock ile birleştirir — güçlü, sıcak ve sahnede enerji dolu.",
    ctaListen: "Şarkıları dinle",
    ctaBook: "Booking talebi",
    playFeatured: "{title} dinle",
  },
  brand: {
    genreLine: "BLUES ROCK • FUNK • SOUL • JAZZ • SOUTHERN ROCK",
    genres: ["Blues rock", "Funk", "Soul", "Jazz", "Southern rock"],
  },
  music: {
    title: "Dinle",
    intro:
      "Türkçe sözler, blues riff'leri ve öne çıkan nefesli partileriyle demolar. Sayfada gezinirken müzik çalmaya devam eder.",
    featuredLabel: "Güncel single",
    tracklist: "Tüm demolar",
    trackCount: "{count} demo",
    nowPlaying: "Şimdi çalıyor",
    paused: "Duraklatıldı",
    loading: "Yükleniyor …",
    error: "Bu şarkı yüklenemedi.",
    noDownload: "Yalnızca dinleme",
    showAll: "Tüm demoları göster",
    showLess: "Daha az göster",
    alsoOn: "Ayrıca şurada",
  },
  about: {
    eyebrow: "Typhoon",
    headline: "Amerikan tını. Avrupalı ruh. Türkçe sözler.",
    body:
      "Typhoon, kendi imzasını kaybetmeden tür sınırlarını aşar: vurucu blues riff'leri, funky groove'lar, ruhlu melodiler, jazz incelikleri ve Türkçe sözler. Sahneye çıktığı an alev alan tecrübeli bir grup.",
    lead:
      "Typhoon; blues rock, funk, soul, jazz ve southern rock'ı Amerikan-Avrupa tınısıyla güçlü bir karışımda buluşturur. Kendi besteleri vurucu blues riff'lerini, funky groove'ları, ruhlu melodileri ve jazz inceliklerini bir araya getirir. Türkçe sözler şarkılara derinlik ve kendine has bir kültürel kimlik kazandırır.\n\nMerkezde, 30 yılı aşkın sahne tecrübesine sahip sekiz deneyimli müzisyenden oluşan uyumlu bir kolektif var; vokal, nefesli grubu ve groove dolu bir ritim grubu.\n\nGrup, Hechingen'deki kendi Kanzlei Studio'sunda düzenlemelerini büyük bir özen ve modern teknikle hazırlar. Sonuç: ustalık ve içten çalma keyfinin bir araya geldiği eksiksiz bir paket.",
    more: "Typhoon hakkında daha fazla",
    imageAlt: "Typhoon sahnede canlı söylüyor",
    cta: "Kadroyu tanıyın",
    ctaBook: "Booking talebi",
    facts: [
      { label: "Kadro", value: "Nefesli grubuyla {count} müzisyen" },
      { label: "Sözler", value: "Türkçe, kendi şarkıları" },
      { label: "Merkez", value: "Kanzlei Studio, Hechingen (Almanya)" },
    ],
  },
  members: {
    title: "Kadro",
    showAll: "Tüm müzisyenleri göster",
    showLess: "Daha az göster",
    ...buildMemberMaps("tr"),
  },
  shows: {
    title: "Konserler",
    intro: "Sıradaki konserler. Bilet ve detaylar doğrudan organizatörde.",
    tickets: "Bilet",
    tba: "Tarih yakında",
    emptyTitle: "Yeni tarihler planlanıyor.",
    emptyBody: "Festival, kulüp, şehir şenliği ya da kurumsal etkinlik: Typhoon'u sahnenize davet edin.",
    emptyCta: "Booking talebi",
    past: "Geçmiş konserler",
    placeholderTitles: [
      "Yeni tarihler hazırlanıyor",
      "Festival sezonu",
      "Kulüp turnesi",
      "Özel & kurumsal etkinlikler",
    ],
    placeholderRegion: ["Almanya", "Güney Almanya", "DE / AT", "Talep üzerine"],
    placeholderTime: ["Yakında", "Yakında", "Yakında", "Booking açık"],
    eventTypes: {
      festival: "Festival",
      club: "Kulüp konseri",
      concert: "Konser",
      cityfest: "Şehir şenliği",
      corporate: "Kurumsal etkinlik",
      private: "Özel etkinlik",
      wedding: "Düğün",
      other: "Konser",
    },
  },
  media: {
    title: "Fotoğraflar",
    open: "Görseli aç",
    close: "Kapat",
    prev: "Önceki görsel",
    next: "Sonraki görsel",
    counter: "Görsel {index} / {total}",
  },
  booking: {
    title: "Typhoon'u davet edin",
    intro:
      "Etkinliğinizi kısaca anlatın. Uygunluk ve koşullarla size bizzat dönüş yapalım.",
    factsTitle: "Organizatörler için",
    facts: [
      { label: "Kadro", value: "{count} müzisyen: vokal, nefesli grubu, ritim grubu" },
      { label: "Program", value: "Türkçe sözlü kendi şarkıları" },
      { label: "Tarz", value: "Blues rock, funk, soul, jazz, southern rock" },
      { label: "Etkinlikler", value: "Festival, kulüp, şehir şenliği, kurumsal ve özel etkinlikler" },
      { label: "Merkez", value: "Hechingen, Baden-Württemberg, Almanya; uzak yerlere de gelir" },
    ],
    direct: "Doğrudan ulaşın",
    reply: "Genellikle 48 saat içinde yanıt veriyoruz.",
    nameLabel: "İsim",
    emailLabel: "E-posta",
    phoneLabel: "Telefon",
    dateLabel: "Etkinlik tarihi",
    locationLabel: "Yer",
    locationHint: "Şehir ve biliniyorsa mekân",
    typeLabel: "Etkinlik türü",
    typePlaceholder: "Lütfen seçin",
    types: {
      festival: "Festival",
      club: "Kulüp / konser",
      cityfest: "Şehir şenliği",
      corporate: "Kurumsal etkinlik",
      private: "Özel parti / düğün",
      other: "Diğer",
    },
    messageLabel: "Mesaj",
    messageHint: "Zaman, izleyici, teknik imkânlar, bütçe: her detay işimize yarar.",
    required: "zorunlu",
    optional: "isteğe bağlı",
    privacyNote: "Bilgilerinizi yalnızca bu talep için kullanıyoruz. Ayrıntılar:",
    privacyLink: "Gizlilik politikası",
    submit: "Talebi gönder",
    submitting: "Gönderiliyor …",
    requiredErr: "Lütfen işaretli alanları doldurun.",
    networkErr:
      "Talep gönderilemedi. Lütfen daha sonra tekrar deneyin ya da bize doğrudan yazın.",
    submitFallback:
      "Çevrimiçi gönderim şu anda kullanılamıyor. Lütfen booking@typhoon.band adresine yazın.",
    submitOk: "Talebiniz için teşekkürler. En kısa sürede size dönüş yapacağız.",
    submitOkTitle: "Talebiniz ulaştı",
    submitAnother: "Yeni talep gönder",
    submitError:
      "Talep gönderilemedi. Lütfen daha sonra tekrar deneyin ya da bize doğrudan yazın.",
    errors: {
      name: "Lütfen adınızı girin.",
      email: "Lütfen geçerli bir e-posta adresi girin.",
      event_location: "Lütfen yeri girin.",
      event_type: "Lütfen etkinlik türünü seçin.",
      message: "Lütfen birkaç satır daha yazın (en az 10 karakter).",
      event_date: "Lütfen geçerli bir tarih seçin.",
      phone: "Telefon numarası çok uzun.",
      rate: "Kısa sürede çok fazla talep. Lütfen birkaç dakika sonra tekrar deneyin.",
    },
  },
  footer: {
    contact: "İletişim",
    follow: "Bizi takip edin",
    listen: "Dinle & takip et",
    legal: "Hukuki",
    imprint: "Künye",
    privacy: "Gizlilik",
    cookies: "Çerezler",
    consentSettings: "Gizlilik ayarları",
    blurb:
      "Typhoon, Türkçe sözleri blues rock, funk, soul, jazz ve southern rock ile birleştirir.",
    copyrightTemplate: "© {year} Typhoon. Tüm hakları saklıdır.",
    toTop: "Başa dön",
  },
  cookies: {
    title: "Gizlilik",
    body:
      "Bu site izleme ya da reklam çerezi kullanmaz. Video veya müzik oynatıcısı gibi harici içerikler yalnızca onayınızla yüklenir.",
    acceptShort: "Tümüne izin ver",
    decline: "Yalnızca gerekli",
    save: "Seçimi kaydet",
    cancel: "Vazgeç",
    necessary: "Gerekli",
    necessaryBody: "Yalnızca bu seçimi tarayıcınızda saklar.",
    external: "Harici medya",
    externalBody: "YouTube, Spotify vb. video ve oynatıcıları onaydan sonra yükle.",
    privacyLink: "Gizlilik",
    cookiesLink: "Çerezler",
  },
  gate: {
    title: "Harici içerik",
    body: "Yüklendiğinde veriler {provider} sağlayıcısına aktarılır.",
    load: "Bir kez yükle",
    always: "Her zaman izin ver",
  },
  legal: {
    backToHome: "Ana sayfaya dön",
    imprintTitle: "Künye",
    privacyTitle: "Gizlilik politikası",
    cookiesTitle: "Çerez bildirimi",
    draftNote: "İlk taslak — zaman içinde genişletilecektir.",
    updated: "Güncelleme",
  },
  player: {
    play: "Oynat",
    pause: "Duraklat",
    playTrack: "{title} oynat",
    pauseTrack: "{title} duraklat",
    prev: "Önceki şarkı",
    next: "Sonraki şarkı",
    volume: "Ses düzeyi",
    mute: "Sessize al",
    unmute: "Sesi aç",
    close: "Oynatıcıyı kapat",
    seek: "{title} içindeki konum",
    by: "Typhoon",
    dock: "Müzik çalar",
  },
  notFound: {
    title: "Bu sayfa bulunamadı.",
    body: "Ana sayfaya dönün. Müzik orada çalıyor.",
    cta: "Ana sayfaya dön",
  },
  stage: {
    setlist: "Set listesi",
    setlistNote: "Dinlemek için dokun · yalnızca dinleme, indirme yok",
    plotLabel: "Kadronun sahne planı",
    plotHint: "Müzisyenleri tanımak için bir pozisyona dokun.",
    audience: "Seyirci",
    more: "Diğer müzisyenler",
    previewTitle: "Talebin bize böyle ulaşır",
    previewTo: "Alıcı",
    previewFrom: "Gönderen",
    previewEmpty: "henüz boş",
  },
};

export const dictionaries: Record<Locale, Dict> = { de, en, tr };

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}

/** Replace `{key}` placeholders. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    k in values ? String(values[k]) : `{${k}}`,
  );
}
