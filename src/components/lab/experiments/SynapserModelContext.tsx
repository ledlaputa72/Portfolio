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
  clearSynapserScene,
  downloadSynapserModel,
  hydrateSynapserSceneModels,
  readSynapserSceneBlob,
  writeSynapserSceneBlob,
  SYNAPSER_SCENES,
  type SynapserModelMeta,
  type SynapserSceneId,
} from "@/lib/synapser-model-store";

export type SceneModelState = {
  mode: "default" | "custom";
  meta: SynapserModelMeta | null;
  modelUrl: string | null;
  pendingBuffer: ArrayBuffer | null;
  scale: number;
};

const EMPTY_SCENE: SceneModelState = {
  mode: "default",
  meta: null,
  modelUrl: null,
  pendingBuffer: null,
  scale: 1,
};

function createEmptyScenes(): Record<SynapserSceneId, SceneModelState> {
  return {
    manifesto: { ...EMPTY_SCENE },
    archive: { ...EMPTY_SCENE },
    journey: { ...EMPTY_SCENE },
  };
}

type SynapserModelContextValue = {
  selectedScene: SynapserSceneId;
  setSelectedScene: (sceneId: SynapserSceneId) => void;
  scenes: Record<SynapserSceneId, SceneModelState>;
  activeScene: SceneModelState;
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

export { SYNAPSER_SCENES };

export function SynapserModelProvider({ children }: { children: ReactNode }) {
  const [selectedScene, setSelectedScene] = useState<SynapserSceneId>("manifesto");
  const [scenes, setScenes] = useState<Record<SynapserSceneId, SceneModelState>>(createEmptyScenes);
  const [loading, setLoading] = useState(true);
  const urlRefs = useRef<Partial<Record<SynapserSceneId, string>>>({});

  const revokeSceneUrl = useCallback((sceneId: SynapserSceneId) => {
    const url = urlRefs.current[sceneId];
    if (url) {
      URL.revokeObjectURL(url);
      delete urlRefs.current[sceneId];
    }
  }, []);

  const revokeAllUrls = useCallback(() => {
    for (const id of Object.keys(urlRefs.current) as SynapserSceneId[]) {
      revokeSceneUrl(id);
    }
  }, [revokeSceneUrl]);

  const applySceneBuffer = useCallback(
    (
      sceneId: SynapserSceneId,
      buffer: ArrayBuffer,
      nextMeta: SynapserModelMeta,
      persisted: boolean,
    ) => {
      revokeSceneUrl(sceneId);
      const blob = new Blob([buffer], { type: "model/gltf-binary" });
      const url = URL.createObjectURL(blob);
      urlRefs.current[sceneId] = url;
      setScenes((prev) => ({
        ...prev,
        [sceneId]: {
          mode: "custom",
          meta: nextMeta,
          modelUrl: url,
          pendingBuffer: persisted ? null : buffer,
          scale: nextMeta.scale,
        },
      }));
    },
    [revokeSceneUrl],
  );

  const hydrate = useCallback(async () => {
    setLoading(true);
    revokeAllUrls();
    const stored = await hydrateSynapserSceneModels();
    const next = createEmptyScenes();
    for (const id of ["manifesto", "archive", "journey"] as SynapserSceneId[]) {
      const entry = stored[id];
      if (entry) {
        const blob = new Blob([entry.buffer], { type: "model/gltf-binary" });
        const url = URL.createObjectURL(blob);
        urlRefs.current[id] = url;
        next[id] = {
          mode: "custom",
          meta: entry.meta,
          modelUrl: url,
          pendingBuffer: null,
          scale: entry.meta.scale,
        };
      }
    }
    setScenes(next);
    setLoading(false);
  }, [revokeAllUrls]);

  useEffect(() => {
    hydrate();
    return () => revokeAllUrls();
  }, [hydrate, revokeAllUrls]);

  const activeScene = scenes[selectedScene];

  const loadFile = useCallback(
    async (file: File) => {
      const buffer = await file.arrayBuffer();
      applySceneBuffer(
        selectedScene,
        buffer,
        {
          fileName: file.name,
          savedAt: Date.now(),
          scale: scenes[selectedScene].scale,
        },
        false,
      );
    },
    [applySceneBuffer, selectedScene, scenes],
  );

  const saveModel = useCallback(async () => {
    const scene = scenes[selectedScene];
    const buffer = scene.pendingBuffer ?? (await readSynapserSceneBlob(selectedScene));
    if (!buffer || !scene.meta) return;
    const nextMeta = { ...scene.meta, savedAt: Date.now(), scale: scene.scale };
    await writeSynapserSceneBlob(selectedScene, buffer, nextMeta);
    setScenes((prev) => ({
      ...prev,
      [selectedScene]: {
        ...prev[selectedScene],
        meta: nextMeta,
        pendingBuffer: null,
      },
    }));
    downloadSynapserModel(buffer, scene.meta.fileName);
  }, [scenes, selectedScene]);

  const resetModel = useCallback(async () => {
    await clearSynapserScene(selectedScene);
    revokeSceneUrl(selectedScene);
    setScenes((prev) => ({
      ...prev,
      [selectedScene]: { ...EMPTY_SCENE },
    }));
  }, [revokeSceneUrl, selectedScene]);

  const setScale = useCallback(
    (next: number) => {
      const clamped = Math.max(0.25, Math.min(3, next));
      setScenes((prev) => {
        const scene = prev[selectedScene];
        if (scene.mode !== "custom" || !scene.meta) return prev;
        const updated = { ...scene.meta, scale: clamped };
        if (!scene.pendingBuffer) {
          readSynapserSceneBlob(selectedScene).then((buffer) => {
            if (buffer) writeSynapserSceneBlob(selectedScene, buffer, updated);
          });
        }
        return {
          ...prev,
          [selectedScene]: { ...scene, scale: clamped, meta: updated },
        };
      });
    },
    [selectedScene],
  );

  const value = useMemo<SynapserModelContextValue>(
    () => ({
      selectedScene,
      setSelectedScene,
      scenes,
      activeScene,
      loading,
      loadFile,
      saveModel,
      resetModel,
      setScale,
    }),
    [
      selectedScene,
      scenes,
      activeScene,
      loading,
      loadFile,
      saveModel,
      resetModel,
      setScale,
    ],
  );

  return <SynapserModelContext.Provider value={value}>{children}</SynapserModelContext.Provider>;
}
