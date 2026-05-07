# 16 – UI Bugfix v6 Exact Requirements

## Grundregel

Dies ist kein allgemeiner Redesign-Batch. Claude Code soll exakt die unten genannten Fehler beheben und nicht vom gewünschten Design abweichen.

Wenn eine aktuelle Implementierung mit diesen Anforderungen kollidiert, gewinnen diese Anforderungen.

Die aktuellen Screenshots `desktop-aktuell.png` und `mobil-aktuell.png` zeigen den Fehlerstand.

---

# 1. Desktop Hero: Bild sichtbar + Signaturposition

## Problem

Auf Desktop wird der linke Rand des Hero-Bildes vom schwarzen Hintergrund/Overlay überdeckt. Das Bild muss aber vollständig sichtbar sein.

Zusätzlich muss die große Typhoon-Signatur über dem Headerbild verschoben werden:
- ca. 5 mm nach unten
- ca. 2 cm nach links

## Umsetzung

### Bild

- Das Hero-Bild darf links nicht durch ein schwarzes Overlay oder den Textblock verdeckt werden.
- Textblock und Bildblock bleiben getrennt, aber der Bildblock muss in seiner gesamten Breite sichtbar sein.
- Falls ein Verlauf zwischen Text und Bild nötig ist, darf er den linken Bildrand nur weich überblenden, nicht hart/schwarz abdecken.
- Keine harte vertikale Kante über dem Bild.
- Kein `overflow-hidden` oder Container-Crop, der den linken Bildinhalt verdeckt.
- Desktop-Hero soll weiterhin wie der Soll-Desktop wirken: links Text, rechts sichtbares Bandbild, Signatur als eigene Ebene.

### Signatur Desktop

Aktuelle Signaturposition ist fast richtig, aber:
- verschiebe sie ca. 5 mm nach unten
- verschiebe sie ca. 2 cm nach links

CSS-Richtwert:
- `translateX(-70px bis -80px)`
- `translateY(18px bis 22px)`

Wenn die aktuelle Signatur schon transformiert ist, diese Werte relativ zur aktuellen Position ergänzen.

Akzeptanz:
- Signatur liegt tiefer und weiter links, aber nicht über dem Textblock.
- Signatur bleibt über dem Bild.
- Signatur wirkt wie im Design, nicht zufällig platziert.

---

# 2. Mobile Hero: Bild vollständig + Signatur tiefer

## Problem

Auf Mobile ist das Header-Bild nicht vollständig sichtbar. Der linke Teil ist abgeschnitten. Die Signatur sitzt zu hoch und zu sehr im Bild.

## Umsetzung

### Bild

- Mobile Hero-Bild muss die Bandkomposition vollständig/sinnvoll zeigen.
- Linker Bildteil darf nicht abgeschnitten sein.
- Nutze mobile-spezifisches `object-position`, `object-fit`, `background-position` oder ein eigenes Layout.
- Falls nötig: `object-fit: contain` innerhalb eines dunklen Bildblocks, statt `cover`, wenn `cover` wichtige Teile abschneidet.
- Keine harte untere Bildkante sichtbar.
- Untere Bildkante muss mit Gradient/Fade in den dunklen Hintergrund auslaufen.

Empfohlener Ansatz:
- Mobile Hero-Bildblock mit `object-fit: cover` nur wenn die ganze Band sichtbar bleibt.
- Sonst `object-fit: contain` + dunkler/sepia Hintergrund + Gradientmasken.
- Unten `mask-image` oder `linear-gradient`/Overlay-Fade verwenden, damit der untere Rand nicht sichtbar ist.

### Signatur Mobile

- Signatur deutlich nach unten schieben.
- Sie soll gerade so unten aus dem Bild herausragen.
- Signatur etwas nach links verschieben.

CSS-Richtwert:
- mobile `translateX(-35px bis -55px)`
- mobile `translateY(70px bis 110px)` gegenüber aktuellem Stand
- Signatur darf in den Player-/Hero-Übergang hineinragen, aber nicht den Player unlesbar machen.

Akzeptanz:
- Signatur sitzt tiefer als aktuell.
- Signatur ragt unten leicht aus dem Hero-Bild heraus.
- Bandbild bleibt sichtbar.
- Keine harte untere Bildkante.

---

# 3. Mobile Menü Overlay

## Problem

Wenn das Menü über die drei Striche geöffnet wird:
- die Typhoon-Signatur ist weiterhin sichtbar
- im Header des Menüs sieht man Website-Inhalt im Hintergrund

## Umsetzung

- Das offene Mobile-Menü braucht einen eigenen deckenden Hintergrund.
- Hintergrund: sehr dunkles Schwarz/Braun, optional Premium-Blur, aber nicht transparent genug, dass Signatur/Bild sichtbar bleiben.
- Das Menü muss oberhalb von Hero, Signatur, Floating-Elementen und Media liegen.
- Setze ausreichend hohen `z-index`.

Richtwert:
- Mobile Menu Overlay `z-index: 1000+`
- Hero Signature niedriger, z. B. `z-index: 30-60`
- Floating Buttons dürfen nicht über Menü liegen.

Wenn Menü offen:
- Website-Hintergrund soll nicht sichtbar sein.
- Typhoon-Signatur im Hero darf nicht durchscheinen.
- Headerbereich im Menü muss sauber und eigenständig aussehen.

Akzeptanz:
- Menü offen = keine Signatur sichtbar.
- Menü offen = kein Website-Bild im Hintergrund sichtbar.
- Menülinks bleiben lesbar.
- Schließen funktioniert.

---

# 4. Legal Pages Navigation

## Problem

Wenn man in Impressum, Datenschutz oder Cookies ist, öffnen Header-Links zwar etwas, aber die Legal-Seite/Overlay bleibt sichtbar bzw. man kommt nicht sauber zurück zur Home-Onepager-Section.

## Umsetzung

Header-Links müssen je nach Kontext korrekt funktionieren.

### Auf Home/Onepager

Links können normale Hashes nutzen:
- `#home`
- `#band`
- `#music`
- `#shows`
- `#media`
- `#booking`
- `#contact`

### Auf Legal Pages

Links müssen zur Locale-Home-Seite mit Hash führen:
- `/${locale}#home`
- `/${locale}#band`
- `/${locale}#music`
- `/${locale}#shows`
- `/${locale}#media`
- `/${locale}#booking`
- `/${locale}#contact`

Nicht:
- nur `#band`
- nicht innerhalb der Legal Page bleiben
- kein Overlay offen lassen

Falls Legal Pages als Overlay/Modal implementiert sind:
- Overlay muss beim Klick auf Header-Links schließen.
- Route muss zu `/${locale}#section`.

Akzeptanz:
- Von `/de/legal/imprint` Klick auf `Band` führt zu `/de#band`.
- Von `/de/legal/privacy` Klick auf `Booking` führt zu `/de#booking`.
- Von `/en/legal/cookies` Klick auf `Home` führt zu `/en#home`.

---

# 5. Cookie Banner

## Problem

Cookies sind bisher nur Legal Page, aber kein Banner mit Bestätigung.

## Umsetzung

Ein Cookie-Banner muss eingebaut werden.

### Anforderungen

- Banner erscheint beim ersten Besuch.
- Nutzer kann bestätigen.
- Entscheidung wird lokal gespeichert, z. B. `localStorage`.
- Kein Tracking aktivieren.
- Keine externen Embeds aktivieren.
- Banner enthält kurze Info und Links zu Datenschutz/Cookies.
- Banner ist mobil und desktop sauber.
- Optisch im Typhoon-Stil: dunkel, goldene Akzente, hochwertige Buttons.

### Minimaler Funktionsumfang

Buttons:
- `Akzeptieren`
- optional `Nur notwendige`
- Link `Cookie-Hinweise`

Da aktuell keine optionalen Cookies/Analytics/Embeds verwendet werden, reicht:
- notwendige Cookies/technische Speicherung
- Bestätigung des Hinweises

Akzeptanz:
- Banner erscheint beim ersten Besuch.
- Nach Bestätigung bleibt er weg.
- Legal Links funktionieren.
- Kein Tracking-Code wird hinzugefügt.

---

# 6. Sprachen EN/TR

## Problem

EN und TR Routen existieren, aber Inhalte sind nicht wirklich übersetzt.

## Umsetzung

Implementiere echte Sprachinhalte für:
- Header Navigation
- Hero
- CTAs
- Termine
- Bandinfo
- Mitglieder-Instrumente
- Demos Label
- Media
- Booking
- Kontakt/Footer
- Legal Page Grundstruktur

### Hinweis

Die Übersetzungen dürfen solide Erstfassungen sein. Keine perfekte finale Copy nötig, aber EN/TR dürfen nicht identisch Deutsch bleiben.

### Route-Verhalten

- `/de` Deutsch
- `/en` Englisch
- `/tr` Türkisch
- Sprachumschalter behält Unterseite/Hash möglichst bei.
- Legal Pages auch in Locale erreichbar.

### Beispiel Hero

DE:
`Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock – kraftvoll, warm und live voller Energie.`

EN:
`Typhoon blends Turkish lyrics with blues rock, funk, soul, jazz and southern rock — powerful, warm and full of live energy.`

TR:
`Typhoon, Türkçe sözleri blues rock, funk, soul, caz ve southern rock ile birleştirir — güçlü, sıcak ve sahnede enerji dolu.`

Akzeptanz:
- Klick auf EN zeigt englische UI-Texte.
- Klick auf TR zeigt türkische UI-Texte.
- Keine deutschen Standardtexte in EN/TR außer Eigennamen/Songtitel.

---

# 7. Demo Player Funktionen

## Problem

Bei allen Demo-Playern haben diese Buttons noch keine Funktion:
- Vor
- Zurück
- Lautstärke
- Drei Punkte

Außerdem:
- Header-Demo-Player-Waveform rendert nicht über die ganze freie Breite bis zur Zeitangabe.
- Andere Demo-Player-Waveforms müssen verbreitert und angepasst werden.
- Demo-Player brauchen Songbild, Dauer, Lautstärke/Controls.

## Umsetzung

### Funktionalität

#### Zurück/Vor

- Vorheriger Track startet vorherigen Song in der Songliste.
- Wenn erster Song: zum letzten Song loopen.
- Nächster Track startet nächsten Song in der Songliste.
- Wenn letzter Song: zum ersten Song loopen.

#### Lautstärke

- Mindestfunktion: Mute/Unmute mit sichtbarem Icon-State.
- Besser: kleines Popover/Slider 0–100%.
- Muss für den globalen AudioPlayer gelten.

#### Drei Punkte

- Öffnet kleines Menü.
- Keine Download-Funktion.
- Optionen:
  - `Song-Link kopieren`
  - optional `Demo teilen`
- Menü muss wieder schließbar sein.
- Kein neuer Tab nötig.

### Waveform Header Player

- Waveform muss die gesamte freie Breite zwischen Transport-Controls und Zeit/Volume nutzen.
- Aktuell endet sie zu früh.
- Grid/Flex so anpassen:
  - waveform column = `minmax(0, 1fr)`
  - Zeit/Volume/More bleiben rechts
  - waveform `width: 100%`
  - keine feste zu kleine Max-Width
- Auf Mobile: proportional kleiner, aber weiterhin breite sichtbare Waveform.

### Waveform Demo Rows

- Waveform in den Demo-Rows muss deutlich breiter sein.
- Songtitel und Waveform dürfen sich nicht gegenseitig verdrängen.
- Mobile:
  - falls nötig zwei Zeilen: oben Nummer/Play/Titel, unten Waveform + Zeit/Controls
  - keine horizontale Überbreite
- Desktop:
  - breite Waveform-Spalte
  - Zeit/Volume/More rechts möglich

### Songcover

- Jeder Demo-Player braucht ein Songbild/Cover, falls im Design vorgesehen.
- Wenn kein eigenes Cover existiert, nutze das aktuelle Hero/Band-Signatur-Cover aus den vorhandenen Assets.
- Header-Feature-Player hat bereits Cover, Demo-Rows sollen ebenfalls ein kleines Cover bekommen, sofern das Layout dadurch besser wirkt.

### Dauer

- Zeige Duration je Song.
- Wenn echte Duration aus Audio ermittelt wird, nutzen.
- Wenn initial unbekannt: `0:00 / —`, nach Laden aktualisieren.
- Nicht dauerhaft leer lassen.

Akzeptanz:
- Vor/Zurück funktioniert.
- Lautstärke/Mute funktioniert.
- Drei-Punkte-Menü funktioniert und enthält keine Download-Option.
- Header-Waveform nutzt volle freie Breite.
- Demo-Row-Waveforms sind sichtbar breiter.
- Keine Player laufen rechts aus dem Bildschirm.

---

# 8. Media Viewer Overlay

## Problem

Media-Inhalte öffnen aktuell in neuem Tab.

## Umsetzung

Klick auf Media-Item öffnet eigenen Overlay-Viewer.

### Viewer-Anforderungen

- Fullscreen-Overlay im Typhoon-Stil.
- Großes Bild in der Mitte.
- Hintergrund dunkel/leicht transparent.
- Close-Button.
- Vor/Zurück Buttons.
- Zähler, z. B. `3 / 8`.
- Bildtitel/Alt-Text optional.
- Tastatur:
  - Escape = schließen
  - ArrowLeft = zurück
  - ArrowRight = weiter
- Mobile:
  - Bild passt in Viewport
  - Buttons erreichbar
  - kein horizontaler Overflow

Akzeptanz:
- Kein Media-Link öffnet neues Tab.
- Alle 8 Bilder können im Overlay durchgeklickt werden.
- Overlay blockiert Hintergrundscroll sinnvoll.

---

# 9. Booking Mobile Bild und Button

## Problem

Auf Mobile ist im Kontaktformular das rechte Bild nicht richtig sichtbar. Es wird links und rechts abgeschnitten. Der Button sitzt nicht korrekt. Außerdem ragt das Datum-Feld sowohl Desktop als auch Mobile zu weit heraus.

## Umsetzung

### Bild

- Mobile darf das Bild nicht seitlich abschneiden.
- Verwende mobile-spezifische Darstellung:
  - entweder Bild unter dem Formular als volle Breite
  - oder Bild in eigener Card mit `object-fit: contain`
  - oder `object-position` so, dass Band/Signatur sichtbar bleiben
- Keine harte/unmotivierte Crop-Kante.
- Button muss vollständig sichtbar sein.
- Button nicht an den Rand pressen.

### Form

- Alle Inputs, Textareas und Date-Field müssen innerhalb der Form-Card bleiben.
- Datum-Feld darf nicht herausragen.
- Verwende:
  - `box-sizing: border-box`
  - `width: 100%`
  - `max-width: 100%`
  - `min-width: 0`
- Prüfe `input[type="date"]`, falls Browser eigene Breite erzwingt.
- Mobile und Desktop testen.

Akzeptanz:
- Kein Formularfeld ragt heraus.
- Booking-Bild ist mobile sinnvoll sichtbar.
- Booking-Button ist vollständig sichtbar und klickbar.
- Kein horizontaler Scroll.

---

# 10. Kontakt-Mailadresse

## Problem

`info@typhoon.band` gibt es nicht.

## Umsetzung

Entferne `info@typhoon.band` überall als aktive Kontaktadresse.

Nutze aktuell ausschließlich:
```text
booking@typhoon.band
+49 176 64472296
```

Betroffene Stellen:
- Footer
- Kontaktbereich
- Bookingbereich
- Legal Pages
- site data
- README/docs, sofern sie aktive Kontaktdaten nennen
- SEO/contact metadata, falls vorhanden

Impressum:
- E-Mail ebenfalls auf `booking@typhoon.band` ändern, bis `info@` existiert.

Nicht:
- `info@typhoon.band` als sichtbare Adresse stehen lassen.

Akzeptanz:
- Suche im Code nach `info@typhoon.band` findet keinen aktiven Website-Text mehr.
- Falls historische Docs es noch erwähnen, klar als alt/nicht aktiv markieren oder ersetzen.

---

# 11. Nicht ändern

In diesem Batch nicht:
- Full Admin bauen
- Shop bauen
- Analytics einbauen
- Externe Embeds einbauen
- komplettes Design neu erfinden
- funktionierende Supabase/Resend-Grundlage entfernen
- AudioProvider/Waveform-Logik löschen

---

# 12. Abschlussprüfung

Vor Abschluss:

```bash
npm run lint
npm run build
```

Zusätzlich intern prüfen:
- Mobile 390px Breite
- Desktop 1440px+
- Legal Page Header Links
- Media Overlay
- Cookie Banner First Visit
- Player Controls
- Booking Form ohne Overflow
