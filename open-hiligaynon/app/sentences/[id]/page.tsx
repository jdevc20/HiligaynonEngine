"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { SentenceService } from "@/services/sentenceService";
import { useAuth } from "@/contexts/AuthContext";
import { isHilitechAdmin } from "@/lib/auth";
import type { Sentence } from "@/types/sentence";

const sentimentName = (value: number) => {
  if (value === 2) return "Positive";
  if (value === 0) return "Negative";
  return "Neutral";
};

export default function TranslationDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const { session } = useAuth();
  const canVerify = isHilitechAdmin(session?.user.role);

  const [sentence, setSentence] = useState<Sentence | null>(null);
  const canEdit = Boolean(
    session && sentence && (sentence.status === "pending" || canVerify)
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [english, setEnglish] = useState("");
  const [hiligaynon, setHiligaynon] = useState("");
  const [sentiment, setSentiment] = useState(1);
  const [intent, setIntent] = useState("");
  const [domain, setDomain] = useState("");
  const [register, setRegister] = useState("");
  const [translationType, setTranslationType] = useState("natural");
  const [confidence, setConfidence] = useState("");
  const [notes, setNotes] = useState("");
  const [isSarcastic, setIsSarcastic] = useState(false);

  const hydrateForm = (data: Sentence) => {
    setEnglish(data.english);
    setHiligaynon(data.hiligaynon);
    setSentiment(data.sentiment);
    setIntent(data.intent ?? "");
    setDomain(data.domain ?? "");
    setRegister(data.register ?? "");
    setTranslationType(data.translationType || "natural");
    setConfidence(data.confidence === null ? "" : String(data.confidence));
    setNotes(data.notes ?? "");
    setIsSarcastic(data.isSarcastic);
  };

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await SentenceService.get(id);
        setSentence(data);
        hydrateForm(data);
      } catch (err) {
        console.error("Failed to load translation:", err);
        setError("Could not load this translation record.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const save = async (event: FormEvent) => {
    event.preventDefault();

    if (!canEdit) {
      setError(
        session
          ? "This contribution is locked after approval. Only a Hilitech admin can edit it."
          : "Sign in with Hilitech Authentication to edit a contribution."
      );
      return;
    }

    if (!sentence || !english.trim() || !hiligaynon.trim()) {
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
      setSaving(true);
      setError(null);

      const response = await SentenceService.update(sentence.id, {
        english: english.trim(),
        hiligaynon: hiligaynon.trim(),
        sentiment,
        intent: intent.trim() || null,
        domain: domain.trim() || null,
        register: register.trim() || null,
        translationType: translationType.trim() || "natural",
        confidence: parsedConfidence,
        notes: notes.trim() || null,
        isSarcastic,
      });

      if (response?.data) {
        setSentence(response.data);
        hydrateForm(response.data);
      }
    } catch (err) {
      console.error("Update failed:", err);
      setError("Could not save the translation changes.");
    } finally {
      setSaving(false);
    }
  };

  const vote = async (type: "UP" | "DOWN") => {
    if (!sentence) return;

    try {
      setVoting(true);
      const response = await SentenceService.vote({
        sentenceId: sentence.id,
        type,
      });

      if (response?.data) {
        setSentence(response.data);
        hydrateForm(response.data);
      }
    } catch (err) {
      console.error("Vote failed:", err);
    } finally {
      setVoting(false);
    }
  };

  const moderate = async (status: "approved" | "verified") => {
    if (!sentence || !session) return;

    try {
      setSaving(true);
      setError(null);
      const response = await SentenceService.moderate(sentence.id, status);

      if (response?.data) {
        setSentence(response.data);
        hydrateForm(response.data);
      }
    } catch (err: any) {
      console.error("Moderation failed:", err);
      setError(
        err?.response?.data?.details ||
          "Could not update the contribution moderation status."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950";

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
        <AppNav />
        <div className="mx-auto max-w-5xl px-4 py-20 text-center text-sm text-zinc-500">
          Loading translation and linguistic analysis…
        </div>
      </div>
    );
  }

  if (!sentence) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
        <AppNav />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-black">Translation unavailable</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {error ?? "The requested translation could not be found."}
          </p>
          <Link
            href="/sentences"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Return to corpus
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <AppNav />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/sentences"
              className="text-sm font-semibold text-blue-600 dark:text-blue-400"
            >
              ← Translation corpus
            </Link>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Translation record
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Inspect the translation relationship and its Hiligaynon linguistic
              annotations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => vote("UP")}
              disabled={voting}
              className="h-10 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 disabled:opacity-50 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              ▲ {sentence.upVotes}
            </button>
            <button
              onClick={() => vote("DOWN")}
              disabled={voting}
              className="h-10 rounded-lg border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 disabled:opacity-50 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
            >
              ▼ {sentence.downVotes}
            </button>
            {session && sentence.status === "pending" && (
              <button
                type="button"
                onClick={() => void moderate("approved")}
                disabled={saving}
                className="h-10 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                Approve
              </button>
            )}
            {canVerify && sentence.status === "approved" && (
              <button
                type="button"
                onClick={() => void moderate("verified")}
                disabled={saving}
                className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                Verify
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Source · {sentence.sourceLanguage}
              </p>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-500 dark:bg-zinc-800">
                English
              </span>
            </div>
            <p className="mt-5 text-2xl font-bold leading-relaxed">
              {sentence.english}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm dark:border-blue-900 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Target · {sentence.targetLanguage}
              </p>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                Hiligaynon
              </span>
            </div>
            <p className="mt-5 text-2xl font-black leading-relaxed text-blue-700 dark:text-blue-400">
              {sentence.hiligaynon}
            </p>
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Status", sentence.status],
            ["Contributor", sentence.contributorType === "registered" ? "Hilitech user" : "Guest"],
            ["Type", sentence.translationType || "natural"],
            ["Sentiment", sentimentName(sentence.sentiment)],
            [
              "Confidence",
              sentence.confidence === null
                ? "Not scored"
                : Math.round(sentence.confidence * 100) + "%",
            ],
            ["Intent", sentence.intent || "Not annotated"],
            ["Domain", sentence.domain || "Not annotated"],
            ["Register", sentence.register || "Not annotated"],
            ["Tone", sentence.isSarcastic ? "Sarcastic" : "Literal"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {label}
              </p>
              <p className="mt-1 text-sm font-semibold">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Target analysis
              </p>
              <h2 className="mt-1 text-xl font-black">
                Tokens and dictionary links
              </h2>
            </div>
            <p className="text-sm text-zinc-500">
              {sentence.tokens.length} annotated token
              {sentence.tokens.length === 1 ? "" : "s"}
            </p>
          </div>

          {sentence.tokens.length === 0 ? (
            <p className="mt-5 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500 dark:bg-zinc-950">
              No token annotations have been added to this text unit yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sentence.tokens.map((token) => (
                <div
                  key={token.id}
                  className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black">{token.text}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        token #{token.tokenOrder + 1}
                      </p>
                    </div>
                    {token.pos && (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                        {token.pos}
                      </span>
                    )}
                  </div>

                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-zinc-500">Lemma</dt>
                      <dd className="font-medium">
                        {token.lemma || "Unlinked"}
                      </dd>
                    </div>
                    {token.dependencyRelation && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-zinc-500">Dependency</dt>
                        <dd className="font-medium">
                          {token.dependencyRelation}
                        </dd>
                      </div>
                    )}
                    {token.isSlang && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-zinc-500">Usage</dt>
                        <dd className="font-medium">Slang</dd>
                      </div>
                    )}
                  </dl>

                  {token.senses.length > 0 && (
                    <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Dictionary sense
                      </p>
                      <p className="mt-1 text-sm">
                        {token.senses[0].gloss ||
                          token.senses[0].definition}
                      </p>
                    </div>
                  )}

                  {token.contextNote && (
                    <p className="mt-3 text-xs leading-5 text-zinc-500">
                      {token.contextNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Grammar layer
            </p>
            <h2 className="mt-1 text-xl font-black">Grammar annotations</h2>
          </div>

          {sentence.grammarAnnotations.length === 0 ? (
            <p className="mt-5 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500 dark:bg-zinc-950">
              No grammar annotations have been attached to this text unit yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {sentence.grammarAnnotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
                >
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold dark:bg-zinc-800">
                      {annotation.category}
                    </span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                      {annotation.label}
                    </span>
                  </div>
                  {annotation.value && (
                    <p className="mt-3 font-semibold">{annotation.value}</p>
                  )}
                  {annotation.notes && (
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {annotation.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Record editor
            </p>
            <h2 className="mt-1 text-xl font-black">
              Translation and semantic metadata
            </h2>
          </div>

          {!session && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              Sign in with Hilitech Authentication to edit this record. Guests can
              submit new contributions, but existing records are protected.
            </div>
          )}
          {session && !canEdit && (
            <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              This record is {sentence.status}. Registered users can edit only
              pending contributions. An admin must make later corrections.
            </div>
          )}
          {session && canVerify && sentence.status !== "pending" && (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              Admin edits to an approved or verified record reset it to Pending so
              the changed content must pass review again.
            </div>
          )}

          <form onSubmit={save} className="mt-5 space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-semibold">
                English source
                <textarea
                  rows={4}
                  value={english}
                  onChange={(event) => setEnglish(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold">
                Hiligaynon target
                <textarea
                  rows={4}
                  value={hiligaynon}
                  onChange={(event) => setHiligaynon(event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold">
                Intent
                <input
                  value={intent}
                  onChange={(event) => setIntent(event.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold">
                Domain
                <input
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold">
                Register
                <input
                  value={register}
                  onChange={(event) => setRegister(event.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="flex items-center gap-3 self-end rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold dark:border-zinc-700">
                <input
                  type="checkbox"
                  checked={isSarcastic}
                  onChange={(event) => setIsSarcastic(event.target.checked)}
                />
                Sarcastic
              </label>
            </div>

            <label className="block text-sm font-semibold">
              Notes
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={inputClass}
              />
            </label>

            <div className="flex flex-col gap-3 border-t border-zinc-100 pt-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-zinc-400">
                <p>Translation ID: {sentence.id}</p>
                <p>Target text unit: {sentence.targetTextId}</p>
              </div>
              <button
                type="submit"
                disabled={saving || !canEdit}
                className="h-11 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {!canEdit ? "Editing locked" : saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
