"use client";

import { FormEvent, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { EngineService } from "@/services/engineService";
import type { DatasetExportResponse } from "@/types/engine";

export default function DatasetsPage() {
  const [datasetId, setDatasetId] = useState("");
  const [split, setSplit] = useState("");
  const [result, setResult] = useState<DatasetExportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDataset = async (event: FormEvent) => {
    event.preventDefault();

    const id = datasetId.trim();
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await EngineService.exportDataset(
        id,
        split.trim() || undefined
      );
      setResult(response);
    } catch (err) {
      console.error("Dataset export failed:", err);
      setResult(null);
      setError(
        "Dataset could not be loaded. Check the dataset ID and whether it has been created in the engine."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <AppNav />

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            Model-training data
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Dataset export inspector
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Inspect an explicit dataset and optional split. This UI reads the same
            normalized source/target text, annotations, provenance, and split
            membership used by the training-data export API.
          </p>
        </div>

        <form
          onSubmit={loadDataset}
          className="mt-8 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-[1fr_180px_auto]"
        >
          <label className="text-sm font-semibold">
            Dataset ID
            <input
              value={datasetId}
              onChange={(event) => setDatasetId(event.target.value)}
              placeholder="e.g. sample-dataset-v1"
              className="mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>

          <label className="text-sm font-semibold">
            Split
            <select
              value={split}
              onChange={(event) => setSplit(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="">All splits</option>
              <option value="train">Train</option>
              <option value="validation">Validation</option>
              <option value="test">Test</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={loading || !datasetId.trim()}
            className="mt-auto h-11 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load dataset"}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {result && (
          <section className="mt-6 space-y-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Dataset
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  {result.dataset.name}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Version {result.dataset.version}
                </p>
                {result.dataset.description && (
                  <p className="mt-4 leading-6 text-zinc-600 dark:text-zinc-400">
                    {result.dataset.description}
                  </p>
                )}
              </div>

              <div className="grid min-w-[220px] grid-cols-2 gap-3">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Split
                  </p>
                  <p className="mt-2 font-black">{result.split}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Records
                  </p>
                  <p className="mt-2 font-black">{result.count}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <h3 className="font-bold">Export records</h3>
              </div>

              {result.items.length === 0 ? (
                <p className="p-8 text-center text-sm text-zinc-500">
                  This dataset/split currently has no records.
                </p>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {result.items.map((item) => (
                    <article key={item.id} className="p-5">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                          {item.split}
                        </span>
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {item.translationType}
                        </span>
                        <span className="text-zinc-400">
                          weight {item.weight}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            {item.source.language}
                          </p>
                          <p className="mt-1 font-semibold">{item.source.text}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                            {item.target.language}
                          </p>
                          <p className="mt-1 font-bold text-blue-700 dark:text-blue-400">
                            {item.target.text}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
                        <span>{item.target.tokens.length} tokens</span>
                        <span>{item.target.grammar.length} grammar annotations</span>
                        <span>{item.provenance.length} provenance source(s)</span>
                        {item.confidence !== null && (
                          <span>
                            {Math.round(item.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
