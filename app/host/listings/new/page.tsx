import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import NewListingForm from "@/components/NewListingForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create a listing — StayBnB" };

export default async function NewListingPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/host/listings/new");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Tell us about your place
      </h1>
      <p className="mt-1 text-sm text-muted">
        Fill in the details below and your listing goes live instantly.
      </p>
      <div className="mt-8">
        <NewListingForm />
      </div>
    </div>
  );
}
