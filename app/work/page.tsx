import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SelectedWork } from "@/components/selected-work";
import { listVideos } from "@/lib/db";

export const metadata: Metadata = {
  title: "Work",
};

export default function WorkPage() {
  return (
    <div id="top">
      <Header />
      <main>
        <Suspense fallback={<SelectedWork videos={[]} variant="catalog" />}>
          <WorkCatalog />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

async function WorkCatalog() {
  const { videos } = await listVideos();
  return <SelectedWork videos={videos} variant="catalog" />;
}
