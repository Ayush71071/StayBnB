import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="text-center">
        <Compass size={48} className="mx-auto text-gray-300" />
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">
          This page is off the map
        </h1>
        <p className="mt-2 text-muted">
          We couldn&apos;t find what you were looking for.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-brand to-brand-dark px-6 py-3 text-sm font-bold text-white"
        >
          Back to exploring
        </Link>
      </div>
    </div>
  );
}
