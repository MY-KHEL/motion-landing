const SERVICES = [
  {
    title: "Launch & product films",
    copy: "Openings, demos, and product stories cut to the length of a decision.",
    icon: (
      <span className="block h-4 w-4 rounded-full border-2 border-blue" />
    ),
  },
  {
    title: "Brand motion systems",
    copy: "A small set of moves a brand can repeat without looking repeated.",
    icon: (
      <span className="flex h-4 items-end gap-0.5">
        <span className="h-2 w-1 rounded-sm bg-blue" />
        <span className="h-4 w-1 rounded-sm bg-blue-soft" />
        <span className="h-3 w-1 rounded-sm bg-blue" />
      </span>
    ),
  },
  {
    title: "Explainer animation",
    copy: "A complex idea, told once, clearly, and at the speed people actually watch.",
    icon: <span className="block h-4 w-4 rounded-md border-2 border-blue" />,
  },
  {
    title: "Social & ad motion",
    copy: "Spots built for the feed: fast in, clear offer, hard to skip.",
    icon: <span className="block h-4 w-4 rounded-full bg-blue" />,
  },
];

export function Services() {
  return (
    <section id="services" className="rise mx-auto max-w-[1120px] px-5 py-16">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">What I make</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {SERVICES.map((service) => (
          <article
            key={service.title}
            className="lift rounded-[28px] border border-white/8 bg-card p-6 sm:p-7"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue/15 text-blue">
              {service.icon}
            </div>
            <h3 className="mt-6 text-lg font-semibold tracking-tight">{service.title}</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{service.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
