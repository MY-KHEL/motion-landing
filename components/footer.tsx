export function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1120px] flex-col gap-4 px-5 pt-4 pb-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
      <p>© 2026 Motion Designer</p>
      <nav className="flex gap-5">
        <a href="/#work" className="hover:text-white">
          Work
        </a>
        <a href="/#services" className="hover:text-white">
          Services
        </a>
        <a href="/#contact" className="hover:text-white">
          Contact
        </a>
        <a
          href="https://x.com/degencrooner"
          className="hover:text-white"
          target="_blank"
          rel="noopener noreferrer"
        >
          X
        </a>
      </nav>
    </footer>
  );
}
