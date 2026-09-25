// Reads an MP3's duration from its first bytes (server-side only).
//
// The tracklist and the featured player show durations before anything is
// played. Probing that in the browser with a throwaway <audio> element made
// Chrome download ~100 KB per song on every visit, so the server reads a
// small byte range once instead and the result is cached (see
// src/lib/content/song-durations.ts).
//
// Supports ID3v2-tagged MPEG-1/2/2.5 Layer III files: VBR via the Xing/Info
// or VBRI header (frame count), CBR via file size / bitrate.

const BITRATES: Record<string, number[]> = {
  // kbps, index 0 = free, 15 = bad
  "1": [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
  "2": [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
};
const SAMPLE_RATES: Record<number, number[]> = {
  3: [44100, 48000, 32000], // MPEG-1
  2: [22050, 24000, 16000], // MPEG-2
  0: [11025, 12000, 8000], // MPEG-2.5
};

export type Mp3Probe = {
  /** Offset of the first MPEG frame (after an ID3v2 tag). */
  audioStart: number;
  duration: number | null;
};

export function id3v2Size(buf: Uint8Array): number {
  if (buf.length < 10 || buf[0] !== 0x49 || buf[1] !== 0x44 || buf[2] !== 0x33) return 0;
  const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
  const footer = buf[5] & 0x10 ? 10 : 0;
  return 10 + size + footer;
}

function readUInt32(buf: Uint8Array, at: number) {
  return ((buf[at] << 24) | (buf[at + 1] << 16) | (buf[at + 2] << 8) | buf[at + 3]) >>> 0;
}

/**
 * Parses the first Layer III frame found in `buf` (which starts at file
 * offset `bufOffset`) and returns the duration in seconds.
 */
export function durationFromFrames(buf: Uint8Array, bufOffset: number, totalSize: number | null): number | null {
  for (let i = 0; i + 4 <= buf.length; i++) {
    if (buf[i] !== 0xff || (buf[i + 1] & 0xe0) !== 0xe0) continue;
    const versionBits = (buf[i + 1] >> 3) & 0x03; // 3 = MPEG-1, 2 = MPEG-2, 0 = MPEG-2.5
    const layerBits = (buf[i + 1] >> 1) & 0x03; // 1 = Layer III
    const bitrateIndex = (buf[i + 2] >> 4) & 0x0f;
    const rateIndex = (buf[i + 2] >> 2) & 0x03;
    if (versionBits === 1 || layerBits !== 1 || bitrateIndex === 0 || bitrateIndex === 15 || rateIndex === 3) continue;
    const mpeg1 = versionBits === 3;
    const sampleRate = SAMPLE_RATES[versionBits][rateIndex];
    const bitrate = BITRATES[mpeg1 ? "1" : "2"][bitrateIndex] * 1000;
    const mono = ((buf[i + 3] >> 6) & 0x03) === 3;
    const samplesPerFrame = mpeg1 ? 1152 : 576;

    // Xing / Info header (VBR, or LAME CBR with frame count).
    const sideInfo = mpeg1 ? (mono ? 17 : 32) : mono ? 9 : 17;
    const x = i + 4 + sideInfo;
    const tag = String.fromCharCode(buf[x] ?? 0, buf[x + 1] ?? 0, buf[x + 2] ?? 0, buf[x + 3] ?? 0);
    if ((tag === "Xing" || tag === "Info") && x + 12 <= buf.length) {
      const flags = readUInt32(buf, x + 4);
      if (flags & 0x1) {
        const frames = readUInt32(buf, x + 8);
        if (frames > 0) {
          // LAME tag: subtract encoder delay + padding like browsers do, so
          // the shown duration matches the one reported during playback.
          // Without a LAME tag, decoders still drop the 529-sample delay.
          let trim = 529;
          let lame = x + 8;
          if (flags & 0x1) lame += 4;
          if (flags & 0x2) lame += 4;
          if (flags & 0x4) lame += 100;
          if (flags & 0x8) lame += 4;
          if (lame + 24 <= buf.length && String.fromCharCode(buf[lame], buf[lame + 1], buf[lame + 2], buf[lame + 3]) === "LAME") {
            const d = lame + 21;
            trim = ((buf[d] << 4) | (buf[d + 1] >> 4)) + (((buf[d + 1] & 0x0f) << 8) | buf[d + 2]);
          }
          return Math.max(0, frames * samplesPerFrame - trim) / sampleRate;
        }
      }
    }
    // VBRI header (Fraunhofer), always 32 bytes after the frame header.
    const v = i + 4 + 32;
    if (v + 18 <= buf.length && String.fromCharCode(buf[v], buf[v + 1], buf[v + 2], buf[v + 3]) === "VBRI") {
      const frames = readUInt32(buf, v + 14);
      if (frames > 0) return (frames * samplesPerFrame) / sampleRate;
    }
    // Plain CBR.
    if (totalSize && bitrate > 0) {
      const audioBytes = totalSize - (bufOffset + i);
      if (audioBytes > 0) return (audioBytes * 8) / bitrate;
    }
    return null;
  }
  return null;
}

const RANGE = 16 * 1024;

async function fetchRange(url: string, start: number, end: number) {
  const res = await fetch(url, {
    headers: { Range: `bytes=${start}-${end}` },
    signal: AbortSignal.timeout(4000),
    cache: "no-store",
  });
  if (res.status !== 206 && res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const total = res.headers.get("content-range")?.match(/\/(\d+)$/)?.[1];
  // A server that ignores Range would stream the whole file; read only what
  // we asked for.
  const reader = res.body?.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  const want = end - start + 1;
  while (reader && received < want) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    chunks.push(value);
    received += value.length;
  }
  await reader?.cancel().catch(() => {});
  const buf = new Uint8Array(Math.min(received, want));
  let at = 0;
  for (const c of chunks) {
    const slice = c.subarray(0, Math.max(0, buf.length - at));
    buf.set(slice, at);
    at += slice.length;
    if (at >= buf.length) break;
  }
  const totalSize = total ? Number(total) : res.status === 200 ? Number(res.headers.get("content-length")) || null : null;
  return { buf, totalSize };
}

/** Duration in seconds of a remote MP3, or null if it cannot be determined. */
export async function fetchMp3Duration(url: string): Promise<number | null> {
  try {
    const first = await fetchRange(url, 0, RANGE - 1);
    const tagSize = id3v2Size(first.buf);
    if (tagSize + 4 < first.buf.length) {
      return durationFromFrames(first.buf.subarray(tagSize), tagSize, first.totalSize);
    }
    // Large ID3 tag (embedded artwork): read the bytes right after it.
    const second = await fetchRange(url, tagSize, tagSize + RANGE - 1);
    return durationFromFrames(second.buf, tagSize, second.totalSize ?? first.totalSize);
  } catch {
    return null;
  }
}
