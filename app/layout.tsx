import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

export const metadata: Metadata = {
  title: "StayBnB — Find your next stay",
  description:
    "Book unique homes, cabins, villas and more around the world. A full-stack Airbnb clone.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <html lang="en" className={figtree.variable}>
      <body className="font-sans antialiased">
        <Header user={user} />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
