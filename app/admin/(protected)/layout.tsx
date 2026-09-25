import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionKind } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin/dashboard", label: "Anmeldungen" },
  { href: "/admin/content", label: "Inhalte" },
  { href: "/admin/gallery", label: "Galerie" },
];

/**
 * Guard-Layout fuer den geschuetzten Admin-Bereich.
 * Liegt bewusst in einer eigenen Route-Group `(protected)`, damit die
 * Login-Seite (`/admin/login`) NICHT von diesem Guard erfasst wird und
 * kein Redirect-Loop entsteht.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const kind = await getSessionKind();
  if (kind !== "admin") redirect("/admin/login");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/admin/dashboard" className="font-serif text-xl font-semibold text-accent">
              JaWort Admin
            </Link>
            <nav className="flex items-center gap-6">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm uppercase tracking-widest text-muted transition hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted hover:text-foreground">
              Website ansehen
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="text-sm uppercase tracking-widest text-muted hover:text-foreground"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
