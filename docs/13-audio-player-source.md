# 13 – Audio Player Source Implementation

## Absolute requirement

The demo player from the Claude Design handoff must keep its visual size, layout, spacing and styling.

Only the waveform/audio behavior from the old Claude branch should be reused/recreated.

## Visual source of truth

Claude Design handoff controls:
- player size
- card/container shape
- typography
- play button placement
- waveform placement
- spacing
- responsive behavior
- colors and borders

Do NOT copy the old player card layout if it conflicts with the Claude Design handoff.

## Behavior source of truth

Use this source implementation as behavior reference:

Repository:
```text
MikaMcFlurry/typhoon.band
```

Branch:
```text
claude/typhoon-premium-redesign-x01JL
```

Source behavior files:
```text
src/components/audio/AudioPlayerProvider.tsx
src/components/audio/Waveform.tsx
```

Functional reference only:
```text
src/components/ui/DemoPlayerCard.tsx
src/components/ui/FeaturedDemo.tsx
src/components/ui/HeroMusicPlayer.tsx
```

## What must be preserved from behavior

The new repository must copy or faithfully recreate:

- shared audio context/provider
- one song plays at a time
- real HTML audio playback
- Web Audio API analyser
- live waveform / visualizer bars
- deterministic idle waveform per song
- progress-based played/unplayed bar coloring
- seek support if visually supported by handoff
- current time / duration if visually supported by handoff
- graceful missing-audio state
- no download button
- no native browser audio controls
- no external player
- no Spotify/SoundCloud embed

## Required provider behavior

The provider must:
- own a single shared `HTMLAudioElement`
- keep `currentId`, `isPlaying`, `progress`, `duration`, `position`
- expose `toggle(id, src)`
- expose `seek(id, ratio)`
- expose `getAnalyser()`
- lazily create an `AudioContext`
- feed the `AnalyserNode` from a copy of the signal (`audio.captureStream()` →
  `MediaStreamAudioSourceNode`), never from `createMediaElementSource()`: the
  `<audio>` element must always play natively (see "Audio path" below)
- set `fftSize = 256`
- use analyser for live visualization
- pause previous track when another starts

## Required waveform behavior

The waveform must:
- accept `songId`
- support configurable number of bars
- support configurable height/className so it fits the Claude Design player
- create deterministic idle heights from song id
- animate with live FFT data when the song is playing
- show played bars in stronger gold/champagne
- show unplayed bars in muted gold
- smoothly return to idle state when paused

## Required files in the new repo

Create/recreate:

```text
src/components/audio/AudioPlayerProvider.tsx
src/components/audio/Waveform.tsx
```

Then integrate them into Claude Design-styled components, for example:

```text
src/components/ui/DesignDemoPlayer.tsx
src/components/ui/DesignFeaturedDemo.tsx
```

Names may differ, but the visual design must stay from Claude Design.

Wrap the locale layout or app root with:

```text
<AudioPlayerProvider>
  {children}
</AudioPlayerProvider>
```

## Important

The Claude Design handoff controls the visual layout.
The old Claude branch controls only the audio/waveform behavior.

Final player goal:
```text
Looks like Claude Design.
Behaves like old Claude branch.
```

## Audio path (fix 2026-11-24)

The original port routed playback through Web Audio
(`createMediaElementSource(el)` → analyser → `destination`). That put every
demo through the browser's Web Audio resampler. In WebKit (Safari and every
iOS browser) this makes playback audibly speed up and slow down when the file
and device sample rates differ (WebKit bug 239696) and degrades the sound on
iOS; owner report: "the demos sound strange and get slower and faster after
1–2 minutes". The files themselves were checked and have a steady tempo.

Rules since then:

- the `<audio>` element is the only audible path and is never connected to an
  `AudioContext`
- the analyser listens to `audio.captureStream()` through a
  `MediaStreamAudioSourceNode`, ending in a zero-gain node, and is re-pointed
  at the new captured track on every source change
- only browsers with a non-invasive, spec-style `captureStream()` get the live
  analyser (Chromium). Safari has none, and Firefox (`mozCaptureStream`)
  moves playback onto its media graph when capturing, so both get no
  analyser: the waveform shows the idle shape with progress colouring, like
  the reduced-motion state
- the analyser `AudioContext` is suspended while paused

