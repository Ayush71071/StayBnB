"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

function AuthFormInner({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "signup" ? { name, email, password } : { email, password }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("password123");
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.08)]">
      <h1 className="text-2xl font-extrabold tracking-tight">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {mode === "login"
          ? "Log in to book stays and manage your listings."
          : "Join StayBnB to book stays or host your home."}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <div>
            <label className="mb-1 block text-sm font-semibold">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Jane Doe"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-ink"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-ink"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === "signup" ? 8 : undefined}
            placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-ink"
          />
        </div>

        {error && <p className="text-sm font-semibold text-brand-dark">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-dark py-3.5 font-bold text-white transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
        >
          {loading && <Loader2 size={17} className="animate-spin" />}
          {mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      {mode === "login" && (
        <div className="mt-5 rounded-xl bg-rose-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-dark">
            Demo accounts
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => fillDemo("guest@staybnb.com")}
              className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold hover:border-brand"
            >
              Guest — guest@staybnb.com
            </button>
            <button
              onClick={() => fillDemo("host@staybnb.com")}
              className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold hover:border-brand"
            >
              Host — host@staybnb.com
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">Password: password123</p>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            New to StayBnB?{" "}
            <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-bold text-ink underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-ink underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  return (
    <Suspense>
      <AuthFormInner mode={mode} />
    </Suspense>
  );
}
