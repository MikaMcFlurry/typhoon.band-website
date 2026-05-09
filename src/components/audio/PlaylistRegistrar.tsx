"use client";

import { useEffect } from "react";
import {
  type PlaylistEntry,
  useAudioPlayer,
} from "@/components/audio/AudioPlayerProvider";

// Tells the AudioPlayerProvider which tracks form the active playlist so
// `next()` / `previous()` know what to skip to. Mounted once per page.
export function PlaylistRegistrar({ playlist }: { playlist: PlaylistEntry[] }) {
  const { setPlaylist } = useAudioPlayer();
  useEffect(() => {
    setPlaylist(playlist);
  }, [playlist, setPlaylist]);
  return null;
}
