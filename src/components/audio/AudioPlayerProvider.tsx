"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

export type PlaylistEntry = { id: string; src: string };

type AudioState = {
  currentId: string | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  position: number;
  volume: number; // 0..1
  muted: boolean;
};

type AudioContextValue = AudioState & {
  toggle: (id: string, src: string | null | undefined) => void;
  seek: (id: string, ratio: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setPlaylist: (list: PlaylistEntry[]) => void;
  next: () => void;
  previous: () => void;
  getAnalyser: () => AnalyserNode | null;
};

const AudioCtx = createContext<AudioContextValue | null>(null);

const initialState: AudioState = {
  currentId: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  position: 0,
  volume: 1,
  muted: false,
};

const FFT_SIZE = 256;

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const playlistRef = useRef<PlaylistEntry[]>([]);
  const [state, setState] = useState<AudioState>(initialState);

  const ensureAudio = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = "metadata";
      audioRef.current = el;
    }
    return audioRef.current;
  }, []);

  const ensureAnalyser = useCallback(() => {
    if (typeof window === "undefined") return null;
    const el = audioRef.current;
    if (!el) return null;
    if (analyserRef.current) {
      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
      return analyserRef.current;
    }
    const w = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return null;
    try {
      const ac = new Ctor();
      const src = ac.createMediaElementSource(el);
      const analyser = ac.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.78;
      src.connect(analyser);
      analyser.connect(ac.destination);
      audioCtxRef.current = ac;
      sourceRef.current = src;
      analyserRef.current = analyser;
      return analyser;
    } catch {
      return null;
    }
  }, []);

  const attachListeners = useCallback((id: string, el: HTMLAudioElement) => {
    el.ontimeupdate = () => {
      const dur = el.duration || 0;
      setState((s) => ({
        ...s,
        currentId: id,
        position: el.currentTime,
        duration: dur,
        progress: dur > 0 ? el.currentTime / dur : 0,
      }));
    };
    el.onplay = () => setState((s) => ({ ...s, currentId: id, isPlaying: true }));
    el.onpause = () => setState((s) => ({ ...s, isPlaying: false }));
    el.onended = () => {
      // Auto-advance to the next track in the playlist if registered.
      const list = playlistRef.current;
      const idx = list.findIndex((p) => p.id === id);
      const nextEntry = idx >= 0 ? list[idx + 1] : null;
      if (nextEntry) {
        const next = nextEntry;
        const a = audioRef.current;
        if (!a) return;
        a.src = next.src;
        attachListeners(next.id, a);
        setState((s) => ({ ...s, currentId: next.id, position: 0, progress: 0 }));
        a.play().catch(() => setState({ ...initialState }));
      } else {
        setState((s) => ({ ...s, isPlaying: false, position: 0, progress: 0 }));
      }
    };
    el.onerror = () => setState({ ...initialState });
    el.onloadedmetadata = () => {
      setState((s) => ({ ...s, currentId: id, duration: el.duration || 0 }));
    };
    el.onvolumechange = () =>
      setState((s) => ({ ...s, volume: el.volume, muted: el.muted }));
  }, []);

  const toggle = useCallback(
    (id: string, src: string | null | undefined) => {
      if (!src) return;
      const el = ensureAudio();
      if (!el) return;
      const sameTrack = state.currentId === id;
      if (sameTrack && !el.paused) {
        el.pause();
        return;
      }
      if (!sameTrack) {
        try {
          el.pause();
        } catch {}
        el.src = src;
        attachListeners(id, el);
        setState({ ...initialState, currentId: id, volume: el.volume, muted: el.muted });
      }
      ensureAnalyser();
      const playPromise = el.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {
          setState({ ...initialState });
        });
      }
    },
    [attachListeners, ensureAnalyser, ensureAudio, state.currentId],
  );

  const seek = useCallback(
    (id: string, ratio: number) => {
      const el = audioRef.current;
      if (!el) return;
      if (state.currentId !== id) return;
      if (!el.duration || !isFinite(el.duration)) return;
      const clamped = Math.max(0, Math.min(1, ratio));
      el.currentTime = clamped * el.duration;
    },
    [state.currentId],
  );

  const setVolume = useCallback((v: number) => {
    const el = audioRef.current ?? ensureAudio();
    if (!el) return;
    const clamped = Math.max(0, Math.min(1, v));
    el.volume = clamped;
    if (clamped > 0 && el.muted) el.muted = false;
    setState((s) => ({ ...s, volume: clamped, muted: el.muted }));
  }, [ensureAudio]);

  const toggleMute = useCallback(() => {
    const el = audioRef.current ?? ensureAudio();
    if (!el) return;
    el.muted = !el.muted;
    setState((s) => ({ ...s, muted: el.muted }));
  }, [ensureAudio]);

  const setPlaylist = useCallback((list: PlaylistEntry[]) => {
    playlistRef.current = list;
  }, []);

  const skipBy = useCallback(
    (delta: number) => {
      const list = playlistRef.current;
      if (list.length === 0) return;
      const id = state.currentId;
      const idx = id ? list.findIndex((p) => p.id === id) : -1;
      // No current track → start at first/last.
      const nextIdx =
        idx === -1
          ? delta > 0
            ? 0
            : list.length - 1
          : (idx + delta + list.length) % list.length;
      const target = list[nextIdx];
      if (!target) return;
      toggle(target.id, target.src);
    },
    [state.currentId, toggle],
  );

  const next = useCallback(() => skipBy(1), [skipBy]);
  const previous = useCallback(() => {
    // Match common audio-player UX: if more than 3s into the track, restart it
    // first; otherwise jump to the previous track.
    const el = audioRef.current;
    if (el && el.currentTime > 3) {
      el.currentTime = 0;
      return;
    }
    skipBy(-1);
  }, [skipBy]);

  const getAnalyser = useCallback(() => analyserRef.current, []);

  const value = useMemo<AudioContextValue>(
    () => ({
      ...state,
      toggle,
      seek,
      setVolume,
      toggleMute,
      setPlaylist,
      next,
      previous,
      getAnalyser,
    }),
    [state, toggle, seek, setVolume, toggleMute, setPlaylist, next, previous, getAnalyser],
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useAudioPlayer() {
  const ctx = useContext(AudioCtx);
  if (!ctx) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return ctx;
}

export function formatTime(seconds: number) {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
