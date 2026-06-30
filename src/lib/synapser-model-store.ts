export type SynapserModelMeta = {
  fileName: string;
  savedAt: number;
  scale: number;
};

const META_KEY = "synapser-model-meta";
const DB_NAME = "portfolio-synapser-models";
const DB_VERSION = 1;
const STORE = "models";
const RECORD_ID = "custom";

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

export function readSynapserModelMeta(): SynapserModelMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SynapserModelMeta;
    if (typeof parsed.fileName !== "string") return null;
    return {
      fileName: parsed.fileName,
      savedAt: parsed.savedAt ?? 0,
      scale: typeof parsed.scale === "number" ? parsed.scale : 1,
    };
  } catch {
    return null;
  }
}

function writeSynapserModelMeta(meta: SynapserModelMeta | null) {
  if (typeof window === "undefined") return;
  if (!meta) {
    localStorage.removeItem(META_KEY);
    return;
  }
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export async function readSynapserModelBlob(): Promise<ArrayBuffer | null> {
  if (typeof window === "undefined") return null;
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(RECORD_ID);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve((req.result as ArrayBuffer | undefined) ?? null);
    });
  } catch {
    return null;
  }
}

export async function writeSynapserModelBlob(
  buffer: ArrayBuffer,
  meta: SynapserModelMeta,
): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE).put(buffer, RECORD_ID);
  });
  writeSynapserModelMeta(meta);
}

export async function clearSynapserModel(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORE).delete(RECORD_ID);
    });
  } catch {
    /* ignore */
  }
  writeSynapserModelMeta(null);
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
