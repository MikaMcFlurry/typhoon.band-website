import { Setlist, type SetlistTrack } from "@/components/audio/Setlist";
import type { Dict } from "@/i18n/dictionaries";

// Right after the hero: the setlist taped to the floor, every demo one tap
// away, with the listening note and platform links beside it.

export function Music({
  dict,
  tracks,
  featuredId,
  platforms,
}: {
  dict: Dict;
  tracks: SetlistTrack[];
  featuredId: string | null;
  platforms?: React.ReactNode;
}) {
  if (tracks.length === 0) return null;
  return (
    <section aria-labelledby="music-title" className="block-y border-t border-rule" id="music">
      <div className="shell grid gap-x-12 gap-y-12 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5 lg:pt-4">
          <h2 className="h-stage reveal" id="music-title">
            {dict.music.title}
          </h2>
          <p className="copy-lg reveal mt-6">{dict.music.intro}</p>
          {platforms ? <div className="reveal mt-8">{platforms}</div> : null}
        </div>
        <div className="reveal lg:col-span-7 lg:rotate-[0.8deg]">
          <Setlist featuredId={featuredId} tracks={tracks} />
        </div>
      </div>
    </section>
  );
}
