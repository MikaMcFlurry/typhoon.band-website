import Image from "next/image";
import { Fragment } from "react";
import { PlayTrackButton } from "@/components/audio/PlayTrackButton";
import { Setlist, type SetlistTrack } from "@/components/audio/Setlist";
import { Icon } from "@/components/ui/Icon";
import type { Dict } from "@/i18n/dictionaries";
import { fill } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

// First viewport: the gold signature is the name, the tagline is laid as
// three strips of tape, and on the right the whole band — the band
// collage from Admin → Site assets (hero_image), taped up like a poster
// and shown whole (the band presents itself as a band, not as a singer
// with backing musicians) — with the setlist taped over the poster's
// bottom paper margin only (~11% of its width), so no musician is covered.
// Every setlist row plays. Orange = booking.

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
  tracks,
  setlistFooter,
  memberCount,
}: {
  dict: Dict;
  locale: Locale;
  memberCount: number;
  signatureUrl: string;
  imageUrl: string;
  featured: SetlistTrack | null;
  tracks: SetlistTrack[];
  setlistFooter?: React.ReactNode;
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
              className="h-auto w-[min(86%,480px)] -translate-x-[2%] lg:w-[min(80%,460px)] xl:w-[min(80%,500px)] short:w-[min(80%,400px)]"
              fetchPriority="high"
              height={724}
              priority
              sizes="(min-width: 1280px) 500px, (min-width: 1024px) 460px, min(86vw, 480px)"
              src={signatureUrl}
              width={2099}
            />
            <span className="mt-6 flex flex-col items-start gap-2 font-stage text-[clamp(2.5rem,0.9rem+7vw,6rem)] lg:text-[4.25rem] xl:text-[clamp(4.25rem,2rem+3.5vw,6rem)] short:text-[4.25rem] font-black uppercase leading-[0.92] md:mt-8 short:mt-5">
              {/* The spaces keep the heading text readable as words for
                  search engines and screen readers ("Smooth. Exzeptionell.
                  Funk."); in the flex column they take no room. */}
              {STRIPS.map((s, i) => (
                <Fragment key={s.key}>
                  {i > 0 ? " " : null}
                  <span
                    className={`lay ${s.tape} ${s.tilt} origin-left`}
                    style={{ ["--reveal-delay" as string]: `${120 + i * 140}ms` }}
                  >
                    {titleCase(dict.hero[s.key], locale)}
                  </span>
                </Fragment>
              ))}
            </span>
          </h1>

          {/* The slash trails each genre, so a wrapped line never starts
              with a separator. */}
          <p className="mono-cap mt-8 flex flex-wrap gap-x-2 gap-y-1 text-chalk-2 short:mt-6">
            {dict.brand.genres.map((g, i, all) => (
              <span key={g}>
                {g}
                {i < all.length - 1 ? <span aria-hidden className="ml-2 text-chalk-3">/</span> : null}
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
          {/* What a booker needs to qualify the band at a glance: size
              (from live data) and base. */}
          <ul className="mono-cap mt-5 flex flex-wrap gap-x-2 gap-y-1 text-chalk-2 short:mt-4">
            {dict.hero.facts.map((f, i, all) => (
              <li key={f}>
                {fill(f, { count: memberCount })}
                {i < all.length - 1 ? <span aria-hidden className="ml-2 text-chalk-3">·</span> : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[640px] lg:col-span-6 lg:max-w-none xl:col-span-5">
          {/* The poster's width sets how far the sheet may overlap it:
              margin-top in % of the column width = 11% of the poster. */}
          <figure className="relative ml-auto w-full lg:w-[62%] lg:-rotate-[0.8deg] xl:w-[68%] short:w-[52%]">
            <span aria-hidden className="tape-piece -top-2.5 left-8 z-10 -rotate-6" />
            <span aria-hidden className="tape-piece -top-2.5 right-8 z-10 rotate-3" />
            <div className="relative aspect-square bg-deck-2 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.9)]">
              {/* Eager but not preloaded: on phones the poster sits below the
                  fold and must not compete with the signature (the LCP). */}
              <Image
                alt={dict.meta.ogAlt}
                className="object-contain"
                fill
                loading="eager"
                sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 36vw, (min-width: 672px) 640px, 100vw"
                src={imageUrl}
              />
            </div>
          </figure>
          <div className="relative z-10 -mt-[11%] lg:-mt-[6.8%] lg:rotate-[0.8deg] xl:-mt-[7.5%] short:-mt-[5.8%]" id="music">
            <Setlist featuredId={featured?.id ?? null} footer={setlistFooter} tracks={tracks} />
          </div>
        </div>
      </div>
    </section>
  );
}
