"use client";

import { useAudioPlayer } from "@/components/audio/AudioPlayerProvider";
import { useDict } from "@/components/i18n/DictProvider";
import { Icon } from "@/components/ui/Icon";
import { fill } from "@/i18n/dictionaries";

// Pink (audio) action that starts or pauses one specific track.
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
      className={`btn-play ${className}`}
      onClick={() => toggle(id, src)}
      type="button"
    >
      <Icon name={playing ? "pause" : "play"} size={20} />
      {playing ? dict.player.pause : fill(dict.hero.playFeatured, { title })}
    </button>
  );
}
