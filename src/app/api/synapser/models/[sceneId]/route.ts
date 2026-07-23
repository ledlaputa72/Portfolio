import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { auth } from "@/auth";

// Upstash free tier REST API has a ~1 MB payload limit.
// Base64 adds ~33%, so cap binary at 700 KB to stay safe.
const MAX_BYTES = 700 * 1024;

function kvKey(userId: string, sceneId: string) {
  return `synapser-model:${userId}:${sceneId}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sceneId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { sceneId } = await params;
  const stored = await redis.get<string>(kvKey(session.user.id, sceneId));
  if (!stored) return NextResponse.json({ model: null });
  try {
    const model = typeof stored === "string" ? JSON.parse(stored) : stored;
    return NextResponse.json({ model });
  } catch {
    return NextResponse.json({ model: null });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sceneId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { sceneId } = await params;
  const body = (await request.json()) as { meta?: unknown; data?: string };
  if (!body.meta || typeof body.data !== "string") {
    return NextResponse.json({ error: "Missing meta or data" }, { status: 400 });
  }
  // Check decoded size before storing
  const byteLen = Math.floor(body.data.length * 0.75);
  if (byteLen > MAX_BYTES) {
    return NextResponse.json({ error: "Model too large for cloud sync (max 700 KB)" }, { status: 413 });
  }
  await redis.set(kvKey(session.user.id, sceneId), JSON.stringify({ meta: body.meta, data: body.data }));
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sceneId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { sceneId } = await params;
  await redis.del(kvKey(session.user.id, sceneId));
  return NextResponse.json({ ok: true });
}
