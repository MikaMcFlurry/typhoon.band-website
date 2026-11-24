"use client";

// Global audio engine. Behaviour contract (ported from the old Claude branch
// `claude/typhoon-premium-redesign-x01JL`, see docs/13-audio-player-source.md):
//   - one shared HTMLAudioElement → only one song plays at a time
//   - Web Audio AnalyserNode (fftSize 256, smoothing 0.78) for live waveforms,
//     best-effort: playback never depends on it
//   - crossOrigin="anonymous" before any src so the analyser tap on
//     Supabase-hosted MP3s is not CORS-tainted
//   - auto-advance to the next playlist entry on `ended`
//   - previous() restarts the track when >3s in, otherwise skips back
//
// Audio path (fix 2026-11): the <audio> element ALWAYS plays natively. The
// analyser only listens to a copy of the signal taken with captureStream()
// and is never in the audible path. The old createMediaElementSource()
// routing pushed playback through Web Audio's resampler; WebKit (Safari and
// every iOS browser) then audibly sped demos up and slowed them down when
// the file and device sample rates differ (WebKit bug 239696), and degraded
// the sound on iOS. Browsers without a non-invasive tap (Safari: no
// captureStream; Firefox: capturing moves playback onto its media graph)
// get no analyser — the waveform then shows its idle shape plus progress,
// exactly like the reduced-motion state.
//
// Redesign changes:
//   - playback state and time state live in two contexts, so the 4 Hz
//     `timeupdate` stream only re-renders components that show progress
//   - tracks carry title/cover so the persistent dock + Media Session API
//     (lock screen / hardware keys) can show what is playing
//   - explicit loading + error flags for UI feedback, and stop()

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Track = {
  id: string;
  src: string;
  title: string;
  cover?: string | null;
};

/** @deprecated kept for older call sites — use Track. */
export type PlaylistEntry = Pick<Track, "id" | "src"> & Partial<Track>;

type PlaybackState = {
  currentId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  duration: number;
  volume: number; // 0..1
  muted: boolean;
};

type TimeState = {
  position: number;
  progress: number; // 0..1
};

type PlaybackContextValue = PlaybackState & {
  currentTrack: Track | null;
  playlist: Track[];
  toggle: (id: string, src?: string | null) => void;
  seek: (id: string, ratio: number) => void;
  seekBy: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setPlaylist: (list: PlaylistEntry[]) => void;
  next: () => void;
  previous: () => void;
  stop: () => void;
  getAnalyser: () => AnalyserNode | null;
};

const PlaybackCtx = createContext<PlaybackContextValue | null>(null);
const TimeCtx = createContext<TimeState>({ position: 0, progress: 0 });

const initialPlayback: PlaybackState = {
  currentId: null,
  isPlaying: false,
  isLoading: false,
  hasError: false,
  duration: 0,
  volume: 1,
  muted: false,
};

const FFT_SIZE = 256;
const ARTIST = "Typhoon";

type CapturableAudio = HTMLAudioElement & {
  captureStream?: () => MediaStream;
  mozCaptureStream?: () => MediaStream;
};

/** The tap currently feeding the analyser (one captured audio track). */
type AnalyserTap = { trackId: string; node: MediaStreamAudioSourceNode };

function toTrack(entry: PlaylistEntry): Track {
  return {
    id: entry.id,
    src: entry.src,
    title: entry.title ?? entry.id,
    cover: entry.cover ?? null,
  };
}

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const captureRef = useRef<MediaStream | null>(null);
  const tapRef = useRef<AnalyserTap | null>(null);
  const playlistRef = useRef<Track[]>([]);
  const currentIdRef = useRef<string | null>(null);
  const [playlist, setPlaylistState] = useState<Track[]>([]);
  const [playback, setPlayback] = useState<PlaybackState>(initialPlayback);
  const [time, setTime] = useState<TimeState>({ position: 0, progress: 0 });

  const ensureAudio = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const el = new Audio();
      // Must be set before any src (see header comment).
      el.crossOrigin = "anonymous";
      el.preload = "metadata";
      audioRef.current = el;
    }
    return audioRef.current;
  }, []);

  // Point the analyser at the captured stream's newest audio track. Every
  // new `src` adds a new captured track (Chromium keeps the previous one
  // "live" but silent), so this re-runs on `addtrack` and on every
  // `playing`, and retires the older tracks.
  const syncTap = useCallback(() => {
    const ac = audioCtxRef.current;
    const analyser = analyserRef.current;
    const stream = captureRef.current;
    if (!ac || !analyser || !stream) return;
    const live = stream.getAudioTracks().filter((t) => t.readyState === "live");
    const track = live[live.length - 1];
    if (!track || tapRef.current?.trackId === track.id) return;
    try {
      tapRef.current?.node.disconnect();
    } catch {}
    tapRef.current = null;
    try {
      const node = ac.createMediaStreamSource(new MediaStream([track]));
      node.connect(analyser);
      tapRef.current = { trackId: track.id, node };
    } catch {
      // No tap → idle waveform. Playback is unaffected either way.
    }
    for (const old of live) {
      if (old === track) continue;
      try {
        stream.removeTrack(old);
        old.stop();
      } catch {}
    }
  }, []);

  // The analyser graph is decoration only: it runs exactly while the
  // element plays. Re-checking after each resume/suspend settles covers a
  // pause that lands mid-resume (double tap) and a play() that fails.
  const syncAnalyserClock = useCallback(() => {
    const ac = audioCtxRef.current;
    if (!ac || ac.state === "closed") return;
    const playing = () => Boolean(audioRef.current && !audioRef.current.paused);
    const settle = () => {
      if (ac.state === "closed") return;
      if (playing() !== (ac.state === "running")) syncAnalyserClock();
    };
    if (playing() && ac.state === "suspended") {
      ac.resume().then(settle, () => {});
    } else if (!playing() && ac.state === "running") {
      ac.suspend().then(settle, () => {});
    }
  }, []);

  const ensureAnalyser = useCallback(() => {
    if (typeof window === "undefined") return null;
    const el = audioRef.current as CapturableAudio | null;
    if (!el) return null;
    if (analyserRef.current) return analyserRef.current;
    // Only a spec-style, non-invasive capture is acceptable (see header):
    // Safari has no captureStream, and Firefox (mozCaptureStream) reroutes
    // playback when capturing — both keep plain native playback.
    if (typeof el.captureStream !== "function" || "mozCaptureStream" in el) {
      return null;
    }
    const w = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return null;
    let ac: AudioContext | null = null;
    let stream: MediaStream | null = null;
    try {
      stream = el.captureStream();
      ac = new Ctor();
      const analyser = ac.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.78;
      // A muted sink keeps the analyser pulled by the graph on every
      // engine without making the copy audible (the element is the
      // only thing anyone hears).
      const silent = ac.createGain();
      silent.gain.value = 0;
      analyser.connect(silent);
      silent.connect(ac.destination);
      stream.addEventListener("addtrack", () => syncTap());
      captureRef.current = stream;
      audioCtxRef.current = ac;
      analyserRef.current = analyser;
      syncTap();
      return analyser;
    } catch {
      stream?.getTracks().forEach((t) => t.stop());
      ac?.close().catch(() => {});
      return null;
    }
  }, [syncTap]);

  const findTrack = useCallback(
    (id: string | null) =>
      id ? playlistRef.current.find((t) => t.id === id) ?? null : null,
    [],
  );

  // Declared via ref so `attachListeners` can recurse into auto-advance
  // without a stale closure.
  const loadAndPlayRef = useRef<(track: Pick<Track, "id" | "src">) => void>(
    () => {},
  );

  const attachListeners = useCallback(
    (id: string, el: HTMLAudioElement) => {
      el.ontimeupdate = () => {
        const dur = el.duration || 0;
        setTime({
          position: el.currentTime,
          progress: dur > 0 ? el.currentTime / dur : 0,
        });
      };
      el.onplay = () => {
        // Also covers play() from the lock screen / media keys.
        syncAnalyserClock();
        setPlayback((s) => ({ ...s, currentId: id, isPlaying: true, hasError: false }));
      };
      el.onplaying = () => {
        syncTap();
        setPlayback((s) => ({ ...s, isLoading: false }));
      };
      el.onwaiting = () => setPlayback((s) => ({ ...s, isLoading: true }));
      el.oncanplay = () => setPlayback((s) => ({ ...s, isLoading: false }));
      el.onpause = () => {
        syncAnalyserClock();
        setPlayback((s) => ({ ...s, isPlaying: false }));
      };
      el.onended = () => {
        const list = playlistRef.current;
        const idx = list.findIndex((p) => p.id === id);
        const nextEntry = idx >= 0 ? list[idx + 1] : null;
        if (nextEntry) {
          loadAndPlayRef.current(nextEntry);
        } else {
          setPlayback((s) => ({ ...s, isPlaying: false }));
          setTime({ position: 0, progress: 0 });
        }
      };
      el.onerror = () => {
        setPlayback((s) => ({
          ...s,
          isPlaying: false,
          isLoading: false,
          hasError: true,
        }));
      };
      el.onloadedmetadata = () =>
        setPlayback((s) => ({ ...s, currentId: id, duration: el.duration || 0 }));
      el.onvolumechange = () =>
        setPlayback((s) => ({ ...s, volume: el.volume, muted: el.muted }));
    },
    [syncAnalyserClock, syncTap],
  );

  const loadAndPlay = useCallback(
    (track: Pick<Track, "id" | "src">) => {
      const el = ensureAudio();
      if (!el || !track.src) return;
      try {
        el.pause();
      } catch {}
      // Re-affirm crossOrigin before each src change.
      el.crossOrigin = "anonymous";
      el.src = track.src;
      currentIdRef.current = track.id;
      attachListeners(track.id, el);
      setPlayback((s) => ({
        ...s,
        currentId: track.id,
        isPlaying: false,
        isLoading: true,
        hasError: false,
        duration: 0,
      }));
      setTime({ position: 0, progress: 0 });
      ensureAnalyser();
      const p = el.play();
      if (p && typeof p.catch === "function") {
        p.catch((err: unknown) => {
          // AbortError = superseded by another play() — not a failure.
          if (err instanceof DOMException && err.name === "AbortError") return;
          syncAnalyserClock();
          setPlayback((s) => ({ ...s, isPlaying: false, isLoading: false }));
        });
      }
    },
    [attachListeners, ensureAnalyser, ensureAudio, syncAnalyserClock],
  );
  loadAndPlayRef.current = loadAndPlay;

  const toggle = useCallback(
    (id: string, src?: string | null) => {
      const resolved = src ?? findTrack(id)?.src;
      if (!resolved) return;
      const el = ensureAudio();
      if (!el) return;
      if (currentIdRef.current === id) {
        if (!el.paused) {
          el.pause();
          return;
        }
        ensureAnalyser();
        el.play().catch(() => {
          syncAnalyserClock();
          setPlayback((s) => ({ ...s, isPlaying: false, isLoading: false }));
        });
        return;
      }
      loadAndPlay({ id, src: resolved });
    },
    [ensureAnalyser, ensureAudio, findTrack, loadAndPlay, syncAnalyserClock],
  );

  const seek = useCallback((id: string, ratio: number) => {
    const el = audioRef.current;
    if (!el || currentIdRef.current !== id) return;
    if (!el.duration || !isFinite(el.duration)) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    el.currentTime = clamped * el.duration;
    setTime({ position: el.currentTime, progress: clamped });
  }, []);

  const seekBy = useCallback((seconds: number) => {
    const el = audioRef.current;
    if (!el || !el.duration || !isFinite(el.duration)) return;
    el.currentTime = Math.max(0, Math.min(el.duration, el.currentTime + seconds));
  }, []);

  const setVolume = useCallback(
    (v: number) => {
      const el = audioRef.current ?? ensureAudio();
      if (!el) return;
      const clamped = Math.max(0, Math.min(1, v));
      el.volume = clamped;
      if (clamped > 0 && el.muted) el.muted = false;
      setPlayback((s) => ({ ...s, volume: clamped, muted: el.muted }));
    },
    [ensureAudio],
  );

  const toggleMute = useCallback(() => {
    const el = audioRef.current ?? ensureAudio();
    if (!el) return;
    el.muted = !el.muted;
    setPlayback((s) => ({ ...s, muted: el.muted }));
  }, [ensureAudio]);

  const setPlaylist = useCallback((list: PlaylistEntry[]) => {
    const tracks = list.map(toTrack);
    playlistRef.current = tracks;
    setPlaylistState(tracks);
  }, []);

  const skipBy = useCallback(
    (delta: number) => {
      const list = playlistRef.current;
      if (list.length === 0) return;
      const id = currentIdRef.current;
      const idx = id ? list.findIndex((p) => p.id === id) : -1;
      const nextIdx =
        idx === -1
          ? delta > 0
            ? 0
            : list.length - 1
          : (idx + delta + list.length) % list.length;
      const target = list[nextIdx];
      if (target) loadAndPlay(target);
    },
    [loadAndPlay],
  );

  const next = useCallback(() => skipBy(1), [skipBy]);
  const previous = useCallback(() => {
    const el = audioRef.current;
    if (el && el.currentTime > 3) {
      el.currentTime = 0;
      return;
    }
    skipBy(-1);
  }, [skipBy]);

  const stop = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    currentIdRef.current = null;
    setPlayback((s) => ({ ...initialPlayback, volume: s.volume, muted: s.muted }));
    setTime({ position: 0, progress: 0 });
  }, []);

  const getAnalyser = useCallback(() => analyserRef.current, []);

  const currentTrack = useMemo(
    () =>
      playback.currentId
        ? playlist.find((t) => t.id === playback.currentId) ?? null
        : null,
    [playlist, playback.currentId],
  );

  // Media Session: lock-screen metadata and hardware media keys.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    if (!currentTrack) {
      ms.metadata = null;
      return;
    }
    try {
      const artwork = currentTrack.cover
        ? [{ src: new URL(currentTrack.cover, window.location.href).toString(), sizes: "512x512" }]
        : [];
      ms.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: ARTIST,
        album: "Demos",
        artwork,
      });
    } catch {
      // MediaMetadata unsupported — ignore.
    }
  }, [currentTrack]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = playback.isPlaying ? "playing" : "paused";
  }, [playback.isPlaying]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ["play", () => audioRef.current?.play().catch(() => {})],
      ["pause", () => audioRef.current?.pause()],
      ["previoustrack", () => previous()],
      ["nexttrack", () => next()],
      ["seekbackward", () => seekBy(-10)],
      ["seekforward", () => seekBy(10)],
      [
        "seekto",
        (details) => {
          const el = audioRef.current;
          if (el && typeof details.seekTime === "number") el.currentTime = details.seekTime;
        },
      ],
    ];
    for (const [action, handler] of handlers) {
      try {
        ms.setActionHandler(action, handler);
      } catch {
        // action not supported by this browser
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          ms.setActionHandler(action, null);
        } catch {}
      }
    };
  }, [next, previous, seekBy]);

  // Release the audio graph on unmount.
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      captureRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  const value = useMemo<PlaybackContextValue>(
    () => ({
      ...playback,
      currentTrack,
      playlist,
      toggle,
      seek,
      seekBy,
      setVolume,
      toggleMute,
      setPlaylist,
      next,
      previous,
      stop,
      getAnalyser,
    }),
    [
      playback,
      currentTrack,
      playlist,
      toggle,
      seek,
      seekBy,
      setVolume,
      toggleMute,
      setPlaylist,
      next,
      previous,
      stop,
      getAnalyser,
    ],
  );

  return (
    <PlaybackCtx.Provider value={value}>
      <TimeCtx.Provider value={time}>{children}</TimeCtx.Provider>
    </PlaybackCtx.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(PlaybackCtx);
  if (!ctx) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return ctx;
}

/** Subscribe to playback position. Only components that render time should use this. */
export function useAudioTime() {
  return useContext(TimeCtx);
}

export function formatTime(seconds: number | null | undefined) {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
