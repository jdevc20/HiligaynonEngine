"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { SentenceService } from "@/services/sentenceService";
import type { Sentence } from "@/types/sentence";

const getVisiblePages = (current: number, total: number) => {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 3) return [1, 2, 3, 4, "...", total];
  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
};

const sentimentLabel = (value: number) => {
  if (value === 2) return "Positive";
  if (value === 0) return "Negative";
  return "Neutral";
};

const sentimentClass = (value: number) => {
  if (value === 2) {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
  }
  if (value === 0) {
    return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
  }
  return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300";
};

const statusClass = (status: Sentence["status"]) => {
  if (status === "verified" || status === "approved") {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
  }
  if (status === "rejected") {
    return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
  }
  return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
};

export default function SentencesPage() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [sarcasmFilter, setSarcasmFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 24;
  const [meta, setMeta] = useState({ total: 0, skip: 0, take: limit });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [sentimentFilter, sarcasmFilter, statusFilter]);

  const loadSentences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await SentenceService.list({
        page,
        limit,
        search: debouncedSearch || undefined,
        sentiment:
          sentimentFilter === "all"
            ? undefined
            : Number.parseInt(sentimentFilter, 10),
        isSarcastic:
          sarcasmFilter === "all"
            ? undefined
            : sarcasmFilter === "true",
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      setSentences(Array.isArray(response.items) ? response.items : []);
      setMeta(response.meta ?? { total: 0, skip: 0, take: limit });
      setSelectedIds([]);
    } catch (err) {
      console.error("Failed to fetch corpus:", err);
      setError(
        "Could not load the translation corpus. The API may still be starting or migrating."
      );
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    debouncedSearch,
    sentimentFilter,
    sarcasmFilter,
    statusFilter,
  ]);

  useEffect(() => {
    loadSentences();
  }, [loadSentences]);

  const totalPages = Math.max(1, Math.ceil(meta.total / limit));
  const pageNumbers = useMemo(
    () => getVisiblePages(page, totalPages),
    [page, totalPages]
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === sentences.length && sentences.length > 0) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(sentences.map((sentence) => sentence.id));
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this translation record?")) return;

    try {
      setDeletingId(id);
      await SentenceService.remove(id);
      await loadSentences();
    } catch (err) {
      console.error("Delete failed:", err);
      window.alert("Could not delete the translation.");
    } finally {
      setDeletingId(null);
    }
  };

  const removeSelected = async () => {
    if (
      selectedIds.length === 0 ||
      !window.confirm("Delete " + selectedIds.length + " selected translations?")
    ) {
      return;
    }

    try {
      setBulkDeleting(true);
      await SentenceService.removeBulk(selectedIds);
      await loadSentences();
    } catch (err) {
      console.error("Bulk delete failed:", err);
      window.alert("Could not delete the selected translations.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const vote = async (sentenceId: string, type: "UP" | "DOWN") => {
    try {
      setVotingId(sentenceId + "-" + type);
      const response = await SentenceService.vote({ sentenceId, type });

      if (response?.data) {
        setSentences((current) =>
          current.map((sentence) =>
            sentence.id === sentenceId ? response.data : sentence
          )
        );
      }
    } catch (err) {
      console.error("Vote failed:", err);
    } finally {
      setVotingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <AppNav />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <header className="flex flex-col gap-5 border-b border-zinc-200 pb-6 dark:border-zinc-800 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Parallel corpus
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">
              Translation Corpus
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {loading
                ? "Loading corpus…"
                : meta.total + " English → Hiligaynon translation records"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={removeSelected}
                disabled={bulkDeleting}
                className="h-10 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              >
                {bulkDeleting
                  ? "Deleting…"
                  : "Delete selected (" + selectedIds.length + ")"}
              </button>
            )}
            <Link
              href="/dictionary"
              className="inline-flex h-10 items-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-semibold transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              Dictionary
            </Link>
            <Link
              href="/sentences/create"
              className="inline-flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Add translation
            </Link>
          </div>
        </header>

        <section className="mt-6 grid gap-2 md:grid-cols-[minmax(260px,1fr)_180px_180px_190px]">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search English or Hiligaynon…"
            className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <select
            value={sentimentFilter}
            onChange={(event) => setSentimentFilter(event.target.value)}
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="all">All sentiment</option>
            <option value="2">Positive</option>
            <option value="1">Neutral</option>
            <option value="0">Negative</option>
          </select>
          <select
            value={sarcasmFilter}
            onChange={(event) => setSarcasmFilter(event.target.value)}
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="all">All tone</option>
            <option value="false">Literal</option>
            <option value="true">Sarcastic</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </section>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
            <input
              type="checkbox"
              checked={
                sentences.length > 0 &&
                selectedIds.length === sentences.length
              }
              onChange={toggleAll}
              aria-label="Select all translations on this page"
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Select page
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-zinc-500">
              Loading structured corpus…
            </div>
          ) : sentences.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-semibold">No translations found.</p>
              <p className="mt-1 text-sm text-zinc-500">
                Adjust the filters or add a new translation record.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {sentences.map((sentence) => (
                <article
                  key={sentence.id}
                  className="grid gap-4 p-5 lg:grid-cols-[24px_minmax(0,1fr)_260px] lg:items-center"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(sentence.id)}
                    onChange={() => toggleSelection(sentence.id)}
                    aria-label={"Select " + sentence.english}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      <span>{sentence.sourceLanguage || "en"}</span>
                      <span>→</span>
                      <span>{sentence.targetLanguage || "hil"}</span>
                      <span>·</span>
                      <span>{sentence.translationType || "natural"}</span>
                    </div>

                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <div>
                        <p className="truncate font-semibold">{sentence.english}</p>
                        <p className="mt-0.5 text-xs text-zinc-400">Source</p>
                      </div>
                      <div>
                        <p className="truncate font-bold text-blue-700 dark:text-blue-400">
                          {sentence.hiligaynon}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-400">Target</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={
                          "rounded-full px-2.5 py-1 text-xs font-semibold " +
                          statusClass(sentence.status)
                        }
                      >
                        {sentence.status}
                      </span>
                      <span
                        className={
                          "rounded-full px-2.5 py-1 text-xs font-semibold " +
                          sentimentClass(sentence.sentiment)
                        }
                      >
                        {sentimentLabel(sentence.sentiment)}
                      </span>
                      {sentence.intent && (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {sentence.intent}
                        </span>
                      )}
                      {sentence.domain && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          {sentence.domain}
                        </span>
                      )}
                      {sentence.confidence !== null && (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {Math.round(sentence.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
                    <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-950">
                      <button
                        onClick={() => vote(sentence.id, "UP")}
                        disabled={votingId !== null}
                        className="rounded-md px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-white disabled:opacity-40 dark:text-emerald-300 dark:hover:bg-zinc-900"
                      >
                        ▲ {sentence.upVotes}
                      </button>
                      <button
                        onClick={() => vote(sentence.id, "DOWN")}
                        disabled={votingId !== null}
                        className="rounded-md px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-white disabled:opacity-40 dark:text-rose-300 dark:hover:bg-zinc-900"
                      >
                        ▼ {sentence.downVotes}
                      </button>
                    </div>

                    <Link
                      href={"/sentences/" + sentence.id}
                      className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Inspect
                    </Link>
                    <button
                      onClick={() => remove(sentence.id)}
                      disabled={deletingId === sentence.id}
                      className="text-sm font-medium text-zinc-400 transition hover:text-red-600 disabled:opacity-40"
                    >
                      {deletingId === sentence.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-zinc-500">
            Page {page} of {totalPages}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={page === 1}
              className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900"
            >
              Previous
            </button>

            <div className="hidden gap-1 sm:flex">
              {pageNumbers.map((item, index) =>
                item === "..." ? (
                  <span
                    key={"ellipsis-" + index}
                    className="grid h-9 w-9 place-items-center text-zinc-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item as number)}
                    className={
                      "h-9 w-9 rounded-lg text-sm font-semibold " +
                      (page === item
                        ? "bg-blue-600 text-white"
                        : "border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900")
                    }
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
              disabled={page >= totalPages}
              className="h-9 rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900"
            >
              Next
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
