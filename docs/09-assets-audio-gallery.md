# 09 – Assets, Audio and Gallery

## Reference assets

Expected:

```text
/public/assets/reference/typhoon-band-hero-new.jpeg
/public/assets/reference/typhoon-logo.svg
/public/assets/reference/member-typhoon-singer.png
/public/assets/reference/member-mika-posaune.jpg
```

## Newly uploaded gallery and band-card assets

The user has uploaded:
- gallery assets
- band info card assets for Mika
- band info card assets for Typhoon

Claude Code must inspect the repository and use the uploaded files as the first real media assets.

Recommended organization:

```text
/public/assets/gallery/
/public/assets/band-cards/
```

If files are uploaded elsewhere, move/copy them into a clean structure if safe, and document the final paths in README.

## First-use rules

Gallery:
- use uploaded gallery assets in the first gallery/media teaser section
- keep it compact
- do not create a huge gallery page yet unless the design handoff requires it
- use alt text
- optimize display with responsive image sizing

Band info cards:
- use Typhoon asset for Typhoon/Gesang card
- use Mika asset for Mika/Posaune card
- other members can use premium placeholders until real images exist
- do not invent wrong member photos
- do not show ugly placeholder badges

## Demo audio folder

```text
/public/assets/audio/demos/
```

Expected files:

```text
sen-benim.mp3
karanfill.mp3
gece-yine-dustun.mp3
farksilin.mp3
cilgin.mp3
bir-tek-sen.mp3
```

Expected public paths:

```text
/assets/audio/demos/sen-benim.mp3
/assets/audio/demos/karanfill.mp3
/assets/audio/demos/gece-yine-dustun.mp3
/assets/audio/demos/farksilin.mp3
/assets/audio/demos/cilgin.mp3
/assets/audio/demos/bir-tek-sen.mp3
```

## Audio player visual vs behavior source of truth

Visual source:
- Claude Design handoff

Behavior source:
- old Claude branch waveform/audio logic

Important:
The player must keep the Claude Design size, layout and styling.
Only waveform/audio behavior should be copied/recreated from the old Claude branch.

## Required audio behavior

Must have:
- local MP3 playback
- shared provider with one active audio element
- one song plays at a time
- custom play/pause UI matching Claude Design
- Web Audio API analyser
- live waveform / visualizer bars inside Claude Design layout
- deterministic idle waveform bars per song
- progress-colored waveform bars
- current time / duration if present in handoff
- seek support if present/fitting in handoff
- no download button
- no external player/embed
- no native browser audio controls
- accessible controls
- works on mobile/desktop
- graceful missing file state
