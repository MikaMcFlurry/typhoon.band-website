import "server-only";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

// Admin chrome. Real auth-gating happens per route: the login page stays
// reachable when signed out, every other admin page/action calls
// requireAdmin()/requireAdminWithPasswordOk() server-side. The admin lives
// outside the public (site) route group, so it no longer inherits the
// public header, footer, player or consent banner.

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="min-h-screen bg-ink">
      <div className="border-b border-line bg-ink-2">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <Link aria-label="Admin" className="flex items-center gap-3" href={`/${locale}/admin`}>
            <Image
              alt="Typhoon"
              className="h-7 w-auto"
              height={724}
              sizes="100px"
              src="/assets/branding/typhoon-signature-gold-bold.png"
              width={2099}
            />
            <span className="label">Admin</span>
          </Link>
          <Link className="text-[0.875rem] text-paper-2 hover:text-gold-hi" href={`/${locale}`}>
            Zur Website ↗
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
