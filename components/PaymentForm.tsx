"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Lock, Loader2, ShieldCheck } from "lucide-react";
import { formatMoney } from "@/lib/utils";

export default function PaymentForm({
  bookingId,
  total,
}: {
  bookingId: string;
  total: number;
}) {
  const router = useRouter();
  const [card, setCard] = useState("4242 4242 4242 4242");
  const [exp, setExp] = useState("12/29");
  const [cvc, setCvc] = useState("133");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (card.replace(/\s/g, "").length < 15) {
      setError("Enter a valid card number.");
      return;
    }
    setLoading(true);
    try {
      // brief delay so the processing state is visible in mock mode
      await new Promise((r) => setTimeout(r, 1200));
      const res = await fetch(`/api/bookings/${bookingId}/pay`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment failed.");
      if (data.url) {
        // Stripe Checkout is configured — hand off to Stripe
        window.location.href = data.url;
        return;
      }
      router.push("/trips?booked=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={pay} className="max-w-md">
      <div className="overflow-hidden rounded-xl border border-gray-300">
        <div className="flex items-center gap-2 border-b border-gray-300 bg-gray-50 px-4 py-3">
          <CreditCard size={18} />
          <span className="text-sm font-semibold">Credit or debit card</span>
          <span className="ml-auto flex items-center gap-1 text-xs text-muted">
            <Lock size={12} /> Secure
          </span>
        </div>
        <div className="p-4">
          <label className="block text-xs font-bold">Card number</label>
          <input
            value={card}
            onChange={(e) => setCard(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold">Expiry</label>
              <input
                value={exp}
                onChange={(e) => setExp(e.target.value)}
                placeholder="MM/YY"
                autoComplete="off"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="block text-xs font-bold">CVC</label>
              <input
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                inputMode="numeric"
                autoComplete="off"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-ink"
              />
            </div>
          </div>
          <label className="mt-3 block text-xs font-bold">Name on card</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>
      </div>

      <p className="mt-3 flex items-start gap-2 text-xs text-muted">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-green-600" />
        Demo checkout — no real card is charged. With a Stripe test key in
        .env, this hands off to Stripe Checkout instead.
      </p>

      {error && <p className="mt-3 text-sm font-semibold text-brand-dark">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-dark py-3.5 font-bold text-white transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={17} className="animate-spin" /> Processing payment…
          </>
        ) : (
          <>Confirm and pay {formatMoney(total)}</>
        )}
      </button>
    </form>
  );
}
