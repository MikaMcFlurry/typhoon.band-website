import Image from "next/image";
import { PlayTrackButton } from "@/components/audio/PlayTrackButton";
import { Icon } from "@/components/ui/Icon";
import type { Dict } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

// Three separate layers, as the owner asked: text block, the full band
// collage (only the paper margins are trimmed, every musician stays
// visible, edges fade softly instead of a hard overlay seam) and the gold
// signature, which sits on the image and bleeds past the hero into the
// featured player. The signature never covers the text.

function titleCase(line: string, locale: Locale) {
  const lower = line.toLocaleLowerCase(locale);
  return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
}

const IMAGE_MASK =
  "linear-gradient(to right, transparent 0%, #000 9%, #000 94%, transparent 100%), linear-gradient(to bottom, transparent 0%, #000 7%, #000 84%, transparent 100%)";

export function Hero({
  dict,
  locale,
  imageUrl,
  signatureUrl,
  featured,
}: {
  dict: Dict;
  locale: Locale;
  imageUrl: string;
  signatureUrl: string;
  featured: { id: string; title: string; src: string } | null;
}) {
  const genres = dict.brand.genres;

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-x-clip pt-[var(--header-h)]"
      id="home"
    >
      <div className="container-x grid items-center gap-y-6 pb-20 lg:min-h-[min(86svh,900px)] lg:grid-cols-12 lg:gap-x-10 lg:pb-28">
        {/* Image + signature */}
        <div className="relative order-1 -mx-4 sm:-mx-6 lg:order-2 lg:col-span-7 lg:mx-0">
          <div
            className="hero-image grain relative mx-auto aspect-[1/0.86] w-full lg:ml-auto"
            style={{
              maskImage: IMAGE_MASK,
              WebkitMaskImage: IMAGE_MASK,
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
            }}
          >
            <Image
              alt={dict.meta.ogAlt}
              className="object-cover object-[50%_42%]"
              fill
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              src={imageUrl}
              style={{ filter: "sepia(0.28) saturate(0.9) contrast(1.06) brightness(0.9)" }}
            />
          </div>
          <Image
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-[-9%] right-[4%] z-30 w-[82%] -rotate-[4deg] drop-shadow-[0_10px_24px_rgba(0,0,0,0.75)] sm:w-[70%] lg:bottom-[-11%] lg:right-[6%] lg:w-[78%]"
            height={724}
            priority
            sizes="(min-width: 1024px) 44vw, 80vw"
            src={signatureUrl}
            width={2099}
          />
        </div>

        {/* Text */}
        <div className="order-2 pt-14 sm:pt-16 lg:order-1 lg:col-span-5 lg:pt-0">
          <h1
            className="font-display text-[clamp(2.75rem,1.9rem+4.2vw,5.25rem)] font-medium leading-[0.98] tracking-[-0.022em] text-paper"
            id="hero-title"
          >
            <span className="sr-only">Typhoon. </span>
            <span className="block">{titleCase(dict.hero.line1, locale)}</span>
            <span className="block">{titleCase(dict.hero.line2, locale)}</span>
            <span className="block text-gold">{titleCase(dict.hero.line3, locale)}</span>
          </h1>

          <p className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-[0.875rem] font-semibold uppercase tracking-[0.08em] text-gold-hi">
            {genres.map((g, i) => (
              <span className="inline-flex items-center gap-3" key={g}>
                {i > 0 ? <span aria-hidden className="size-1 rounded-full bg-gold-lo" /> : null}
                {g}
              </span>
            ))}
          </p>

          <p className="lede mt-5">{dict.hero.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {featured ? (
              <PlayTrackButton id={featured.id} src={featured.src} title={featured.title} />
            ) : (
              <a className="btn btn-primary" href="#music">
                <Icon name="play" size={18} />
                {dict.hero.ctaListen}
              </a>
            )}
            <a className="btn btn-secondary" href="#booking">
              {dict.hero.ctaBook}
              <Icon name="arrow-right" size={18} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
