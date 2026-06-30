"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  clearSynapserModel,
  downloadSynapserModel,
  readSynapserModelBlob,
  readSynapserModelMeta,
  writeSynapserModelBlob,
  type SynapserModelMeta,
} from "@/lib/synapser-model-store";

type SynapserModelContextValue = {
  mode: "default" | "custom";
  meta: SynapserModelMeta | null;
  modelUrl: string | null;
  pendingBuffer: ArrayBuffer | null;
  scale: number;
  loading: boolean;
  loadFile: (file: File) => Promise<void>;
  saveModel: () => Promise<void>;
  resetModel: () => Promise<void>;
  setScale: (scale: number) => void;
};

const SynapserModelContext = createContext<SynapserModelContextValue | null>(null);

export function useSynapserModel() {
  const ctx = useContext(SynapserModelContext);
  if (!ctx) {
    throw new Error("useSynapserModel must be used within SynapserModelProvider");
  }
  return ctx;
}

export function SynapserModelProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<SynapserModelMeta | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [pendingBuffer, setPendingBuffer] = useState<ArrayBuffer | null>(null);
  const [scale, setScaleState] = useState(1);
  const [loading, setLoading] = useState(true);
  const urlRef = useRef<string | null>(null);

  const revokeUrl = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setModelUrl(null);
  }, []);

  const applyBuffer = useCallback(
    (buffer: ArrayBuffer, nextMeta: SynapserModelMeta, persisted: boolean) => {
      revokeUrl();
      const blob = new Blob([buffer], { type: "model/gltf-binary" });
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setModelUrl(url);
      setMeta(nextMeta);
      setScaleState(nextMeta.scale);
      setPendingBuffer(persisted ? null : buffer);
    },
    [revokeUrl],
  );

  const hydrate = useCallback(async () => {
    setLoading(true);
    const storedMeta = readSynapserModelMeta();
    const buffer = await readSynapserModelBlob();
    if (storedMeta && buffer) {
      applyBuffer(buffer, storedMeta, true);
    } else {
      revokeUrl();
      setMeta(null);
      setPendingBuffer(null);
      setScaleState(1);
    }
    setLoading(false);
  }, [applyBuffer, revokeUrl]);

  useEffect(() => {
    hydrate();
    return () => revokeUrl();
  }, [hydrate, revokeUrl]);

  const loadFile = useCallback(
    async (file: File) => {
      const buffer = await file.arrayBuffer();
      applyBuffer(
        buffer,
        {
          fileName: file.name,
          savedAt: Date.now(),
          scale,
        },
        false,
      );
    },
    [applyBuffer, scale],
  );

  const saveModel = useCallback(async () => {
    const buffer = pendingBuffer ?? (await readSynapserModelBlob());
    if (!buffer || !meta) return;
    const nextMeta = { ...meta, savedAt: Date.now(), scale };
    await writeSynapserModelBlob(buffer, nextMeta);
    setMeta(nextMeta);
    setPendingBuffer(null);
    downloadSynapserModel(buffer, meta.fileName);
  }, [meta, pendingBuffer, scale]);

  const resetModel = useCallback(async () => {
    await clearSynapserModel();
    revokeUrl();
    setMeta(null);
    setPendingBuffer(null);
    setScaleState(1);
  }, [revokeUrl]);

  const setScale = useCallback(
    (next: number) => {
      const clamped = Math.max(0.25, Math.min(3, next));
      setScaleState(clamped);
      setMeta((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, scale: clamped };
        if (!pendingBuffer) {
          readSynapserModelBlob().then((buffer) => {
            if (buffer) writeSynapserModelBlob(buffer, updated);
          });
        }
        return updated;
      });
    },
    [pendingBuffer],
  );

  const value = useMemo<SynapserModelContextValue>(
    () => ({
      mode: modelUrl ? "custom" : "default",
      meta,
      modelUrl,
      pendingBuffer,
      scale,
      loading,
      loadFile,
      saveModel,
      resetModel,
      setScale,
    }),
    [meta, modelUrl, pendingBuffer, scale, loading, loadFile, saveModel, resetModel, setScale],
  );

  return <SynapserModelContext.Provider value={value}>{children}</SynapserModelContext.Provider>;
}
