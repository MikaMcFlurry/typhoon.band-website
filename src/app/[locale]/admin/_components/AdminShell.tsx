import Link from "next/link";

import type { CurrentAdmin } from "@/lib/admin/auth";

const ROLE_LABELS: Record<CurrentAdmin["profile"]["role"], string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
};

export function AdminShell({
  locale,
  current,
  active,
  children,
}: {
  locale: string;
  current: CurrentAdmin;
  active: "dashboard" | "booking";
  children: React.ReactNode;
}) {
  const navItems: { href: string; label: string; key: typeof active }[] = [
    { href: `/${locale}/admin`, label: "Dashboard", key: "dashboard" },
    { href: `/${locale}/admin/booking`, label: "Booking", key: "booking" },
  ];

  const displayName =
    current.profile.display_name?.trim() ||
    current.email ||
    current.profile.email ||
    "Admin";

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 md:pt-32">
      <header className="flex flex-col gap-4 border-b border-[color:var(--line)] pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="kicker">Typhoon Admin</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-[-0.02em] md:text-3xl">
            {displayName}
          </h1>
          <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[color:var(--muted-cream)]">
            {ROLE_LABELS[current.profile.role]}
            {current.profile.is_active ? " · aktiv" : " · inaktiv"}
          </p>
        </div>
        <form
          action={`/api/admin/auth/logout?locale=${encodeURIComponent(locale)}`}
          method="post"
        >
          <button type="submit" className="btn btn-secondary">
            Logout
          </button>
        </form>
      </header>

      <nav
        aria-label="Admin"
        className="mt-5 flex flex-wrap gap-2 border-b border-[color:var(--line)] pb-4 text-[11px] uppercase tracking-[0.22em]"
      >
        {navItems.map((item) => {
          const isActive = item.key === active;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={
                "rounded-full border px-3 py-1.5 transition " +
                (isActive
                  ? "border-[color:var(--gold-soft)] bg-[color:var(--gold)] text-[#060403]"
                  : "border-[color:var(--line)] text-[color:var(--muted-cream)] hover:border-[color:var(--gold-soft)] hover:text-[color:var(--gold-soft)]")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">{children}</div>
    </section>
  );
}
