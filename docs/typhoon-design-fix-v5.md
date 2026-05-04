# Typhoon Website – Design-Fix v5

## Ziel dieses Batches

Die Desktop-Version ist auf dem richtigen Weg, aber Mobile, Bandinfo, Band-Cards, Demo-Player, Buttons, Termine und Mehrsprachigkeit müssen gezielt korrigiert werden.

Dies ist ein reiner UI-/Content-Fix-Batch. Kein Backend-Ausbau, kein Shop, kein Admin-CRUD, keine Analytics, keine neuen Embeds.

## Wichtigste Regel

Die Desktop-Sollbilder sind die visuelle Quelle.  
Die mobile Ansicht darf nicht als eigenes anderes Design auseinanderfallen. Sie muss dieselbe Designlogik wie Desktop behalten und responsive sauber skalieren/reflowen.

Das bedeutet:
- gleiche visuelle Hierarchie
- gleiche Modul-Logik
- gleiche Button-Sprache
- gleiche Cards
- gleiche Player-Optik
- gleiche Hero-/Header-Wirkung
- keine verschobenen, abgeschnittenen oder zufällig gestapelten Elemente

Wenn aktueller Code vom Sollbild abweicht, gewinnt das Sollbild.

---

## 1. Responsive Grundregel

Aktuell ist Mobile komplett verschoben. Das muss korrigiert werden.

### Ziel

Die Website soll auf jedem Bildschirmformat wie eine sauber responsive Version der Desktop-Website wirken.

### Regeln

- Desktop-Layout bleibt Grundlage.
- Mobile darf nicht neu erfunden werden.
- Positionen der Elemente müssen an gut aussehenden Stellen bleiben.
- Kein Element darf rechts aus dem Bildschirm laufen.
- Keine ungewollte horizontale Scrollbar.
- Große Module müssen proportional skalieren oder sinnvoll umbrechen.
- Abstände dürfen kleiner werden, aber die Designlogik bleibt gleich.
- Header, Hero, Feature-Player, Termine, Bandinfo, Band-Cards, Demos, Media und Booking müssen konsistent aussehen.

### Akzeptanz

Mobile muss wie eine hochwertige, kompakte Version der Desktop-Seite aussehen, nicht wie ein anderes Layout.

---

## 2. Header und Hero

### Soll

Orientierung an:
- `desktop-soll.png`
- `desktop-2-soll.png`

### Probleme aktuell

- Mobile ist verschoben.
- Header/Hero verhalten sich nicht stabil über Breakpoints.
- Elemente wirken auf Mobile nicht wie dieselbe Seite.
- Header-Signatur darf nicht verrutschen.
- Hero-Bild, Text und Signatur müssen sauber getrennte Blöcke bleiben.

### Umsetzung

Header:
- Logo links oben exakt nach Sollbild.
- Navigation auf Desktop wie Sollbild.
- Mobile Burger sauber rechts, ohne Layoutverschiebung.
- Sprachumschalter ergänzen: DE / EN / TR.
- Sprachumschalter muss optisch ins Header-Design passen, klein, hochwertig, nicht dominant.

Hero:
- Textblock, Bildblock und Signaturblock bleiben getrennte visuelle Einheiten.
- Bildblock darf nicht zufällig gecroppt werden.
- Signatur bleibt als eigene Ebene/Overlay.
- Mobile muss die gleiche Kompositionslogik behalten, nur kompakter.

---

## 3. Termine direkt unter Feature-Demo

### Soll

Unter dem Feature-Demo-Player muss direkt eine kompakte Termine-Übersicht erscheinen.

Orientierung an:
- `desktop-2-soll.png`

### Umsetzung

Direkt unter Feature-Demo:
- Section `TERMINE`
- rechts/oben optional Link `ALLE TERMINE ANSEHEN →`
- kompakte Kartenreihe auf Desktop
- auf Mobile sauber umbrechen, z. B. horizontal scroll-snap oder 1-spaltig kompakt

Wenn keine echten Termine vorhanden sind:
- keine Fake-Daten erfinden
- TBA / Demnächst verwenden
- trotzdem optisch wie das Sollmodul aufbauen

Die Navigation `Termine` muss auf diese Section zeigen.

---

## 4. Bandinfo-Teil

### Soll

Der Bandinfo-Teil muss wie `band-info-example.png` umgesetzt werden.

### Aktueller Fehler

Aktuell wie `band-info-aktuell.png`:
- zu großflächige Textbox
- nicht wie das gewünschte Editorial-Modul
- Bild fehlt bzw. falscher Aufbau
- typografisch zu wenig wie Soll

### Zielaufbau

Layout wie Beispiel:
- links großes Band-/Singer-Bild
- rechts Textblock
- kleiner Kicker: `TYPHOON`
- große Headline:
  `AMERIKANISCHES FEELING. EUROPÄISCHE SEELE. TÜRKISCHE TEXTE.`
- darunter kurzer, hochwertiger Beschreibungstext
- Button: `MEHR ÜBER DIE BAND`

### Inhalt

Text Richtung:

Typhoon sprengt Genregrenzen, ohne die eigene Handschrift zu verlieren: markante Blues-Riffs, funkige Grooves, soulige Melodien, jazzige Finessen und türkischsprachige Texte. Eine erfahrene Band, die live sofort zündet.

### Responsive

Desktop:
- Bild links, Text rechts

Mobile:
- Bild oben oder kompakt links/rechts je nach Breite
- Text darunter oder rechts, aber gleiche visuelle Sprache
- nicht als riesige Textwand

---

## 5. Band-Cards

### Soll

Die Band-Cards müssen wie `band-card-example.png` wirken.

### Aktueller Fehler

Aktuell wie `band-card-aktuell.png`:
- nur Bild, Name, Instrument
- keine Beschreibung
- zu wenig hochwertiger Card-Charakter

### Ziel

Jede Band-Card enthält:
- Bild oder hochwertiger Placeholder
- Name
- Instrument
- kurzer Beschreibungstext
- optional kleines Label `Platzhalter`, wenn kein echtes Bild vorhanden ist

### Reihenfolge und Inhalte

1. Typhoon – Gesang  
   Text: Frontmann, türkischsprachige Texte und direkte Energie im Zentrum der Band.

2. Mika – Posaune  
   Text: Junger Posaunen-Sound, rauer Live-Charakter und warme Brass-Linien.

3. Schack – Saxophon  
   Text: Erfahrung, warme Linien und ein souliger Ton für die Bläsersektion.

4. Hardy – Trompete  
   Text: Markante Brass-Stimme zwischen Funk, Bluesrock und Bühnen-Druck.

5. Stefan – Funk-Bass  
   Text: Groovendes Fundament, präziser Druck und warme Tiefe.

6. Tom – Schlagzeug  
   Text: Treibender Puls, Live-Energie und rhythmische Stabilität.

7. Buğra – Gitarre  
   Text: Gitarrenlinien mit türkischer Prägung, Groove und melodischer Spannung.

8. Jürgen – Gitarre  
   Text: Gitarrensound zwischen Rhythmus, Wärme und rockiger Kante.

### Wichtige Korrekturen

Nicht verwenden:
- Taifun
- Daniel
- Jürgen als Saxophonist

Richtig:
- Typhoon = Gesang
- Schack = Saxophon
- Jürgen = Gitarre

---

## 6. Demo-Player

### Soll

Die Demo-Player müssen wie `player-example.png` wirken.

### Aktueller Fehler

Aktuell wie `player-aktuell.png`:
- zu billig
- zu leer
- schlechte Button-Optik
- Waveform zu klein/isoliert
- Layout wirkt wie Liste, nicht wie Premium-Audio-Modul
- teilweise Overflow nach rechts

### Ziel

Der Player muss hochwertig, modern und musikalisch wirken.

### Für den Header-Feature-Player

Der Header-Feature-Player ist grundsätzlich gut, aber:
- Button-Styling modernisieren
- Controls hochwertiger machen
- Waveform stärker integrieren
- keine billig wirkenden Icon-Buttons
- Play-Button sauber rund, gold/champagne, subtiler Schatten
- Controls optisch näher an `player-example.png`

### Für Demo-Liste

Jeder Demo-Row-Player soll:
- volle Card-Breite kontrolliert nutzen
- nicht aus dem Viewport laufen
- links Nummer
- moderner runder Play-Button
- Songtitel
- sichtbare Waveform im Card-Kontext
- bei Bedarf Zeit/Duration
- moderne Icons
- keine nativen Audio-Controls
- kein Download-Button
- keine billigen Standard-Buttons

### Waveform

Beibehalten:
- alte Audio-/Waveform-Funktion
- AudioPlayerProvider
- ein Song gleichzeitig
- Live-Waveform/Analyser
- Idle-Waveform
- Fortschrittsfärbung

Aber:
- optische Darstellung muss wie Design aussehen
- auf Mobile responsive verkleinern
- Bar-Anzahl bei kleinen Breiten reduzieren
- Container `min-width: 0`
- `overflow: hidden`
- kein horizontaler Overflow

---

## 7. Buttons allgemein

### Problem

Buttons wirken noch altbacken.

### Ziel

Alle Buttons müssen moderner, ruhiger und hochwertiger aussehen.

### Regeln

- keine billigen Verläufe
- keine harten Schatten
- kein Plastik-Look
- keine altmodischen dicken Rahmen
- subtiler Gold-/Champagne-Look
- klare Hover-/Active-States
- moderne Icons
- konsistente Höhe, Radius und Innenabstände
- Desktop und Mobile konsistent

### Button-Typen

Primary:
- Gold/Champagne Fill
- dunkler Text
- subtiler innerer Highlight
- weicher Schatten, kein Glow

Secondary:
- dunkler Hintergrund
- feine goldene Kontur
- warmes Textweiß
- dezenter Hover

Icon Buttons:
- rund
- klar
- hochwertiger Gold-Kreis
- Icon optisch zentriert

---

## 8. Sprachen

### Fehlt aktuell

DE / EN / TR Umschaltung fehlt.

### Ziel

- Header enthält Sprachumschalter: DE / EN / TR
- Die Routen `/de`, `/en`, `/tr` bleiben bestehen
- Wenn Übersetzungen noch nicht final sind, darf EN/TR vorerst deutsche Inhalte oder vorbereitete Fallback-Dictionaries nutzen
- Sprachumschalter muss funktionieren und zur entsprechenden Locale wechseln
- Optisch klein, hochwertig, nicht störend

---

## 9. Alte Website-Funktionen und Inhalte

Claude Code muss fehlende Inhalte aus den Docs übernehmen.

Pflicht:
- Hero
- Feature-Demo
- Termine
- Bandinfo im neuen Stil
- Bandmitglieder mit Text
- alle 6 Demos
- Media/Galerie mit 8 Bildern
- Booking-Formular
- Kontaktinfos
- Footer
- Legal Pages
- Sprachrouten DE/EN/TR
- Supabase/Resend-Grundlage bleibt erhalten

Nicht in diesem Batch:
- vollständiges Admin CRUD
- Shop
- Analytics
- externe Embeds

---

## 10. Legal Pages

Impressum, Datenschutz und Cookies müssen:
- optisch zur Website passen
- nicht wie Plain-Text-Seiten wirken
- Inhalt der alten Vorgaben enthalten
- initialer Entwurf bleiben, keine finale Rechtsberatung behaupten

Impressum:
Mika Hertler  
Am Schwarzen Steg 5a  
95448 Bayreuth  
Deutschland  
info@typhoon.band  
+49 176 64472296

---

## 11. Bilder für Claude Code anhängen

Claude Code soll diese Referenzbilder bekommen:

### Soll-Referenzen
- `desktop-soll.png`
- `desktop-2-soll.png`
- `band-info-example.png`
- `band-card-example.png`
- `player-example.png`

### Negative Beispiele / aktueller Fehlerstand
- `band-info-aktuell.png`
- `band-card-aktuell.png`
- `player-aktuell.png`

Optional zusätzlich:
- aktuelle Mobile-Screenshots aus Vercel, falls Claude Code visuell prüfen soll, warum Mobile verschoben ist.

## Wichtige Bild-Regel

Die Sollbilder sind Zielreferenzen.  
Die Aktuell-Bilder sind Negativbeispiele und dürfen nicht kopiert werden.

---

## Kompakter Prompt für Claude Code

```text
Read CLAUDE.md, docs/current-task.md and docs/typhoon-design-fix-v5.md.

Do a focused responsive design correction batch only.

Use the attached images as follows:
Target references:
- desktop-soll.png
- desktop-2-soll.png
- band-info-example.png
- band-card-example.png
- player-example.png

Negative/current examples:
- band-info-aktuell.png
- band-card-aktuell.png
- player-aktuell.png

Fix the site so the mobile layout behaves like a responsive version of the desktop design, not like a separate broken layout.

Required:
1. Add compact Termine section directly under the featured demo player.
2. Fix mobile layout: no shifted elements, no horizontal overflow, same design logic as desktop.
3. Rebuild Bandinfo section like band-info-example.
4. Rebuild Band-Cards like band-card-example, with image/name/instrument/short text for all 8 musicians.
5. Restyle demo players like player-example; keep Claude Design layout and old Waveform/Audio behavior.
6. Modernize all buttons site-wide.
7. Add DE / EN / TR language switch in the header and wire locale navigation.
8. Preserve all existing correct content, assets, audio behavior, Supabase/Resend foundation and legal pages.

Do not build full Admin CRUD, shop, analytics or external embeds.

Run npm run lint and npm run build, fix errors, then summarize:
- responsive/mobile fixes
- Termine placement
- Bandinfo changes
- Band-Card changes
- Demo-player/button changes
- language switch
- files changed
- lint/build result
```
