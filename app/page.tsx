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
        <Suspense
          fallback={
            <>
              <Hero />
              <Statement />
              <SelectedWork videos={[]} />
            </>
          }
        >
          <LandingReel />
        </Suspense>
        <Services />
        <Process />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}

async function LandingReel() {
  const { videos } = await listVideos();
  const hero = videos.find((video) => video.isHero) ?? null;
  return (
    <>
      <Hero video={hero} />
      <Statement />
      <SelectedWork videos={videos} />
    </>
  );
}
