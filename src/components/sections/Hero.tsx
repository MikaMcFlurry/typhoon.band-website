import Image from "next/image";
import { site } from "@/data/site";

// Layout matches handoff/desktop.html `.hero` and handoff/mobile.html `.hero-m`.
// - hero-image: right side, 62% (desktop) / 70% (mobile), sepia + brightness.
// - hero-signature: oversized gold wordmark rotated -4deg, overflow-visible
//   so it bleeds below the section edge.
// - hero-inner: 132px / 100px top padding, 420 / 220 max-width copy column.
export function Hero() {
  return (
    <section className="relative overflow-visible" id="home">
      <div
        className="relative min-h-[540px] md:min-h-[620px]"
        style={{
          background:
            "radial-gradient(circle at 75% 30%, rgba(199,154,75,0.20), transparent 38%), linear-gradient(90deg, #030201 0%, #050302 38%, #0c0805 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-[70%] md:w-[62%]">
          <Image
            alt="Typhoon Band Live"
            className="h-full w-full object-cover object-top"
            fill
            priority
            sizes="(max-width: 768px) 70vw, 62vw"
            src="/assets/hero/hero-collage.jpeg"
            style={{
              objectFit: "cover",
              objectPosition: "center top",
              filter:
                "sepia(0.4) saturate(0.85) contrast(1.08) brightness(0.78)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(3,2,1,1) 0%, rgba(3,2,1,0.85) 8%, rgba(3,2,1,0.35) 22%, transparent 40%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 60% 50%, transparent 30%, rgba(3,2,1,0.5) 90%), linear-gradient(180deg, rgba(3,2,1,0.45) 0%, transparent 18%, transparent 78%, rgba(3,2,1,0.65) 100%)",
            }}
          />
        </div>

        {/* Gold wordmark — desktop */}
        <Image
          alt=""
          aria-hidden
          className="pointer-events-none absolute z-[50] hidden md:block"
          height={724}
          src="/assets/branding/typhoon-signature-gold.png"
          style={{
            right: "-2%",
            bottom: "-40px",
            width: "700px",
            transform: "rotate(-4deg)",
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.85))",
            mixBlendMode: "screen",
          }}
          width={2099}
        />
        {/* Gold wordmark — mobile */}
        <Image
          alt=""
          aria-hidden
          className="pointer-events-none absolute z-[50] md:hidden"
          height={724}
          src="/assets/branding/typhoon-signature-gold.png"
          style={{
            right: "2%",
            bottom: "-50px",
            width: "70%",
            transform: "rotate(-4deg)",
            filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.85))",
          }}
          width={2099}
        />

        <div className="relative z-[5] mx-auto max-w-container px-4 pt-[100px] md:px-8 md:pt-[132px]">
          <div className="max-w-[220px] md:max-w-[420px]">
            <h1 className="m-0 font-display text-[38px] font-bold leading-[0.96] tracking-[-0.04em] text-[color:var(--cream)] md:text-[76px]">
              {site.hero.line1}
              <br />
              {site.hero.line2}
              <br />
              <span className="text-[color:var(--gold)]">{site.hero.line3}</span>
            </h1>
            <p className="mt-[14px] max-w-[200px] text-[11px] leading-[1.5] text-[color:var(--muted-cream)] md:mt-[22px] md:max-w-[360px] md:text-[14px] md:leading-[1.6]">
              {site.hero.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 md:mt-[26px] md:gap-2.5">
              <a className="btn btn-primary !px-4 !py-2.5 !text-[10px] md:!px-[22px] md:!py-3 md:!text-[11px]" href="#music">
                <svg
                  aria-hidden
                  className="h-2.5 w-2.5 md:h-3 md:w-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                {site.hero.ctaListen}
              </a>
              <a className="btn btn-secondary !px-4 !py-2.5 !text-[10px] md:!px-[22px] md:!py-3 md:!text-[11px]" href="#booking">
                {site.hero.ctaBook}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
