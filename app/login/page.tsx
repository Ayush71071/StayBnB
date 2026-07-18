import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Log in — StayBnB" };

export default function LoginPage() {
  return (
    <div className="grid min-h-[75vh] place-items-center bg-gradient-to-b from-rose-50/60 to-white px-4 py-12">
      <AuthForm mode="login" />
    </div>
  );
}
