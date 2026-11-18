import { Suspense } from "react";
import { Cta } from "@/components/cta";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Process } from "@/components/process";
import { SelectedWork } from "@/components/selected-work";
import { Services } from "@/components/services";
import { Statement } from "@/components/statement";
import { listVideos } from "@/lib/db";

export default function Home() {
  return (
    <div id="top">
      <Header />
      <main>
        <Hero />
        <Statement />
        <Suspense fallback={<SelectedWork videos={[]} />}>
          <WorkReel />
        </Suspense>
        <Services />
        <Process />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}

async function WorkReel() {
  const { videos } = await listVideos();
  return <SelectedWork videos={videos} />;
}
