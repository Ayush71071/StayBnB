import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="StayBnB home">
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 text-brand"
        fill="currentColor"
        aria-hidden
      >
        <path d="M16 2.5c1.4 0 2.7.8 3.4 2l9.1 16.9c.9 1.7 1 3.7.1 5.4a5.6 5.6 0 0 1-8.6 1.8L16 25.4l-3.9 3.2a5.6 5.6 0 0 1-8.6-1.8 5.9 5.9 0 0 1 .1-5.4L12.6 4.5a3.9 3.9 0 0 1 3.4-2Zm0 8.2c-2.5 3.2-4 5.8-4 7.8a4 4 0 1 0 8 0c0-2-1.5-4.6-4-7.8Z" />
      </svg>
      <span className="hidden text-xl font-extrabold tracking-tight text-brand sm:block">
        staybnb
      </span>
    </Link>
  );
}
