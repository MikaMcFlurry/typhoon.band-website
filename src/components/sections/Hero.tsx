import Image from "next/image";
import { PlayTrackButton } from "@/components/audio/PlayTrackButton";
import { Setlist, type SetlistTrack } from "@/components/audio/Setlist";
import { Icon } from "@/components/ui/Icon";
import type { Dict } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

// First viewport: the gold signature is the name, the tagline is laid as
// three strips of tape; on the right a real colour stage photo with the
// setlist taped over its corner: one tap plays a song. The one orange
// action is booking.

function titleCase(line: string, locale: Locale) {
  const lower = line.toLocaleLowerCase(locale);
  return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
}

const STAGE_PHOTO = "/assets/band-cards/typhoon-band-card.jpg";

const STRIPS = [
  { key: "line1", tilt: "-rotate-[1.4deg]", tape: "tape" },
  { key: "line2", tilt: "rotate-[0.8deg]", tape: "tape" },
  { key: "line3", tilt: "-rotate-[0.6deg]", tape: "tape tape-pink" },
] as const;

export function Hero({
  dict,
  locale,
  signatureUrl,
  tracks,
  featured,
  setlistFooter,
}: {
  dict: Dict;
  locale: Locale;
  signatureUrl: string;
  tracks: SetlistTrack[];
  featured: SetlistTrack | null;
  setlistFooter?: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-x-clip pt-[var(--header-h)]"
      id="home"
    >
      <div className="shell grid gap-x-10 gap-y-14 pb-20 pt-6 md:pb-28 md:pt-10 lg:grid-cols-12 lg:items-center xl:min-h-[calc(100svh-var(--header-h))] xl:pb-16">
        <div className="lg:col-span-6 xl:col-span-7">
          <h1 id="hero-title">
            <Image
              alt="Typhoon"
              className="h-auto w-[min(86%,480px)] -translate-x-[2%] lg:w-[min(88%,560px)]"
              height={724}
              priority
              sizes="(min-width: 1024px) 560px, 88vw"
              src={signatureUrl}
              width={2099}
            />
            <span className="mt-6 flex flex-col items-start gap-2 font-stage text-[clamp(2.5rem,0.9rem+7vw,6rem)] font-black uppercase leading-[0.92] md:mt-8">
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

          <p className="mono-cap mt-8 flex flex-wrap gap-x-2 gap-y-1 text-chalk-2">
            {dict.brand.genres.map((g, i) => (
              <span key={g}>
                {i > 0 ? <span aria-hidden className="mr-2 text-chalk-3">/</span> : null}
                {g}
              </span>
            ))}
          </p>
          <p className="copy-lg mt-4">{dict.hero.description}</p>

          <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            {featured ? (
              <PlayTrackButton id={featured.id} src={featured.src} title={featured.title} />
            ) : null}
            <a className="btn-tape" href="#booking">
              {dict.hero.ctaBook}
              <Icon name="arrow-right" size={20} />
            </a>
          </div>
        </div>

        <div className="relative lg:col-span-6 lg:pt-[40%] xl:col-span-5 xl:pt-[44%]">
          {/* Stage photo plate (real colour live photo) carries the right
              columns; the setlist is taped over its lower-left quadrant so
              the face and the keys stay clear. */}
          <figure className="relative -mx-4 aspect-[16/10] overflow-hidden bg-deck-3 sm:mx-0 lg:absolute lg:right-0 lg:top-0 lg:mx-0 lg:aspect-auto lg:h-[calc(100%-5rem)] lg:w-[70%] xl:w-[74%]">
            <Image
              alt={dict.hero.photoAlt}
              className="object-cover object-[72%_35%] lg:object-[74%_center]"
              fill
              priority
              sizes="(min-width: 1024px) 30vw, 100vw"
              src={STAGE_PHOTO}
            />
          </figure>
          <div className="relative z-10 -mt-14 sm:-mt-20 lg:mt-0 lg:w-[88%] lg:rotate-[1deg] xl:w-[82%]">
            <Setlist featuredId={featured?.id ?? null} footer={setlistFooter} tracks={tracks} />
          </div>
        </div>
      </div>
    </section>
  );
}
