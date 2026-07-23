import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/auth";

function kvKey(userId: string) {
  return `synapser-settings:${userId}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stored = await redis.get<string>(kvKey(session.user.id));
  if (!stored) return NextResponse.json({ state: null });
  try {
    const state = typeof stored === "string" ? JSON.parse(stored) : stored;
    return NextResponse.json({ state });
  } catch {
    return NextResponse.json({ state: null });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as { state?: unknown };
  if (!body.state) return NextResponse.json({ error: "Missing state" }, { status: 400 });
  await redis.set(kvKey(session.user.id), JSON.stringify(body.state));
  return NextResponse.json({ ok: true });
}
