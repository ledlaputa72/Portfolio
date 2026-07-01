import { DEFAULT_SCENE_DEFINITIONS } from "./synapser-project-state";

export type SynapserSceneId = string;

export type SynapserModelMeta = {
  fileName: string;
  savedAt: number;
  scale: number;
};

export type SynapserSceneMetaMap = Partial<Record<SynapserSceneId, SynapserModelMeta>>;

export const SYNAPSER_SCENES = DEFAULT_SCENE_DEFINITIONS;

const META_KEY = "synapser-model-meta-v2";
const LEGACY_META_KEY = "synapser-model-meta";
const DB_NAME = "portfolio-synapser-models";
const DB_VERSION = 1;
const STORE = "models";
const LEGACY_RECORD_ID = "custom";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
  });
}

function normalizeMeta(parsed: SynapserModelMeta): SynapserModelMeta | null {
  if (typeof parsed.fileName !== "string") return null;
  return {
    fileName: parsed.fileName,
    savedAt: parsed.savedAt ?? 0,
    scale: typeof parsed.scale === "number" ? parsed.scale : 1,
  };
}

export function readSynapserSceneMetaMap(): SynapserSceneMetaMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return migrateLegacyMeta();
    const parsed = JSON.parse(raw) as SynapserSceneMetaMap;
    const result: SynapserSceneMetaMap = {};
    for (const [id, meta] of Object.entries(parsed)) {
      if (!meta) continue;
      const normalized = normalizeMeta(meta);
      if (normalized) result[id] = normalized;
    }
    return result;
  } catch {
    return {};
  }
}

function migrateLegacyMeta(): SynapserSceneMetaMap {
  try {
    const raw = localStorage.getItem(LEGACY_META_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SynapserModelMeta;
    const normalized = normalizeMeta(parsed);
    if (!normalized) return {};
    const map: SynapserSceneMetaMap = { manifesto: normalized };
    writeSynapserSceneMetaMap(map);
    localStorage.removeItem(LEGACY_META_KEY);
    return map;
  } catch {
    return {};
  }
}

function writeSynapserSceneMetaMap(map: SynapserSceneMetaMap) {
  if (typeof window === "undefined") return;
  const hasAny = Object.keys(map).length > 0;
  if (!hasAny) {
    localStorage.removeItem(META_KEY);
    return;
  }
  localStorage.setItem(META_KEY, JSON.stringify(map));
}

export function readSynapserSceneMeta(sceneId: SynapserSceneId): SynapserModelMeta | null {
  return readSynapserSceneMetaMap()[sceneId] ?? null;
}

export async function readSynapserSceneBlob(sceneId: SynapserSceneId): Promise<ArrayBuffer | null> {
  if (typeof window === "undefined") return null;
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(sceneId);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve((req.result as ArrayBuffer | undefined) ?? null);
    });
  } catch {
    return null;
  }
}

async function readLegacyBlob(): Promise<ArrayBuffer | null> {
  if (typeof window === "undefined") return null;
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(LEGACY_RECORD_ID);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve((req.result as ArrayBuffer | undefined) ?? null);
    });
  } catch {
    return null;
  }
}

export async function hydrateSynapserSceneModels(
  sceneIds?: SynapserSceneId[],
): Promise<Partial<Record<SynapserSceneId, { meta: SynapserModelMeta; buffer: ArrayBuffer }>>> {
  const metaMap = readSynapserSceneMetaMap();
  const ids = sceneIds ?? Object.keys(metaMap);
  const result: Partial<Record<SynapserSceneId, { meta: SynapserModelMeta; buffer: ArrayBuffer }>> =
    {};

  for (const id of ids) {
    const meta = metaMap[id];
    if (!meta) continue;
    const buffer = await readSynapserSceneBlob(id);
    if (buffer) result[id] = { meta, buffer };
  }

  if (!result.manifesto) {
    const legacyMeta = (() => {
      try {
        const raw = localStorage.getItem(LEGACY_META_KEY);
        if (!raw) return null;
        return normalizeMeta(JSON.parse(raw) as SynapserModelMeta);
      } catch {
        return null;
      }
    })();
    const legacyBuffer = await readLegacyBlob();
    if (legacyMeta && legacyBuffer) {
      result.manifesto = { meta: legacyMeta, buffer: legacyBuffer };
      await writeSynapserSceneBlob("manifesto", legacyBuffer, legacyMeta);
      localStorage.removeItem(LEGACY_META_KEY);
      try {
        const db = await openDb();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE, "readwrite");
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
          tx.objectStore(STORE).delete(LEGACY_RECORD_ID);
        });
      } catch {
        /* ignore */
      }
    }
  }

  return result;
}

export async function writeSynapserSceneBlob(
  sceneId: SynapserSceneId,
  buffer: ArrayBuffer,
  meta: SynapserModelMeta,
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(buffer, sceneId);
  });
  const map = readSynapserSceneMetaMap();
  map[sceneId] = meta;
  writeSynapserSceneMetaMap(map);
}

export async function clearSynapserScene(sceneId: SynapserSceneId): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORE).delete(sceneId);
    });
  } catch {
    /* ignore */
  }
  const map = readSynapserSceneMetaMap();
  delete map[sceneId];
  writeSynapserSceneMetaMap(map);
}

export function downloadSynapserModel(buffer: ArrayBuffer, fileName: string) {
  const blob = new Blob([buffer], { type: "model/gltf-binary" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName.endsWith(".glb") ? fileName : `${fileName.replace(/\.[^.]+$/, "")}.glb`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const SYNAPSER_MODEL_ACCEPT = ".glb,.gltf,model/gltf-binary,model/gltf+json";
