import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { auth } from "@/auth";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function kvKey(userId: string) {
  return `lab-favorites:${userId}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ favorites: [] }, { status: 401 });
  }

  const stored = await redis.get<string[]>(kvKey(session.user.id));
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

  await redis.set(kvKey(session.user.id), favorites);
  return NextResponse.json({ favorites });
}
