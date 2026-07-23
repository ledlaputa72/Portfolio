import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { auth } from "@/auth";

function kvKey(userId: string) {
  return `lab-favorites:${userId}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ favorites: [] }, { status: 401 });
  }

  const stored = await kv.get<string[]>(kvKey(session.user.id));
  return NextResponse.json({ favorites: stored ?? [] });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { favorites?: unknown };
  const favorites = Array.isArray(body.favorites)
    ? (body.favorites as unknown[]).filter((s): s is string => typeof s === "string")
    : [];

  await kv.set(kvKey(session.user.id), favorites);
  return NextResponse.json({ favorites });
}
