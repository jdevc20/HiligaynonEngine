"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { useAuth } from "@/contexts/AuthContext";

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      await signIn(email.trim(), password);
      router.push("/sentences");
      router.refresh();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.details ||
          "Could not sign in with Hilitech Authentication."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <AppNav />
      <main className="mx-auto w-full max-w-md px-4 py-14 sm:px-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            Hilitech Authentication
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Guests may still contribute. Sign in to approve pending Hiligaynon
            contributions; Hilitech admins can verify approved records.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <label className="block text-sm font-semibold">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="h-11 w-full rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Signing in…" : "Sign in with Hilitech"}
            </button>
          </form>

          <div className="mt-5 border-t border-zinc-100 pt-4 text-sm text-zinc-500 dark:border-zinc-800">
            No account is required to submit a guest contribution.{" "}
            <Link href="/sentences/create" className="font-semibold text-blue-600">
              Contribute as guest
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
