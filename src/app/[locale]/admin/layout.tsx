import "server-only";

// Admin route group wrapper.
//
// Real auth-gating happens per-route: the login page must stay reachable for
// signed-out users, every other admin page calls `requireAdmin()` server-side
// and renders its own <AdminShell>. This layout therefore only forwards
// children — the public Header/Footer above us come from the locale layout.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
