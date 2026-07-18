import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { name, email, password } = await req.json().catch(() => ({}));

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 }
    );
  }

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  const user = await db.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 10),
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
    },
  });

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
