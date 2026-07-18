import { Globe } from "lucide-react";

const COLS: [string, string[]][] = [
  ["Support", ["Help Centre", "AirCover", "Anti-discrimination", "Disability support", "Cancellation options"]],
  ["Hosting", ["Host your home", "Hosting resources", "Community forum", "Hosting responsibly", "Join a free class"]],
  ["StayBnB", ["About this project", "Careers", "Investors", "Gift cards", "New features"]],
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {COLS.map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-sm font-bold">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l}>
                    <span className="cursor-pointer text-sm text-muted hover:underline">
                      {l}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-gray-200 pt-6 text-sm text-muted sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} StayBnB · A full-stack Airbnb clone built
            with Next.js, Prisma &amp; Stripe
          </p>
          <span className="flex items-center gap-1.5 font-semibold text-ink">
            <Globe size={15} /> English (US) · $ USD
          </span>
        </div>
      </div>
    </footer>
  );
}
