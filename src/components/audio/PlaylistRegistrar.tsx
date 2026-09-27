"use client";

import { useEffect } from "react";
import { type Track, useAudioPlayer } from "@/components/audio/AudioPlayerProvider";

// Tells the AudioPlayerProvider which tracks form the playlist so next(),
// previous(), auto-advance, the dock and the Media Session know what to play.
export function PlaylistRegistrar({ playlist }: { playlist: Track[] }) {
  const { setPlaylist } = useAudioPlayer();
  useEffect(() => {
    setPlaylist(playlist);
  }, [playlist, setPlaylist]);
  return null;
}
