import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { redis } from "@/lib/redis";
import { auth } from "@/auth";

type StoredModel = {
  meta: {
    fileName: string;
    savedAt: number;
    scale: number;
  };
  blobUrl: string;
};

function kvKey(userId: string, sceneId: string) {
  return `synapser-model-v2:${userId}:${sceneId}`;
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
  const stored = await redis.get<StoredModel>(kvKey(session.user.id, sceneId));
  if (!stored) return NextResponse.json({ model: null });
  return NextResponse.json({ model: stored });
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

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const metaRaw = formData.get("meta") as string | null;

  if (!file || !metaRaw) {
    return NextResponse.json({ error: "Missing file or meta" }, { status: 400 });
  }

  const meta = JSON.parse(metaRaw) as StoredModel["meta"];
  const blobPath = `synapser-models/${session.user.id}/${sceneId}.glb`;

  // Delete old blob if exists
  const old = await redis.get<StoredModel>(kvKey(session.user.id, sceneId));
  if (old?.blobUrl) {
    try { await del(old.blobUrl); } catch { /* ignore */ }
  }

  const { url: blobUrl } = await put(blobPath, file, {
    access: "public",
    allowOverwrite: true,
  });

  const stored: StoredModel = { meta, blobUrl };
  await redis.set(kvKey(session.user.id, sceneId), JSON.stringify(stored));
  return NextResponse.json({ ok: true, blobUrl });
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
  const stored = await redis.get<StoredModel>(kvKey(session.user.id, sceneId));
  if (stored?.blobUrl) {
    try { await del(stored.blobUrl); } catch { /* ignore */ }
  }
  await redis.del(kvKey(session.user.id, sceneId));
  return NextResponse.json({ ok: true });
}
