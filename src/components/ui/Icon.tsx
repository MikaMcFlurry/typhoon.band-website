// Inline SVG icon set. Decorative by default (aria-hidden); give the parent
// control an accessible label instead.

type IconName =
  | "play"
  | "pause"
  | "prev"
  | "next"
  | "volume"
  | "mute"
  | "close"
  | "menu"
  | "arrow-right"
  | "arrow-left"
  | "arrow-up"
  | "arrow-down"
  | "external"
  | "mail"
  | "phone"
  | "pin"
  | "calendar"
  | "check"
  | "spinner"
  | "instagram"
  | "facebook"
  | "youtube"
  | "spotify"
  | "soundcloud"
  | "bandcamp"
  | "link";

type Props = {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 20, className, strokeWidth = 1.75 }: Props) {
  const common = {
    "aria-hidden": true as const,
    focusable: false as const,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    className,
  };
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "play":
      return (
        <svg {...common} fill="currentColor">
          <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
        </svg>
      );
    case "pause":
      return (
        <svg {...common} fill="currentColor">
          <rect x="6" y="4.5" width="4" height="15" rx="1.2" />
          <rect x="14" y="4.5" width="4" height="15" rx="1.2" />
        </svg>
      );
    case "prev":
      return (
        <svg {...common} fill="currentColor">
          <path d="M18 6.3v11.4a1 1 0 0 1-1.54.84L8.5 13.2a1.4 1.4 0 0 1 0-2.4l7.96-5.34A1 1 0 0 1 18 6.3Z" />
          <rect x="5" y="5.5" width="2.2" height="13" rx="1" />
        </svg>
      );
    case "next":
      return (
        <svg {...common} fill="currentColor">
          <path d="M6 6.3v11.4a1 1 0 0 0 1.54.84l7.96-5.34a1.4 1.4 0 0 0 0-2.4L7.54 5.46A1 1 0 0 0 6 6.3Z" />
          <rect x="16.8" y="5.5" width="2.2" height="13" rx="1" />
        </svg>
      );
    case "volume":
      return (
        <svg {...common} {...stroke}>
          <path d="M11 5 6.5 9H3.5v6h3L11 19V5Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      );
    case "mute":
      return (
        <svg {...common} {...stroke}>
          <path d="M11 5 6.5 9H3.5v6h3L11 19V5Z" />
          <path d="m16 9.5 5 5M21 9.5l-5 5" />
        </svg>
      );
    case "close":
      return (
        <svg {...common} {...stroke}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common} {...stroke}>
          <path d="M4 8h16M4 16h16" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...common} {...stroke}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case "arrow-left":
      return (
        <svg {...common} {...stroke}>
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
      );
    case "arrow-up":
      return (
        <svg {...common} {...stroke}>
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      );
    case "arrow-down":
      return (
        <svg {...common} {...stroke}>
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      );
    case "external":
      return (
        <svg {...common} {...stroke}>
          <path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common} {...stroke}>
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common} {...stroke}>
          <path d="M5 4h3.5l1.5 4-2 1.3a11 11 0 0 0 6.7 6.7L16 14l4 1.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common} {...stroke}>
          <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
          <circle cx="12" cy="10" r="2.3" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common} {...stroke}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
          <path d="M3.5 10h17M8 3v4M16 3v4" />
        </svg>
      );
    case "check":
      return (
        <svg {...common} {...stroke}>
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      );
    case "spinner":
      return (
        <svg {...common} {...stroke} className={`animate-spin ${className ?? ""}`}>
          <path d="M12 3a9 9 0 1 0 9 9" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} {...stroke}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common} fill="currentColor">
          <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4a21 21 0 0 0-2.4-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common} fill="currentColor">
          <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
        </svg>
      );
    case "spotify":
      return (
        <svg {...common} {...stroke}>
          <circle cx="12" cy="12" r="9" />
          <path d="M7.5 9.5c3.2-1 6.6-.7 9.3.8M8 12.6c2.6-.7 5.2-.5 7.4.8M8.6 15.5c2-.5 3.9-.3 5.6.6" />
        </svg>
      );
    case "soundcloud":
      return (
        <svg {...common} fill="currentColor">
          <path d="M11 8.2v8.3h7.2a3 3 0 0 0 .3-6 4.9 4.9 0 0 0-7.5-2.3ZM9.6 9.2h1v7.3h-1Zm-1.8.6h1v6.7h-1Zm-1.8.9h1v5.8H6Zm-1.8 1.1h1v4.7h-1Zm-1.7 1.3h1v3.4h-1Z" />
        </svg>
      );
    case "bandcamp":
      return (
        <svg {...common} fill="currentColor">
          <path d="M8.2 6H21l-5.2 12H3Z" />
        </svg>
      );
    case "link":
    default:
      return (
        <svg {...common} {...stroke}>
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
          <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </svg>
      );
  }
}

export type { IconName };
