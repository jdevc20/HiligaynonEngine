"use client";

import { FormEvent, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { EngineService } from "@/services/engineService";
import type { DictionaryLexeme } from "@/types/engine";

export default function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<DictionaryLexeme[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (event?: FormEvent) => {
    event?.preventDefault();

    const value = query.trim();
    if (!value) return;

    try {
      setLoading(true);
      setError(null);
      const response = await EngineService.dictionary(value, "hil");
      setItems(response.items);
      setHasSearched(true);
    } catch (err) {
      console.error("Dictionary lookup failed:", err);
      setError("Dictionary lookup failed. The engine may still be starting or migrating.");
      setItems([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <AppNav />

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            Lexeme dictionary
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Search Hiligaynon words
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Search reusable dictionary entries backed by lexemes, senses, parts of
            speech, usage notes, and cross-language links.
          </p>
        </div>

        <form onSubmit={search} className="mt-8 flex gap-3">
          <label htmlFor="dictionary-query" className="sr-only">
            Hiligaynon word
          </label>
          <input
            id="dictionary-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try: gid, diin, balay, kaon..."
            className="h-12 min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="h-12 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-4">
          {items.map((entry) => (
            <article
              key={entry.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">{entry.lemma}</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.partOfSpeech && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                        {entry.partOfSpeech}
                      </span>
                    )}
                    {entry.register && (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                        {entry.register}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                  {entry.language.code}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {entry.senses.length > 0 ? (
                  entry.senses.map((sense, index) => (
                    <div
                      key={sense.id}
                      className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Sense {index + 1}
                      </p>
                      <p className="mt-1 font-medium">{sense.definition}</p>
                      {sense.gloss && (
                        <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                          Gloss: {sense.gloss}
                        </p>
                      )}
                      {sense.usageNote && (
                        <p className="mt-2 text-sm text-zinc-500">
                          {sense.usageNote}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">
                    This lexeme does not have a definition yet.
                  </p>
                )}
              </div>

              {(entry.outgoingTranslations.length > 0 ||
                entry.incomingTranslations.length > 0) && (
                <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Linked translations
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {entry.outgoingTranslations.map((link) => (
                      <span
                        key={link.id}
                        className="rounded-lg border border-zinc-200 px-2.5 py-1 text-sm dark:border-zinc-700"
                      >
                        {link.targetLexeme.lemma} · {link.targetLexeme.language.code}
                      </span>
                    ))}
                    {entry.incomingTranslations.map((link) => (
                      <span
                        key={link.id}
                        className="rounded-lg border border-zinc-200 px-2.5 py-1 text-sm dark:border-zinc-700"
                      >
                        {link.sourceLexeme.lemma} · {link.sourceLexeme.language.code}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}

          {hasSearched && !loading && !error && items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-700">
              <p className="font-semibold">No dictionary entry found.</p>
              <p className="mt-1 text-sm text-zinc-500">
                Try another spelling or contribute lexeme data through the engine.
              </p>
            </div>
          )}

          {!hasSearched && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              Dictionary results come from the normalized <strong>Lexeme</strong> and
              <strong> LexemeSense</strong> tables, not from scanning sentence text.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
