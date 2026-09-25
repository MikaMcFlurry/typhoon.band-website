import { Icon, type IconName } from "@/components/ui/Icon";
import type { PlatformLink } from "@/lib/content/types";

// Streaming / social links managed in Admin → Platform links. Rendered only
// when active rows exist; never outputs placeholder "#" links.

const PLATFORM: Record<string, { label: string; icon: IconName }> = {
  spotify: { label: "Spotify", icon: "spotify" },
  youtube: { label: "YouTube", icon: "youtube" },
  instagram: { label: "Instagram", icon: "instagram" },
  facebook: { label: "Facebook", icon: "facebook" },
  soundcloud: { label: "SoundCloud", icon: "soundcloud" },
  bandcamp: { label: "Bandcamp", icon: "bandcamp" },
};

export function platformMeta(platform: string) {
  const key = platform.trim().toLowerCase();
  return (
    PLATFORM[key] ?? {
      label: platform.charAt(0).toUpperCase() + platform.slice(1),
      icon: "link" as IconName,
    }
  );
}

export function isSafeUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function PlatformLinks({
  links,
  variant = "pills",
  className = "",
}: {
  links: PlatformLink[];
  variant?: "pills" | "icons";
  className?: string;
}) {
  const safe = links.filter((l) => isSafeUrl(l.url));
  if (safe.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {safe.map((link) => {
        const meta = platformMeta(link.platform);
        return (
          <li key={link.id}>
            <a
              aria-label={variant === "icons" ? meta.label : undefined}
              className={
                variant === "icons"
                  ? "inline-flex size-11 items-center justify-center rounded-full border border-line-2 text-paper-2 transition-colors hover:border-gold hover:text-gold-hi"
                  : "inline-flex h-10 items-center gap-2 rounded-full border border-line-2 px-4 text-[0.875rem] text-paper-2 transition-colors hover:border-gold hover:text-gold-hi"
              }
              href={link.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Icon name={meta.icon} size={18} />
              {variant === "pills" ? meta.label : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
