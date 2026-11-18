const STEPS = [
  {
    number: "01",
    title: "Brief",
    copy: "What it needs to do, who it is for, and the one thing they should remember.",
  },
  {
    number: "02",
    title: "Storyboard",
    copy: "Frames and timing, settled before a single scene is polished.",
  },
  {
    number: "03",
    title: "Animate",
    copy: "Motion, type, and sound, refined until it feels effortless.",
  },
  {
    number: "04",
    title: "Deliver",
    copy: "Masters for the feed, the site, and the launch, ready to ship.",
  },
];

export function Process() {
  return (
    <section id="process" className="rise mx-auto max-w-[1120px] px-5 py-16">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
      <ol className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <li key={step.number}>
            <p className="text-xs font-semibold tracking-[0.18em] text-blue-soft">
              {step.number}
            </p>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{step.copy}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
