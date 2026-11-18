import { Suspense } from "react";
import type { Metadata } from "next";
import { Dashboard } from "@/app/admin/dashboard";
import { LoginForm } from "@/app/admin/login-form";
import { SetupNotice } from "@/app/admin/setup-notice";
import { authConfigured, isAdmin } from "@/lib/auth";
import { listVideos } from "@/lib/db";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="min-h-full">
      <Suspense fallback={<p className="px-5 py-16 text-sm text-muted">Opening the studio…</p>}>
        <AdminScreen />
      </Suspense>
    </main>
  );
}

async function AdminScreen() {
  const missing = ["ADMIN_PASSWORD", "AUTH_SECRET", "DATABASE_URL", "BLOB_READ_WRITE_TOKEN"].filter(
    (key) => !process.env[key],
  );

  if (!authConfigured()) {
    return <SetupNotice missing={missing} />;
  }

  const signedIn = await isAdmin();
  if (!signedIn) return <LoginForm />;

  const catalog = await listVideos();
  return (
    <Dashboard
      videos={catalog.videos}
      catalogError={catalog.error}
      uploadsReady={Boolean(process.env.DATABASE_URL && process.env.BLOB_READ_WRITE_TOKEN)}
    />
  );
}
