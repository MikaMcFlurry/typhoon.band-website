# 02 – Design Handoff Instructions

## Source of truth

The Claude Design handoff files are the visual source of truth:
- desktop HTML
- mobile HTML
- handoff / transfer protocol

Claude Code must inspect and translate them into Next.js components.

## Do not

- Do not treat the handoff as loose inspiration.
- Do not invent a new look.
- Do not copy old failed designs.
- Do not create generic cards/buttons.
- Do not change the approved visual hierarchy.

## Must preserve from handoff

- header position and feel
- desktop hero layout
- mobile hero layout
- button style
- panel/module styling
- spacing rhythm
- typography feeling
- dark/sepia/gold atmosphere
- compact onepager rhythm
- demo-player layout, size and style

## Public page structure

Primary public page is a onepager:

```text
/de
```

Root `/` redirects to `/de`.

Prepared locales:
```text
/de
/en
/tr
```

Use German as primary. English/Turkish can be prepared with simple dictionary placeholders if needed.

## Navigation

Header navigation must use anchors on the onepager:

```text
#home
#band
#music
#shows
#media
#booking
#contact
```

Legal pages remain separate.

## Legal routes

```text
/de/legal/imprint
/de/legal/privacy
/de/legal/cookies
```

## Onepager compaction

The onepager must not become exhausting.

Use compact/reveal behavior:
- Band intro short first, longer text behind “Mehr über Typhoon”
- Members: preview first 4, reveal all 8
- Demos: featured + first 3, reveal all 6
- Shows: compact TBA/upcoming module
- Booking/contact visible directly, not hidden

## Visual colors

Use design handoff colors first. If missing, use:

```text
Deep black: #030201
Brown black: #060403
Warm dark brown: #100a06
Panel black: #0b0805
Dark bronze: #6f4a1f
Deep gold: #b8873b
Antique gold: #c79a4b
Champagne gold: #e8c982
Warm cream: #f2e6cf
Muted text: #b9aa90
```

Gold must be antique/champagne, not yellow.
