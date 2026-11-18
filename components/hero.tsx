import { Orbit } from "@/components/orbit";

export function Hero() {
  return (
    <section className="rise-load mx-auto max-w-[1120px] px-5 pt-16 pb-8 sm:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-[2.7rem] leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl md:text-7xl">
          Make them <span className="text-blue">stop</span> scrolling.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
          I design motion that earns the next second. Product films, launch
          spots, and interfaces that feel inevitable.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#contact"
            className="press inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black sm:w-auto"
          >
            Start a project
          </a>
          <a
            href="#work"
            className="press inline-flex h-12 w-full items-center justify-center rounded-full border border-white/15 px-6 text-sm font-medium text-white sm:w-auto"
          >
            Watch the reel
          </a>
        </div>
      </div>
      <div className="mt-12 sm:mt-16">
        <Orbit />
      </div>
    </section>
  );
}
