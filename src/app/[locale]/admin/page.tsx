export const metadata = { title: "Admin" };

export default function AdminHomePage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl">
        Admin
      </h1>
      <p className="mt-4 text-sm text-[color:var(--muted-cream)]">
        Vollständiges Admin-CRUD wird im nächsten Batch implementiert. Diese
        Route stellt nur den geschützten Server-Shell bereit.
      </p>
    </div>
  );
}
