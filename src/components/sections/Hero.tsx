import Image from "next/image";
import { PlayTrackButton } from "@/components/audio/PlayTrackButton";
import type { SetlistTrack } from "@/components/audio/Setlist";
import { Icon } from "@/components/ui/Icon";
import type { Dict } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

// First viewport: the gold signature is the name, the tagline is laid as
// three strips of tape, and the whole band is on the right — the band
// collage from Admin → Site assets (hero_image), taped up like a poster
// and always shown whole (the band presents itself as a band, not as a
// singer with backing musicians). The setlist follows in the next section;
// the pink CTA plays the current single right here. Orange = booking.

function titleCase(line: string, locale: Locale) {
  const lower = line.toLocaleLowerCase(locale);
  return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
}

const STRIPS = [
  { key: "line1", tilt: "-rotate-[1.4deg]", tape: "tape" },
  { key: "line2", tilt: "rotate-[0.8deg]", tape: "tape" },
  { key: "line3", tilt: "-rotate-[0.6deg]", tape: "tape tape-pink" },
] as const;

export function Hero({
  dict,
  locale,
  signatureUrl,
  imageUrl,
  featured,
}: {
  dict: Dict;
  locale: Locale;
  signatureUrl: string;
  imageUrl: string;
  featured: SetlistTrack | null;
}) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-x-clip pt-[var(--header-h)]"
      id="home"
    >
      <div className="shell grid gap-x-10 gap-y-14 pb-20 pt-6 md:pb-28 md:pt-10 short:pt-4 lg:grid-cols-12 lg:items-center xl:min-h-[calc(100svh-var(--header-h))] xl:pb-16">
        <div className="lg:col-span-6 xl:col-span-7">
          <h1 id="hero-title">
            <Image
              alt="Typhoon"
              className="h-auto w-[min(86%,480px)] -translate-x-[2%] lg:w-[min(80%,460px)] xl:w-[min(88%,560px)] short:w-[min(80%,400px)]"
              fetchPriority="high"
              height={724}
              priority
              sizes="(min-width: 1024px) 560px, 88vw"
              src={signatureUrl}
              width={2099}
            />
            <span className="mt-6 flex flex-col items-start gap-2 font-stage text-[clamp(2.5rem,0.9rem+7vw,6rem)] lg:text-[4.25rem] xl:text-[clamp(2.5rem,0.9rem+7vw,6rem)] short:text-[4.25rem] font-black uppercase leading-[0.92] md:mt-8 short:mt-5">
              {STRIPS.map((s, i) => (
                <span
                  className={`lay ${s.tape} ${s.tilt} origin-left`}
                  key={s.key}
                  style={{ ["--reveal-delay" as string]: `${120 + i * 140}ms` }}
                >
                  {titleCase(dict.hero[s.key], locale)}
                </span>
              ))}
            </span>
          </h1>

          <p className="mono-cap mt-8 flex flex-wrap gap-x-2 gap-y-1 text-chalk-2 short:mt-6">
            {dict.brand.genres.map((g, i) => (
              <span key={g}>
                {i > 0 ? <span aria-hidden className="mr-2 text-chalk-3">/</span> : null}
                {g}
              </span>
            ))}
          </p>
          <p className="copy-lg mt-4">{dict.hero.description}</p>

          <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap short:mt-6">
            {featured ? (
              <PlayTrackButton id={featured.id} src={featured.src} title={featured.title} />
            ) : null}
            <a className="btn-tape" href="#booking">
              {dict.hero.ctaBook}
              <Icon name="arrow-right" size={20} />
            </a>
          </div>
        </div>

        <figure className="relative mx-auto w-full max-w-[640px] lg:col-span-6 lg:max-w-none xl:col-span-5 lg:-rotate-[0.8deg]">
          <span aria-hidden className="tape-piece -top-2.5 left-8 z-10 -rotate-6" />
          <span aria-hidden className="tape-piece -top-2.5 right-8 z-10 rotate-3" />
          <div className="relative aspect-square bg-deck-2 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.9)]">
            <Image
              alt={dict.meta.ogAlt}
              className="object-contain"
              fill
              priority
              sizes="(min-width: 1280px) 40vw, (min-width: 1024px) 48vw, (min-width: 672px) 640px, 100vw"
              src={imageUrl}
            />
          </div>
        </figure>
      </div>
    </section>
  );
}
