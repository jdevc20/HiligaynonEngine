"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/contexts/AuthContext";
import { isHilitechAdmin } from "@/lib/auth";
import { EngineService } from "@/services/engineService";
import type { GeneratedDatasetResult } from "@/types/engine";

export default function GenerateDatasetPage() {
  const { session, loading: authLoading } = useAuth();
  const isAdmin = isHilitechAdmin(session?.user.role);

  const [name, setName] = useState("Hiligaynon General Translation");
  const [version, setVersion] = useState("1.0");
  const [description, setDescription] = useState(
    "Verified English to Hiligaynon translation dataset."
  );
  const [license, setLicense] = useState("");
  const [domain, setDomain] = useState("");
  const [register, setRegister] = useState("");
  const [minConfidence, setMinConfidence] = useState("");
  const [maxItems, setMaxItems] = useState("10000");
  const [excludeSarcastic, setExcludeSarcastic] = useState(true);
  const [requireProvenance, setRequireProvenance] = useState(false);
  const [trainPercent, setTrainPercent] = useState("80");
  const [validationPercent, setValidationPercent] = useState("10");
  const [testPercent, setTestPercent] = useState("10");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GeneratedDatasetResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const splitTotal = useMemo(
    () =>
      Number(trainPercent || 0) +
      Number(validationPercent || 0) +
      Number(testPercent || 0),
    [trainPercent, validationPercent, testPercent]
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!isAdmin) return;

    if (Math.abs(splitTotal - 100) > 0.0001) {
      setError("Train, validation, and test percentages must total 100%.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setResult(null);

      const generated = await EngineService.generateDataset({
        name: name.trim(),
        version: version.trim(),
        description: description.trim() || null,
        license: license.trim() || null,
        domain: domain.trim() || undefined,
        register: register.trim() || undefined,
        minConfidence:
          minConfidence.trim() === ""
            ? undefined
            : Number(minConfidence),
        maxItems: Number(maxItems),
        excludeSarcastic,
        requireProvenance,
        trainPercent: Number(trainPercent),
        validationPercent: Number(validationPercent),
        testPercent: Number(testPercent),
      });

      setResult(generated);
    } catch (err: any) {
      console.error("Dataset generation failed:", err);
      setError(
        err?.response?.data?.details ||
          "Dataset generation failed. Check the filters and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
        <AppNav />
        <main className="mx-auto w-full max-w-5xl px-4 py-20 text-center text-sm text-zinc-500">
          Checking Hilitech admin access…
        </main>
      </div>
    );
  }

  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
        <AppNav />
        <main className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              Admin-only operation
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Dataset generation restricted
            </h1>
            <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
              Only Hilitech ADMIN or SUPER_ADMIN accounts can generate dataset
              versions. Dataset inspection and export remain separate from this
              privileged generation action.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {!session && (
                <Link
                  href="/sign-in"
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
                >
                  Sign in with Hilitech
                </Link>
              )}
              <Link
                href="/datasets"
                className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold dark:border-zinc-700"
              >
                Back to datasets
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <AppNav />

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Admin · Dataset builder
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
              Generate dataset
            </h1>
            <p className="mt-3 max-w-3xl text-zinc-600 dark:text-zinc-400">
              Build a versioned training dataset from verified English →
              Hiligaynon translations. Split membership is written to
              DatasetItem so later exports remain reproducible.
            </p>
          </div>

          <Link
            href="/datasets"
            className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            Back to dataset inspector
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Eligibility
            </p>
            <p className="mt-1 font-bold">Verified only</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Languages
            </p>
            <p className="mt-1 font-bold">English → Hiligaynon</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Triggered by
            </p>
            <p className="mt-1 truncate font-bold">
              {session.user.profile?.displayName ||
                session.user.username ||
                session.user.email}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-black">Dataset identity</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="text-sm font-semibold">
                Dataset name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold">
                Version
                <input
                  value={version}
                  onChange={(event) => setVersion(event.target.value)}
                  placeholder="1.0"
                  required
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold md:col-span-2">
                Description
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>

              <label className="text-sm font-semibold md:col-span-2">
                Dataset/license note
                <input
                  value={license}
                  onChange={(event) => setLicense(event.target.value)}
                  placeholder="e.g. CC BY 4.0, internal research, review required"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-black">Eligibility filters</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Status is permanently restricted to Verified for generated
              training datasets.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm font-semibold">
                Domain
                <input
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  placeholder="All domains"
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold">
                Register
                <input
                  value={register}
                  onChange={(event) => setRegister(event.target.value)}
                  placeholder="All registers"
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold">
                Minimum confidence
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={minConfidence}
                  onChange={(event) => setMinConfidence(event.target.value)}
                  placeholder="No minimum"
                  className={inputClass}
                />
              </label>

              <label className="text-sm font-semibold">
                Maximum records
                <input
                  type="number"
                  min="1"
                  max="100000"
                  step="1"
                  value={maxItems}
                  onChange={(event) => setMaxItems(event.target.value)}
                  required
                  className={inputClass}
                />
              </label>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 text-sm font-semibold dark:border-zinc-700">
                <input
                  type="checkbox"
                  checked={excludeSarcastic}
                  onChange={(event) => setExcludeSarcastic(event.target.checked)}
                />
                Exclude sarcastic translations
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-zinc-200 p-4 text-sm font-semibold dark:border-zinc-700">
                <input
                  type="checkbox"
                  checked={requireProvenance}
                  onChange={(event) => setRequireProvenance(event.target.checked)}
                />
                Require at least one provenance source
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-black">Train / validation / test</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  These assignments are stored and do not change when the
                  dataset is exported later.
                </p>
              </div>
              <span
                className={
                  "rounded-full px-3 py-1 text-xs font-bold " +
                  (Math.abs(splitTotal - 100) < 0.0001
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300")
                }
              >
                Total {splitTotal}%
              </span>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <label className="text-sm font-semibold">
                Train %
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={trainPercent}
                  onChange={(event) => setTrainPercent(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold">
                Validation %
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={validationPercent}
                  onChange={(event) => setValidationPercent(event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold">
                Test %
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={testPercent}
                  onChange={(event) => setTestPercent(event.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                submitting ||
                !name.trim() ||
                !version.trim() ||
                Math.abs(splitTotal - 100) > 0.0001
              }
              className="h-12 rounded-xl bg-blue-600 px-7 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Generating dataset…" : "Generate dataset"}
            </button>
          </div>
        </form>

        {result && (
          <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Dataset generated
            </p>
            <h2 className="mt-1 text-2xl font-black">
              {result.dataset.name} · v{result.dataset.version}
            </h2>
            <p className="mt-2 text-sm text-emerald-900/80 dark:text-emerald-100/80">
              {result.count} verified translation
              {result.count === 1 ? "" : "s"} were frozen into this version.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white/80 p-4 dark:bg-zinc-900/70">
                <p className="text-xs uppercase tracking-wider text-zinc-400">Train</p>
                <p className="mt-1 text-xl font-black">{result.splits.train}</p>
              </div>
              <div className="rounded-xl bg-white/80 p-4 dark:bg-zinc-900/70">
                <p className="text-xs uppercase tracking-wider text-zinc-400">
                  Validation
                </p>
                <p className="mt-1 text-xl font-black">
                  {result.splits.validation}
                </p>
              </div>
              <div className="rounded-xl bg-white/80 p-4 dark:bg-zinc-900/70">
                <p className="text-xs uppercase tracking-wider text-zinc-400">Test</p>
                <p className="mt-1 text-xl font-black">{result.splits.test}</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-emerald-200/80 bg-white/70 p-4 text-sm dark:border-emerald-900 dark:bg-zinc-950/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Dataset ID
              </p>
              <code className="mt-1 block break-all font-semibold">
                {result.dataset.id}
              </code>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={"/datasets?datasetId=" + encodeURIComponent(result.dataset.id)}
                className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white"
              >
                Inspect generated dataset
              </Link>
              <Link
                href="/sentences?status=verified"
                className="rounded-xl border border-emerald-300 px-5 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-800 dark:text-emerald-200"
              >
                View verified corpus
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
