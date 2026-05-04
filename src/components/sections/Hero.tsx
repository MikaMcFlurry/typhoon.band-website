import Image from "next/image";
import { site } from "@/data/site";

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
        {/* Hero image (right side / behind text) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] h-full w-[70%] md:w-[62%]">
          <Image
            alt="Typhoon Band Live"
            className="h-full w-full object-cover object-top"
            fill={false}
            height={1080}
            priority
            src="/assets/hero/hero-collage.jpeg"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              filter: "sepia(0.4) saturate(0.85) contrast(1.08) brightness(0.78)",
            }}
            width={1280}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(3,2,1,1) 0%, rgba(3,2,1,0.9) 12%, rgba(3,2,1,0.4) 26%, transparent 45%)",
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

        {/* Hero signature (overlaps audio player visually) */}
        <Image
          alt=""
          aria-hidden
          className="pointer-events-none absolute z-[50] hidden md:block"
          height={724}
          src="/assets/branding/typhoon-signature-gold.png"
          style={{
            right: "-2%",
            bottom: "-40px",
            width: "640px",
            transform: "rotate(-4deg)",
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.85))",
            mixBlendMode: "screen",
          }}
          width={2099}
        />
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

        {/* Hero copy */}
        <div className="relative z-[5] mx-auto max-w-container px-4 pt-28 md:px-8 md:pt-32">
          <div className="max-w-[260px] md:max-w-[440px]">
            <span className="kicker block text-[color:var(--gold-soft)]">
              {site.brand.tagline}
            </span>
            <h1 className="mt-4 font-display text-[40px] font-bold leading-[0.96] tracking-[-0.04em] text-[color:var(--cream)] md:text-[76px]">
              {site.hero.line1}
              <br />
              {site.hero.line2}
              <br />
              <span className="text-[color:var(--gold)]">{site.hero.line3}</span>
            </h1>
            <p className="mt-5 max-w-[360px] text-xs leading-relaxed text-[color:var(--muted-cream)] md:text-sm">
              {site.hero.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a className="btn btn-primary" href="#music">
                ▶ {site.hero.ctaListen}
              </a>
              <a className="btn btn-secondary" href="#booking">
                {site.hero.ctaBook}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
