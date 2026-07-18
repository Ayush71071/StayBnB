"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Menu, Globe } from "lucide-react";
import Logo from "./Logo";

type User = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
} | null;

function SearchPill() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [checkIn, setCheckIn] = useState(params.get("checkIn") ?? "");
  const [checkOut, setCheckOut] = useState(params.get("checkOut") ?? "");
  const [guests, setGuests] = useState(params.get("guests") ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (checkIn) p.set("checkIn", checkIn);
    if (checkOut) p.set("checkOut", checkOut);
    if (guests) p.set("guests", guests);
    router.push(`/?${p.toString()}#stays`);
  }

  return (
    <form
      onSubmit={submit}
      className="hidden md:flex items-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <label className="flex flex-col px-6 py-2">
        <span className="text-[11px] font-bold">Where</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search destinations"
          className="w-36 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </label>
      <div className="h-8 w-px bg-gray-200" />
      <label className="flex flex-col px-4 py-2">
        <span className="text-[11px] font-bold">Check in</span>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="w-[8.2rem] bg-transparent text-sm text-gray-600 outline-none"
        />
      </label>
      <div className="h-8 w-px bg-gray-200" />
      <label className="flex flex-col px-4 py-2">
        <span className="text-[11px] font-bold">Check out</span>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="w-[8.2rem] bg-transparent text-sm text-gray-600 outline-none"
        />
      </label>
      <div className="h-8 w-px bg-gray-200" />
      <label className="flex flex-col py-2 pl-4 pr-2">
        <span className="text-[11px] font-bold">Who</span>
        <input
          type="number"
          min={1}
          max={16}
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          placeholder="Add guests"
          className="w-20 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </label>
      <button
        type="submit"
        aria-label="Search"
        className="m-1.5 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-r from-brand to-brand-dark text-white transition hover:brightness-105 active:scale-95"
      >
        <Search size={17} strokeWidth={2.5} />
      </button>
    </form>
  );
}

export default function Header({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Logo />

        <Suspense>
          <SearchPill />
        </Suspense>

        <div className="flex items-center gap-1">
          <Link
            href={user ? "/host" : "/login?next=/host"}
            className="hidden rounded-full px-4 py-2.5 text-sm font-semibold hover:bg-gray-100 lg:block"
          >
            Switch to hosting
          </Link>
          <button
            aria-label="Language"
            className="hidden rounded-full p-2.5 hover:bg-gray-100 lg:grid place-items-center"
          >
            <Globe size={17} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2.5 rounded-full border border-gray-200 py-1.5 pl-3 pr-1.5 shadow-sm transition hover:shadow-md"
              aria-label="Account menu"
            >
              <Menu size={16} />
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={30}
                  height={30}
                  className="rounded-full"
                />
              ) : (
                <span className="grid h-[30px] w-[30px] place-items-center rounded-full bg-gray-700 text-xs font-bold text-white">
                  {user ? user.name[0].toUpperCase() : "?"}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-xl">
                {user ? (
                  <>
                    <div className="border-b border-gray-100 px-4 py-2.5">
                      <p className="text-sm font-bold">{user.name}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                    <MenuLink href="/trips" onClick={() => setOpen(false)}>
                      My trips
                    </MenuLink>
                    <MenuLink href="/host" onClick={() => setOpen(false)}>
                      Host dashboard
                    </MenuLink>
                    <MenuLink href="/host/listings/new" onClick={() => setOpen(false)}>
                      Create a listing
                    </MenuLink>
                    <div className="my-1.5 border-t border-gray-100" />
                    <button
                      onClick={logout}
                      className="block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <MenuLink href="/signup" onClick={() => setOpen(false)} bold>
                      Sign up
                    </MenuLink>
                    <MenuLink href="/login" onClick={() => setOpen(false)}>
                      Log in
                    </MenuLink>
                    <div className="my-1.5 border-t border-gray-100" />
                    <MenuLink href="/login?next=/host" onClick={() => setOpen(false)}>
                      Host your home
                    </MenuLink>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuLink({
  href,
  children,
  onClick,
  bold,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  bold?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-2.5 text-sm hover:bg-gray-50 ${bold ? "font-bold" : ""}`}
    >
      {children}
    </Link>
  );
}
