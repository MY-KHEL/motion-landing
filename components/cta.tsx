const CONTACT_HREF = `https://wa.me/2349135878494?text=${encodeURIComponent(
  "Good day , motion designer,\n\nI have a work for you.",
)}`;

export function Cta() {
  return (
    <section id="contact" className="rise mx-auto max-w-[1120px] px-5 py-16">
      <div className="rounded-[32px] bg-blue px-6 py-16 text-center text-white sm:px-12 sm:py-20">
        <h2 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Got something that should move?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-white/80">
          Send the idea. I will tell you if motion is the right way to land it.
        </p>
        <a
          href={CONTACT_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="press mt-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black"
        >
          Start a project
        </a>
      </div>
    </section>
  );
}
