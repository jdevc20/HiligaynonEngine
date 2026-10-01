import Link from "next/link";

const links = [
  { href: "/sentences", label: "Corpus" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/sentences/create", label: "Contribute" },
];

export function AppNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-sm">
            HIL
          </span>
          <span className="hidden text-zinc-900 sm:inline dark:text-zinc-100">
            Open Hiligaynon
          </span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
