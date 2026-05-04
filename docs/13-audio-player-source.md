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
- connect `MediaElementAudioSourceNode` to `AnalyserNode`
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
