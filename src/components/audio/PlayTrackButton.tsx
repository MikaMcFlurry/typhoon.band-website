"use client";

import { useAudioPlayer } from "@/components/audio/AudioPlayerProvider";
import { useDict } from "@/components/i18n/DictProvider";
import { Icon } from "@/components/ui/Icon";
import { fill } from "@/i18n/dictionaries";

// Gold CTA that starts (or pauses) a specific track, used in the hero.
export function PlayTrackButton({
  id,
  src,
  title,
  className = "",
}: {
  id: string;
  src: string;
  title: string;
  className?: string;
}) {
  const { dict } = useDict();
  const { currentId, isPlaying, toggle } = useAudioPlayer();
  const playing = currentId === id && isPlaying;
  return (
    <button
      aria-pressed={playing}
      className={`btn btn-primary ${className}`}
      onClick={() => toggle(id, src)}
      type="button"
    >
      <Icon name={playing ? "pause" : "play"} size={18} />
      {playing ? dict.player.pause : fill(dict.hero.playFeatured, { title })}
    </button>
  );
}
