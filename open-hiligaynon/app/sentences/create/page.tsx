"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { SentenceService } from "@/services/sentenceService";
import type { TranslationStatus } from "@/types/sentence";

export default function CreateSentencePage() {
  const router = useRouter();

  const [english, setEnglish] = useState("");
  const [hiligaynon, setHiligaynon] = useState("");
  const [status, setStatus] = useState<TranslationStatus>("pending");
  const [sentiment, setSentiment] = useState(1);
  const [intent, setIntent] = useState("");
  const [domain, setDomain] = useState("");
  const [register, setRegister] = useState("");
  const [translationType, setTranslationType] = useState("natural");
  const [confidence, setConfidence] = useState("");
  const [notes, setNotes] = useState("");
  const [isSarcastic, setIsSarcastic] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!english.trim() || !hiligaynon.trim()) {
      setError("English and Hiligaynon text are required.");
      return;
    }

    const parsedConfidence =
      confidence.trim() === "" ? null : Number.parseFloat(confidence);

    if (
      parsedConfidence !== null &&
      (Number.isNaN(parsedConfidence) ||
        parsedConfidence < 0 ||
        parsedConfidence > 1)
    ) {
      setError("Confidence must be between 0 and 1.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await SentenceService.create({
        english: english.trim(),
        hiligaynon: hiligaynon.trim(),
        status,
        sentiment,
        intent: intent.trim() || null,
        domain: domain.trim() || null,
        register: register.trim() || null,
        translationType: translationType.trim() || "natural",
        confidence: parsedConfidence,
        notes: notes.trim() || null,
        isSarcastic,
      });

      const id = response?.data?.id;
      router.push(id ? "/sentences/" + id : "/sentences");
      router.refresh();
    } catch (err) {
      console.error("Create translation failed:", err);
      setError("Could not save the translation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950";

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <AppNav />

      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-3 border-b border-zinc-200 pb-6 dark:border-zinc-800 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Corpus contribution
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">
              Add translation record
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Add the translation plus semantic metadata that can later support
              grammar analysis, review, and model-training datasets.
            </p>
          </div>
          <Link
            href="/sentences"
            className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Back to corpus
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-bold">Translation pair</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="text-sm font-semibold">
                English source
                <textarea
                  value={english}
                  onChange={(event) => setEnglish(event.target.value)}
                  rows={4}
                  placeholder="Where are you going?"
                  className={inputClass}
                  required
                />
              </label>
              <label className="text-sm font-semibold">
                Hiligaynon target
                <textarea
                  value={hiligaynon}
                  onChange={(event) => setHiligaynon(event.target.value)}
                  rows={4}
                  placeholder="Diin ka makadto?"
                  className={inputClass}
                  required
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-bold">Linguistic metadata</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-semibold">
                Verification status
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as TranslationStatus)
                  }
                  className={inputClass}
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>

              <label className="text-sm font-semibold">
                Sentiment
                <select
                  value={sentiment}
                  onChange={(event) =>
                    setSentiment(Number.parseInt(event.target.value, 10))
                  }
                  className={inputClass}
                >
                  <option value={0}>Negative</option>
                  <option value={1}>Neutral</option>
                  <option value={2}>Positive</option>
                </select>
              </label>

              <label className="text-sm font-semibold">
                Translation type
                <input
                  value={translationType}
                  onChange={(event) => setTranslationType(event.target.value)}
                  placeholder="natural"
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold">
                Intent
                <input
                  value={intent}
                  onChange={(event) => setIntent(event.target.value)}
                  placeholder="location_question"
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold">
                Domain
                <input
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  placeholder="daily_life"
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold">
                Register
                <input
                  value={register}
                  onChange={(event) => setRegister(event.target.value)}
                  placeholder="neutral, formal, colloquial…"
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold">
                Confidence
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={confidence}
                  onChange={(event) => setConfidence(event.target.value)}
                  placeholder="0.95"
                  className={inputClass}
                />
              </label>

              <label className="flex items-center gap-3 self-end rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-zinc-700">
                <input
                  type="checkbox"
                  checked={isSarcastic}
                  onChange={(event) => setIsSarcastic(event.target.checked)}
                />
                Mark as sarcastic
              </label>
            </div>

            <label className="mt-5 block text-sm font-semibold">
              Notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Translation nuance, dialect note, review context…"
                className={inputClass}
              />
            </label>
          </section>

          <div className="flex justify-end gap-3">
            <Link
              href="/sentences"
              className="inline-flex h-11 items-center rounded-xl border border-zinc-300 bg-white px-5 text-sm font-semibold dark:border-zinc-700 dark:bg-zinc-900"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save translation"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
