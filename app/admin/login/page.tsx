import { redirect } from "next/navigation";
import { getSessionKind } from "@/lib/server-auth";
import AdminLoginForm from "@/components/AdminLoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const kind = await getSessionKind();
  if (kind === "admin") redirect("/admin/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-serif text-5xl font-semibold text-accent">Admin</h1>
        <p className="mt-3 text-muted">Bitte melde dich mit dem Admin-Passwort an.</p>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
