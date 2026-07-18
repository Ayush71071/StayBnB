import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Sign up — StayBnB" };

export default function SignupPage() {
  return (
    <div className="grid min-h-[75vh] place-items-center bg-gradient-to-b from-rose-50/60 to-white px-4 py-12">
      <AuthForm mode="signup" />
    </div>
  );
}
