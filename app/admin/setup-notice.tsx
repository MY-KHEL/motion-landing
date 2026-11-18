export function SetupNotice({ missing }: { missing: string[] }) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col justify-center px-5">
      <p className="text-[11px] font-semibold tracking-[0.22em] text-blue-soft">
        MOTION DESIGNER
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Studio setup</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Add these to <code className="text-white">.env.local</code>, then restart
        the dev server. The names are listed in <code className="text-white">.env.example</code>.
      </p>
      <ul className="mt-6 space-y-2 text-sm">
        {missing.map((name) => (
          <li key={name} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            {name}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm leading-6 text-muted">
        In the Neon SQL editor, run the statements in{" "}
        <code className="text-white">db/schema.sql</code> so the catalog has a
        place to store each film.
      </p>
    </div>
  );
}
