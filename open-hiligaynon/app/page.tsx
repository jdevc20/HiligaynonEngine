import Link from "next/link";
import { AppNav } from "@/components/AppNav";

const capabilities = [
  {
    title: "Translation corpus",
    description:
      "Review English ↔ Hiligaynon pairs with verification, confidence, voting, and semantic metadata.",
    href: "/sentences",
    action: "Browse corpus",
  },
  {
    title: "Dictionary layer",
    description:
      "Search reusable Hiligaynon lexemes, definitions, glosses, parts of speech, and linked meanings.",
    href: "/dictionary",
    action: "Open dictionary",
  },
  {
    title: "Grammar analysis",
    description:
      "Inspect tokenization, lemmas, parts of speech, contextual notes, and grammar annotations per text unit.",
    href: "/sentences",
    action: "Inspect records",
  },
  {
    title: "Training-ready data",
    description:
      "The backend separates corpus records, provenance, annotations, and dataset splits for model-training workflows.",
    href: "/datasets",
    action: "Inspect datasets",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <AppNav />

      <main>
        <section className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300">
                Hiligaynon linguistic data engine
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
                Build better Hiligaynon language data.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                Open Hiligaynon organizes translations, dictionary entries, token
                annotations, grammar metadata, provenance, and training datasets in
                one structured engine.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/sentences"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Explore translation corpus
                </Link>
                <Link
                  href="/dictionary"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  Search dictionary
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Example record
                  </p>
                  <p className="mt-1 font-semibold">English → Hiligaynon</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  Structured
                </span>
              </div>

              <div className="space-y-5 py-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">English</p>
                  <p className="mt-1 text-lg font-semibold">Where are you going?</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Hiligaynon</p>
                  <p className="mt-1 text-xl font-bold text-blue-700 dark:text-blue-400">
                    Diin ka makadto?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 pt-5 text-sm dark:border-zinc-800">
                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
                  <p className="text-xs text-zinc-500">Intent</p>
                  <p className="mt-1 font-medium">location_question</p>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-950">
                  <p className="text-xs text-zinc-500">Analysis</p>
                  <p className="mt-1 font-medium">Tokens + grammar</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              One corpus, several workflows
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Designed for language work, not just sentence storage
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {capabilities.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-800"
              >
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 leading-6 text-zinc-600 dark:text-zinc-400">
                  {item.description}
                </p>
                <p className="mt-5 text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {item.action} <span aria-hidden="true">→</span>
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
