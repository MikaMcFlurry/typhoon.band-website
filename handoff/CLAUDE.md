# Typhoon — Funk &amp; Soul Band Website · Handoff Protocol

> **Aufgabe für Claude Code:** Frontend 1:1 übernehmen, textliche Inhalte anpassen, alle Verlinkungen setzen, Backend anschließen.
>
> Stand: finaler statischer Build, Multi-Page-Setup, kein Build-Tool.

---

## 1. Was ist FERTIG (nicht anfassen)

✅ Komplettes Frontend-Layout (Desktop + Mobile)  
✅ Visuelle DNA: Typografie, Farb-Tokens, Sepia-Bildlogik  
✅ Audio-Player UI (2-Zeilen-Layout, identisch auf Desktop &amp; Mobile)  
✅ Hero mit Gold-Signatur-Overlay  
✅ Header-Signatur fixed, z-index 1000  
✅ Booking-Formular Layout + Honeypot-Feld  
✅ Responsive Navigation (Desktop Top-Nav / Mobile Burger + Drawer)  
✅ Alle Sektionen: Termine, Members, Media, Booking, News, Footer

**Frontend ist EINGEFROREN** — bitte Layout, Spacing, Schriftgrößen, Farben nicht ändern. Falls Änderungen unvermeidlich, vorher die z-index- und Sepia-Filter-Konventionen (siehe §6) prüfen.

---

## 2. Was Claude Code TUN soll

### 2.1 Textliche Inhalte anpassen
Alle redaktionellen Inhalte stehen **zentral** in `assets/typhoon-data.js` als JS-Module:

```js
window.TYPHOON_DATA = {
  shows: [
    { day: "24", month: "MAI", venue: "Zorlu PSM Studio", city: "Istanbul, TR", time: "20:30 Uhr", ticketsUrl: "#" },
    // … 4 Einträge Desktop / unbegrenzt Mobile
  ],
  members: [
    { name: "Taner Yücel", role: "Vocals / Keys", photo: "assets/members/01.jpeg" },
    // … 7 Einträge
  ],
  media: [
    { type: "video"|"image", thumb: "assets/...", url: "..." },
    // … 7 Einträge
  ],
  news: [
    { tag: "STUDIO SESSION", title: "...", excerpt: "...", date: "02. Mai 2024", thumb: "assets/..." },
    // … 3 Einträge
  ],
  tracks: [
    { title: "Find A Way", artist: "Typhoon", duration: "4:12", file: "..." }
  ]
};
```

**Aufgaben:**
- Echte Termine vom Kunden einpflegen
- Member-Roster verifizieren (Namen, Rollen, Foto-Reihenfolge)
- Media-Tiles mit echten YouTube/Spotify/Foto-Links füllen
- News-Einträge mit echten Inhalten
- Track-Liste komplettieren

### 2.2 Verlinkungen setzen

| Was | Wo | Aktuell |
|---|---|---|
| Tickets-Buttons (Mobile) | `shows[].ticketsUrl` | `#` |
| Member-Bio-Links | optional, derzeit kein href | — |
| Social-Icons Footer | `desktop.html` &amp; `mobile.html`, Klasse `.footer-socials` / `.footer-socials-m` | `#` für Instagram, Facebook, YouTube, Spotify, Mail, TikTok |
| Impressum / Datenschutz / AGB | Footer-Legal-Spalte beider HTML-Files | `#` |
| Section-Links ("Alle Termine ansehen →" etc.) | inline in HTML | `#` |
| Header-Nav-Links | inline in HTML, scrollen zu `#anchor` | OK, sind Anchor-Links zu Sektionen — falls Multi-Page gewünscht, hier umbiegen |

### 2.3 Backend anschließen

**Booking-Formular** — beide HTML-Files (`#booking-form-desktop` / `#booking-form-mobile`):

```html
<form id="booking-form-desktop" novalidate>
  <input type="text" name="hp_field" tabindex="-1" ...>  <!-- Honeypot, IGNORE wenn ausgefüllt -->
  <input name="name" required>
  <input name="email" type="email" required>
  <input name="location">
  <input name="eventDate" type="date">
  <textarea name="message" required></textarea>
  <input name="consent" type="hidden" value="on">
</form>
```

Aktuell wird der Submit in `assets/typhoon-app.js` (Funktion `attachBookingForm`) abgefangen und zeigt nur einen Alert. Hier den echten Endpoint einsetzen:

```js
// in typhoon-app.js — handleBookingSubmit()
const response = await fetch('/api/booking', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

Empfohlene Optionen (vom einfachsten zum aufwändigsten):
1. **Mailto-Fallback** — `action="mailto:booking@typhoon-band.com"` (kein Backend nötig, aber unzuverlässig)
2. **Form-Service** — Formspree, Basin, Web3Forms (Drop-in mit Form-Action-URL)
3. **Eigener Endpoint** — Node/PHP/Edge-Function mit Mail-Versand

**Audio-Player** — aktuell Mock. Echtes Audio einbinden:
- `<audio>`-Element in `audio-card` einfügen
- Play-Button-Handler in `typhoon-app.js` mit `audio.play()` / `audio.pause()` ersetzen
- Waveform mit WaveSurfer.js (Empfehlung) oder Howler ersetzen
- Track-Daten aus `tracks[]` ziehen

### 2.4 Optional / Nice-to-have
- SEO-Meta-Tags (Open Graph, Twitter Cards, JSON-LD `MusicGroup` &amp; `Event` Schema)
- Image-Optimierung: WebP/AVIF + `loading="lazy"` + `srcset`
- Cookie-Consent falls Tracking eingebaut wird
- Datenschutz/Impressum/AGB als eigene HTML-Seiten anlegen

---

## 3. Datei-Struktur

```
handoff/
├── index.html                       # Auto-Redirect: Desktop ≥768px → desktop.html, sonst mobile.html
├── desktop.html                     # Desktop-Layout (Design-Breite ~1180–1920px)
├── mobile.html                      # Mobile-Layout (Design-Breite 390px)
├── CLAUDE.md                        # Diese Datei
└── assets/
    ├── typhoon-shared.css           # Geteilte Tokens, Buttons, Waveform, Drawer-Logik
    ├── typhoon-data.js              # Inhalts-Daten (Single Source of Truth)
    ├── typhoon-app.js               # Renderer + Audio-Mock + Booking + Drawer
    ├── typhoon-signature-gold.png   # Wortmarke Gold (Hero, Footer)  — 2099×724, transparent
    ├── typhoon-signature-gold-bold.png  # Verstärkte Variante (Header)  — gleicher Schriftzug, Alpha ×1.8
    ├── hero-collage.jpeg            # Hero-Hauptbild (Band live)
    ├── singer-stage.jpeg            # Booking-Section, Members
    ├── typhoon-singer.jpeg          # Media-Tile / Member-Fallback
    ├── trombone-fan.jpeg            # Media-Tile
    ├── trombone-festival.jpeg       # Media-Tile
    └── members/                     # 01–07.jpeg — 7 Member-Portraits
```

**Kein Build-Tool, kein npm.** Site läuft direkt via statischem Server (`python -m http.server`, `npx serve`, jeder Hosting-Provider).

---

## 4. Design Tokens (in `typhoon-shared.css`)

```css
:root {
  --bg-deep:       #030201;   /* Schwarz mit Sepia-Stich */
  --bg-soft:       #0c0805;
  --cream:         #f4ead3;   /* Haupt-Textfarbe auf dunkel */
  --muted-cream:   #b8a987;
  --muted:         #6b5e44;
  --gold:          #c79a4b;   /* Akzentfarbe Primary */
  --gold-soft:     #e8c982;   /* Hover/Highlights */
  --line:          rgba(232,201,130,0.15);  /* Border auf Cards */
}
```

**Schriften** (Google Fonts, in HTML-Head importiert):
- Headlines: `Georgia, 'Times New Roman', serif` — Bold, letter-spacing −0.02 bis −0.04em
- Body: `Inter, system-ui, sans-serif` — 400/500/600/700

---

## 5. Komponenten-Übersicht

| Komponente | Desktop-Class | Mobile-Class | Datenquelle |
|---|---|---|---|
| Header | `.site-header` | `.site-header-m` | inline (Nav-Items) |
| Hero | `.hero` | `.hero-m` | inline (Headline) |
| Audio-Player | `.audio-card` | `.audio-card-m` | `tracks[0]` |
| Termine | `.shows-grid` | `.shows-list-m` | `shows[]` |
| Members | `.members-grid` | `.members-grid-m` | `members[]` |
| Media | `.media-grid` | `.media-grid-m` | `media[]` |
| Booking | `.booking-grid` | `.booking-grid-m` | Form-Input |
| News | `.news-grid` | `.news-list` | `news[]` |
| Footer | `.site-footer` | `.footer-m` | inline |

---

## 6. Wichtige Konventionen

### z-index-Stack (von hinten nach vorne)
```
Hero-Bild (.hero-image)            : 1
Hero-Vignette                      : 2
Hero-Copy (.hero-inner)            : 5
Audio-Card (.featured-player)      : 20
Hero-Signatur (.hero-signature)    : 50      ← MUSS über Player liegen
Drawer (Mobile)                    : 49
Header (.site-header)              : 1000    ← oberste Ebene
```

### Hero-Signatur Positionierung
- **Datei**: `typhoon-signature-gold.png` (2099×724, transparent)
- **Desktop**: `bottom: -40px`, `right: -2%`, `width: 700px`, `transform: rotate(-4deg)`, `z-index: 50`
- **Mobile**: `bottom: -50px`, `right: 2%`, `width: 70%`, gleicher Rotation
- **Hero-Container braucht `overflow: visible`** damit die Signatur über den unteren Rand ragen kann
- Hero-Bild `object-position: center top` damit unten kein Streifen entsteht

### Sepia-Bild-Filter
Alle redaktionellen Bilder bekommen denselben Filter für einheitliche Optik:
```css
filter: sepia(0.32–0.4) saturate(0.78–0.85) contrast(1.05–1.08);
```
**Ausnahmen** (kein Sepia): die beiden Signature-PNGs.

### Spacing-Skala
6 / 10 / 16 / 24 / 32 / 48 / 64 px. Card-Padding 12–14px Mobile, 18–28px Desktop.

### Schriftgrößen (Mindestwerte)
- Hero-Headline: 38px Mobile / 88px Desktop
- Body: 11px Mobile / 14px Desktop
- Tags/Kicker: 8–10px

---

## 7. Lokal starten

```bash
cd handoff
python -m http.server 8000
# → http://localhost:8000/index.html
```

Oder einfach `desktop.html` / `mobile.html` direkt im Browser öffnen.

---

## 8. Browser-Support

Getestet/zielgerichtet auf:
- Chrome/Edge (aktuell)
- Safari 16+
- Firefox 110+

Verwendet moderne CSS (Grid mit `minmax`, `clamp`, `aspect-ratio`, `backdrop-filter`). Kein IE-Support.

---

## 9. Bekannte Stolperfallen für Claude Code

1. **Mobile-Booking-Form**: nutzt `grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr)` plus Single-Column-Flex auf der Form. Bitte nicht auf simple `1fr 1fr` zurücksetzen — das löst intrinsic-width-Blowout aus.
2. **Hero-Section hat `overflow: visible`** (nicht hidden!) — Signatur ragt absichtlich unten heraus.
3. **Header ist `position: fixed`** mit `pointer-events: none` (nur innere Elemente klickbar) — damit transparente Bereiche keine Klicks blockieren.
4. **Audio-Player auf Desktop und Mobile haben unterschiedliche Klassen** (`.audio-card` vs `.audio-card-m`) aber identische Visual Language. Beim Backend-Anschluss: zwei Form-IDs, zwei Player-IDs.
5. **Honeypot-Feld** (`hp_field`) im Booking-Form — wenn ausgefüllt, ist es ein Bot. Backend muss diesen Submit verwerfen.

---

**Fragen zur Design-Logik?** Z-Index-Stack und Sepia-Filter-Konvention sind die zwei häufigsten Stolperfallen. Bei strukturellen Layout-Änderungen vorher beides prüfen.
