// Fills in missing song durations on the server, so the browser never has
// to download audio just to print "5:35" next to a title.
//
// Uploaded files (Supabase Storage) get unique names, so a duration read
// once can be cached for a long time. Failures are not cached (the cached
// function throws) and simply leave the duration empty; the player shows
// the real value as soon as the song is loaded.

import { unstable_cache } from "next/cache";
import { fetchMp3Duration } from "@/lib/audio/mp3-duration";
import type { SongItem } from "./types";

const cachedDuration = unstable_cache(
  async (url: string) => {
    const d = await fetchMp3Duration(url);
    if (d == null) throw new Error("duration unavailable");
    return d;
  },
  ["mp3-duration-v1"],
  { revalidate: 60 * 60 * 24 * 30 },
);

// Only our own Supabase Storage is fetched server-side (no arbitrary URLs).
function isStorageUrl(url: string) {
  try {
    const base = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    const u = new URL(url);
    return u.protocol === "https:" && u.origin === base.origin && u.pathname.startsWith("/storage/v1/object/public/");
  } catch {
    return false;
  }
}

async function durationFor(url: string): Promise<number | null> {
  if (!isStorageUrl(url)) return null;
  try {
    return await cachedDuration(url);
  } catch {
    return null;
  }
}

export async function withDurations(songs: SongItem[]): Promise<SongItem[]> {
  return Promise.all(
    songs.map(async (s) =>
      s.durationSeconds != null ? s : { ...s, durationSeconds: await durationFor(s.audioUrl) },
    ),
  );
}
