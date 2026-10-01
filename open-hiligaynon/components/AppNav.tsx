"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { href: "/sentences", label: "Corpus" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/datasets", label: "Datasets" },
  { href: "/sentences/create", label: "Contribute" },
];

export function AppNav() {
  const { session, loading, signOut } = useAuth();

  const displayName =
    session?.user.profile?.displayName ||
    session?.user.username ||
    session?.user.email;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-sm">
            HIL
          </span>
          <span className="hidden text-zinc-900 sm:inline dark:text-zinc-100">
            Open Hiligaynon
          </span>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-1">
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

          {!loading &&
            (session ? (
              <div className="ml-1 flex items-center gap-2 border-l border-zinc-200 pl-2 dark:border-zinc-800">
                <div className="hidden text-right md:block">
                  <p className="max-w-44 truncate text-xs font-semibold">{displayName}</p>
                  <p className="text-[10px] uppercase tracking-wide text-zinc-400">
                    Hilitech · {session.user.role}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="ml-1 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900"
              >
                Sign in
              </Link>
            ))}
        </div>
      </div>
    </header>
  );
}
