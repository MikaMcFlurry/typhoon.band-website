# Current Task – UI Bugfix v6

## Ziel

Der aktuelle Desktop-Stand ist nah am Ziel, aber es gibt konkrete Fehler in Hero, Navigation, Cookie-Banner, Mehrsprachigkeit, Demo-Playern, Media-Viewer und Booking-Mobile.

Dies ist ein strikter Bugfix-Batch nach Nutzerangaben. Nicht frei redesignen.

## Nicht anfassen / nicht erweitern

Nicht implementieren:
- vollständiges Admin CRUD
- Shop
- Payment
- Analytics
- externe Embeds
- neue Backend-Features außerhalb der unten genannten UI-/Routing-/Cookie-/Player-Fixes

Beibehalten:
- aktuelles Desktop-Grundlayout
- Claude-Design-Optik
- AudioProvider/Waveform-Grundlogik
- Supabase/Resend-Grundlage
- Legal Routes
- aktuelle Assets

## Quellen

Lies:
- `CLAUDE.md`
- `docs/16-ui-bugfix-v6-exact-requirements.md`

Zusätzlich die angehängten Screenshots:
- `desktop-aktuell.png`
- `mobil-aktuell.png`

Die Screenshots sind der aktuelle Fehlerstand. Die Anforderungen in `docs/16-ui-bugfix-v6-exact-requirements.md` sind verbindlich.

## Muss-Fixes

1. Desktop Hero:
   - Bild links nicht vom schwarzen Hintergrund überdecken.
   - Bild vollständig sichtbar machen.
   - Header-Signatur auf Desktop ca. 5 mm nach unten und 2 cm nach links verschieben.

2. Mobile Hero:
   - Header-Bild vollständig sichtbar machen; linker Teil darf nicht abgeschnitten sein.
   - Signatur deutlich weiter nach unten, so dass sie unten gerade aus dem Bild herausragt.
   - Signatur etwas nach links verschieben.

3. Mobile Menü:
   - Wenn Burger-Menü offen ist, darf die Hero-/Typhoon-Signatur dahinter nicht sichtbar sein.
   - Menü braucht eigenen deckenden Hintergrund.
   - Im Menü-Header darf kein Teil der Website im Hintergrund sichtbar sein.

4. Legal Navigation:
   - Header-Links müssen auch von Impressum/Datenschutz/Cookies zurück zur Home-Onepager-Section führen.
   - Links auf Legal Pages müssen `/${locale}#section` verwenden und nicht nur `#section`.

5. Cookie Banner:
   - Cookie Banner mit Bestätigung umsetzen.
   - Keine Analytics/Embeds aktivieren.
   - Consent lokal speichern.
   - Links zu Datenschutz/Cookies anbieten.

6. Sprachen:
   - EN und TR müssen tatsächlich existieren.
   - Header-Switch DE/EN/TR muss Inhalte in entsprechender Sprache laden.
   - Legal Pages brauchen mindestens saubere EN/TR-Fassung oder strukturierte Übersetzung.

7. Demo-Player:
   - Vor/Zurück, Lautstärke und Drei-Punkte Buttons müssen Funktion bekommen.
   - Header-Player-Waveform muss über die ganze freie Breite bis zur Zeitangabe rendern.
   - Andere Demo-Player-Waveforms müssen breiter und optisch angepasst werden.
   - Kein Overflow, kein Download-Button.

8. Media:
   - Gallery/Media-Items dürfen nicht in neuem Tab öffnen.
   - Klick öffnet eigenen Overlay-Viewer mit Vor/Zurück Buttons, Schließen und Tastatursteuerung.

9. Booking Mobile:
   - Kontaktformular-Bild rechts ist mobil falsch zugeschnitten.
   - Auf Mobile muss das Bild sichtbar und sinnvoll positioniert sein, nicht links/rechts abgeschnitten.
   - Button auf Bild muss vollständig sichtbar und korrekt ausgerichtet sein.

## Vor Abschluss

Run:
```bash
npm run lint
npm run build
```

Fehler fixen.

## Abschlussbericht

Berichte:
- Hero Desktop/Mobile Fixes
- Mobile Menü Fix
- Legal Navigation Fix
- Cookie Banner
- EN/TR Umsetzung
- Player-Control-Funktionen
- Waveform-Breiten
- Media Overlay Viewer
- Booking-Mobile Bildfix
- geänderte Dateien
- lint/build Ergebnis
