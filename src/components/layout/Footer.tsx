import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";

const socials: { href: string; label: string; icon: React.ReactNode }[] = [
  {
    href: site.social.instagram || "#",
    label: "Instagram",
    icon: (
      <svg aria-hidden fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <rect height={18} rx={5} width={18} x={3} y={3} />
        <circle cx={12} cy={12} r={4} />
        <circle cx={17.5} cy={6.5} fill="currentColor" r={0.8} />
      </svg>
    ),
  },
  {
    href: site.social.facebook || "#",
    label: "Facebook",
    icon: (
      <svg aria-hidden fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 8h2.5V5.5H14c-1.7 0-3 1.3-3 3V11H9v2.5h2V21h2.5v-7.5H16L16.5 11H13.5V9c0-.6.4-1 1-1z" />
      </svg>
    ),
  },
  {
    href: site.social.youtube || "#",
    label: "YouTube",
    icon: (
      <svg aria-hidden fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <rect height={13} rx={3} width={19} x={2.5} y={5.5} />
        <path d="M10.5 9.5l4.5 2.5-4.5 2.5z" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: site.social.spotify || "#",
    label: "Spotify",
    icon: (
      <svg aria-hidden fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
        <circle cx={12} cy={12} r={9} />
        <path d="M7 10c3-1 7-1 10 1M7.5 13c2.5-.8 6-.6 8.5.8M8 16c2-.6 4.5-.5 6.5.6" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[color:var(--line)] py-10 md:mt-16 md:py-14" id="contact">
      <div className="mx-auto max-w-container px-4 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_0.8fr] md:gap-10">
          <div>
            <Image
              alt="Typhoon"
              className="mb-4 h-12 w-auto md:h-14"
              height={56}
              src="/assets/branding/typhoon-signature-gold.png"
              style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))" }}
              width={250}
            />
            <p className="max-w-[320px] text-xs leading-relaxed text-[color:var(--muted-cream)]">
              Typhoon verbindet türkischsprachige Texte mit Bluesrock, Funk, Soul, Jazz und Southern Rock.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--cream)]">
              Kontakt
            </h4>
            <ul className="space-y-2 text-xs text-[color:var(--muted-cream)]">
              <li>
                <a className="hover:text-[color:var(--gold-soft)]" href={`mailto:${site.contact.info}`}>
                  {site.contact.info}
                </a>
              </li>
              <li>
                <a className="hover:text-[color:var(--gold-soft)]" href={`mailto:${site.contact.booking}`}>
                  {site.contact.booking}
                </a>
              </li>
              <li>{site.contact.phone}</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--cream)]">
              Folge uns
            </h4>
            <ul className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    aria-label={s.label}
                    className="grid h-8 w-8 place-items-center rounded-full border border-[color:var(--line)] text-[color:var(--muted-cream)] transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold-soft)]"
                    href={s.href}
                    rel={s.href.startsWith("http") ? "noreferrer" : undefined}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                  >
                    <span className="block h-3.5 w-3.5">{s.icon}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--cream)]">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-cream)] hover:text-[color:var(--gold-soft)]"
                  href="/de/legal/imprint"
                >
                  Impressum
                </Link>
              </li>
              <li>
                <Link
                  className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-cream)] hover:text-[color:var(--gold-soft)]"
                  href="/de/legal/privacy"
                >
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link
                  className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-cream)] hover:text-[color:var(--gold-soft)]"
                  href="/de/legal/cookies"
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[color:var(--line)] pt-4 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          © {new Date().getFullYear()} Typhoon. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}
