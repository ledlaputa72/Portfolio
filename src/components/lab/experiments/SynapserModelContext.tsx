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
import { useSession } from "next-auth/react";
import {
  clearSynapserScene,
  downloadSynapserModel,
  hydrateSynapserSceneModels,
  readSynapserSceneBlob,
  writeSynapserSceneBlob,
  type SynapserModelMeta,
} from "@/lib/synapser-model-store";
import {
  addSceneAfter,
  createDefaultProjectState,
  getSceneList,
  readSynapserProjectState,
  removeScene as removeSceneFromProject,
  resetSceneBundle,
  writeSynapserProjectState,
  type SynapserProjectState,
  type SynapserSceneDefinition,
  type SynapserSceneId,
} from "@/lib/synapser-project-state";
import {
  applySceneSettingsPatch,
  mergeSceneSettings,
  type SynapserSceneSettings,
} from "@/lib/synapser-scene-settings";
import {
  DEFAULT_SYNAPSER_SCROLL_GLITCH,
  mergeScrollGlitchPatch,
  type SynapserScrollGlitchSettings,
} from "@/lib/synapser-scroll-glitch";
import {
  normalizeSynapserScrollExperience,
  type SynapserScrollExperience,
} from "@/lib/synapser-scroll-experience";

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

function createEmptyScenes(sceneOrder: SynapserSceneId[]): Record<SynapserSceneId, SceneModelState> {
  const result: Record<SynapserSceneId, SceneModelState> = {};
  for (const id of sceneOrder) result[id] = { ...EMPTY_SCENE };
  return result;
}

type SynapserModelContextValue = {
  selectedScene: SynapserSceneId;
  setSelectedScene: (sceneId: SynapserSceneId) => void;
  sceneList: SynapserSceneDefinition[];
  sceneOrder: SynapserSceneId[];
  scenes: Record<SynapserSceneId, SceneModelState>;
  activeScene: SceneModelState;
  sceneSettings: Record<SynapserSceneId, SynapserSceneSettings>;
  activeSceneSettings: SynapserSceneSettings;
  scrollGlitch: SynapserScrollGlitchSettings;
  scrollGlitchMap: Record<SynapserSceneId, SynapserScrollGlitchSettings>;
  scrollExperience: SynapserScrollExperience;
  settingsDirty: boolean;
  loading: boolean;
  loadFile: (file: File) => Promise<void>;
  saveModel: () => Promise<void>;
  resetModel: () => Promise<void>;
  setScale: (scale: number) => void;
  patchSceneSettings: (
    sceneId: SynapserSceneId,
    patch: Partial<SynapserSceneSettings> | ((prev: SynapserSceneSettings) => SynapserSceneSettings),
  ) => void;
  saveSceneSettings: () => void | Promise<void>;
  resetSceneSettings: (sceneId?: SynapserSceneId) => void;
  patchScrollGlitch: (patch: Partial<SynapserScrollGlitchSettings>) => void;
  patchScrollExperience: (patch: Partial<SynapserScrollExperience>) => void;
  resetScrollGlitch: () => void;
  addScene: () => void;
  removeScene: () => boolean;
  exportProjectSettings: () => void;
  importProjectSettings: (file: File) => Promise<void>;
};

const SynapserModelContext = createContext<SynapserModelContextValue | null>(null);

export function useSynapserModel() {
  const ctx = useContext(SynapserModelContext);
  if (!ctx) {
    throw new Error("useSynapserModel must be used within SynapserModelProvider");
  }
  return ctx;
}

export { DEFAULT_SCENE_DEFINITIONS as SYNAPSER_SCENES } from "@/lib/synapser-project-state";

function readInitialProjectState(): SynapserProjectState {
  return typeof window !== "undefined" ? readSynapserProjectState() : createDefaultProjectState();
}


export function SynapserModelProvider({ children }: { children: ReactNode }) {
  const { status: sessionStatus } = useSession();
  const isLoggedIn = sessionStatus === "authenticated";

  const [projectState, setProjectState] = useState<SynapserProjectState>(readInitialProjectState);
  const [selectedScene, setSelectedScene] = useState<SynapserSceneId>("manifesto");
  const [scenes, setScenes] = useState<Record<SynapserSceneId, SceneModelState>>(() =>
    createEmptyScenes(readInitialProjectState().sceneOrder),
  );
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const urlRefs = useRef<Partial<Record<SynapserSceneId, string>>>({});
  const loadingRef = useRef(true);
  const settingsTouchedRef = useRef(false);

  const sceneList = useMemo(() => getSceneList(projectState), [projectState]);
  const sceneOrder = projectState.sceneOrder;
  const sceneSettings = projectState.settings;
  const activeSceneSettings =
    projectState.settings[selectedScene] ?? projectState.settings[sceneOrder[0]];
  const scrollGlitch =
    projectState.scrollGlitch[selectedScene] ??
    projectState.scrollGlitch[sceneOrder[0]] ??
    DEFAULT_SYNAPSER_SCROLL_GLITCH;
  const scrollExperience = normalizeSynapserScrollExperience(projectState.scrollExperience);

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
    loadingRef.current = true;
    revokeAllUrls();
    const state = readSynapserProjectState();
    setProjectState((prev) => (settingsTouchedRef.current ? prev : state));
    setSelectedScene((prev) => (state.sceneOrder.includes(prev) ? prev : state.sceneOrder[0]));
    const stored = await hydrateSynapserSceneModels(state.sceneOrder);
    const next = createEmptyScenes(state.sceneOrder);
    for (const id of state.sceneOrder) {
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
    if (!settingsTouchedRef.current) setSettingsDirty(false);
    setLoading(false);
    loadingRef.current = false;
  }, [revokeAllUrls]);

  // Pull settings + models from server, write to localStorage/IndexedDB, re-hydrate
  const syncFromServer = useCallback(async () => {
    try {
      const res = await fetch("/api/synapser/settings");
      if (!res.ok) return;
      const json = (await res.json()) as { state: SynapserProjectState | null };
      if (!json.state) return;

      const serverState = json.state;
      writeSynapserProjectState(serverState);

      // Fetch models for each scene from Blob storage via API
      for (const sceneId of serverState.sceneOrder) {
        try {
          const mRes = await fetch(`/api/synapser/models/${sceneId}`);
          if (!mRes.ok) continue;
          const mJson = (await mRes.json()) as {
            model: { meta: SynapserModelMeta; blobUrl: string } | null;
          };
          if (!mJson.model) continue;
          // Download the GLB from Blob CDN and store in IndexedDB
          const blobRes = await fetch(mJson.model.blobUrl);
          if (!blobRes.ok) continue;
          const buffer = await blobRes.arrayBuffer();
          await writeSynapserSceneBlob(sceneId, buffer, mJson.model.meta);
        } catch {
          /* non-critical */
        }
      }

      // Re-hydrate UI with the merged state
      await hydrate();
    } catch {
      /* non-critical */
    }
  }, [hydrate]);

  // On login: sync from server. On logout: re-hydrate from local only.
  const prevLoginRef = useRef(false);
  useEffect(() => {
    const wasLoggedIn = prevLoginRef.current;
    prevLoginRef.current = isLoggedIn;
    if (isLoggedIn && !wasLoggedIn) {
      syncFromServer();
    } else if (!isLoggedIn && wasLoggedIn) {
      hydrate();
    }
  }, [isLoggedIn, syncFromServer, hydrate]);

  useEffect(() => {
    hydrate();
    return () => revokeAllUrls();
  }, [hydrate, revokeAllUrls]);

  const activeScene = scenes[selectedScene] ?? EMPTY_SCENE;

  const loadFile = useCallback(
    async (file: File) => {
      const buffer = await file.arrayBuffer();
      applySceneBuffer(
        selectedScene,
        buffer,
        {
          fileName: file.name,
          savedAt: Date.now(),
          scale: scenes[selectedScene]?.scale ?? 1,
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
    if (isLoggedIn) {
      fetch(`/api/synapser/models/${selectedScene}`, { method: "DELETE" }).catch(() => {});
    }
  }, [revokeSceneUrl, selectedScene, isLoggedIn]);

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

  const patchSceneSettings = useCallback(
    (
      sceneId: SynapserSceneId,
      patch: Partial<SynapserSceneSettings> | ((prev: SynapserSceneSettings) => SynapserSceneSettings),
    ) => {
      settingsTouchedRef.current = true;
      setProjectState((prev) => {
        const current = prev.settings[sceneId];
        if (!current) return prev;
        const base = mergeSceneSettings(current);
        const next =
          typeof patch === "function"
            ? mergeSceneSettings(patch(base))
            : applySceneSettingsPatch(base, patch);
        return {
          ...prev,
          settings: { ...prev.settings, [sceneId]: next },
        };
      });
      setSettingsDirty(true);
    },
    [],
  );

  const saveSceneSettings = useCallback(async () => {
    if (loadingRef.current) return;

    let savedState!: SynapserProjectState;
    setProjectState((current) => {
      writeSynapserProjectState(current);
      savedState = current;
      return current;
    });

    const pendingUpdates: Partial<Record<SynapserSceneId, SceneModelState>> = {};
    const savedModels: Partial<Record<SynapserSceneId, { buffer: ArrayBuffer; meta: SynapserModelMeta }>> = {};
    for (const sceneId of sceneOrder) {
      const scene = scenes[sceneId];
      if (!scene?.pendingBuffer || !scene.meta) continue;
      const nextMeta = { ...scene.meta, savedAt: Date.now(), scale: scene.scale };
      await writeSynapserSceneBlob(sceneId, scene.pendingBuffer, nextMeta);
      pendingUpdates[sceneId] = { ...scene, meta: nextMeta, pendingBuffer: null };
      savedModels[sceneId] = { buffer: scene.pendingBuffer, meta: nextMeta };
    }
    if (Object.keys(pendingUpdates).length > 0) {
      setScenes((prev) => {
        const next = { ...prev };
        for (const [sceneId, state] of Object.entries(pendingUpdates)) {
          if (state) next[sceneId] = state;
        }
        return next;
      });
    }

    setSettingsDirty(false);
    settingsTouchedRef.current = false;

    if (isLoggedIn && savedState) {
      // Push settings to server (fire-and-forget)
      fetch("/api/synapser/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: savedState }),
      }).catch(() => {});

      // Push only newly loaded/changed models to Vercel Blob
      for (const [sceneId, entry] of Object.entries(savedModels)) {
        if (!entry) continue;
        const { buffer, meta } = entry;
        const fd = new FormData();
        fd.append("file", new Blob([buffer], { type: "model/gltf-binary" }), meta.fileName);
        fd.append("meta", JSON.stringify(meta));
        fetch(`/api/synapser/models/${sceneId}`, { method: "POST", body: fd }).catch(() => {});
      }
    }
  }, [scenes, sceneOrder, isLoggedIn]);

  const patchScrollGlitch = useCallback(
    (patch: Partial<SynapserScrollGlitchSettings>) => {
      settingsTouchedRef.current = true;
      setProjectState((prev) => {
        const current =
          prev.scrollGlitch[selectedScene] ??
          prev.scrollGlitch[prev.sceneOrder[0]] ??
          DEFAULT_SYNAPSER_SCROLL_GLITCH;
        return {
          ...prev,
          scrollGlitch: {
            ...prev.scrollGlitch,
            [selectedScene]: mergeScrollGlitchPatch(current, patch),
          },
        };
      });
      setSettingsDirty(true);
    },
    [selectedScene],
  );

  const patchScrollExperience = useCallback((patch: Partial<SynapserScrollExperience>) => {
    settingsTouchedRef.current = true;
    setProjectState((prev) => ({
      ...prev,
      scrollExperience: normalizeSynapserScrollExperience({
        ...prev.scrollExperience,
        ...patch,
      }),
    }));
    setSettingsDirty(true);
  }, []);

  const resetScrollGlitch = useCallback(() => {
    settingsTouchedRef.current = true;
    setProjectState((prev) => resetSceneBundle(prev, selectedScene));
    setSettingsDirty(true);
  }, [selectedScene]);

  const resetSceneSettings = useCallback((sceneId?: SynapserSceneId) => {
    settingsTouchedRef.current = true;
    const target = sceneId ?? selectedScene;
    setProjectState((prev) => resetSceneBundle(prev, target));
    setSettingsDirty(true);
  }, [selectedScene]);

  const addScene = useCallback(() => {
    setProjectState((prev) => {
      const next = addSceneAfter(prev, selectedScene);
      const newId = next.sceneOrder[next.sceneOrder.indexOf(selectedScene) + 1];
      if (newId) {
        setScenes((scenePrev) => ({ ...scenePrev, [newId]: { ...EMPTY_SCENE } }));
        setSelectedScene(newId);
      }
      return next;
    });
    setSettingsDirty(true);
  }, [selectedScene]);

  const removeScene = useCallback(() => {
    if (projectState.sceneOrder.length <= 1) return false;
    const def = projectState.definitions[selectedScene];
    const label = def?.label ?? selectedScene;
    const confirmed = window.confirm(
      `"${label}" 씬을 삭제할까요?\n이 씬의 설정·글리치·3D 모델이 모두 제거됩니다.`,
    );
    if (!confirmed) return false;

    const index = projectState.sceneOrder.indexOf(selectedScene);
    const nextSelected =
      projectState.sceneOrder[index + 1] ?? projectState.sceneOrder[index - 1] ?? projectState.sceneOrder[0];

    clearSynapserScene(selectedScene);
    revokeSceneUrl(selectedScene);
    if (isLoggedIn) {
      fetch(`/api/synapser/models/${selectedScene}`, { method: "DELETE" }).catch(() => {});
    }

    setProjectState((prev) => removeSceneFromProject(prev, selectedScene));
    setScenes((prev) => {
      const next = { ...prev };
      delete next[selectedScene];
      return next;
    });
    setSelectedScene(nextSelected);
    setSettingsDirty(true);
    return true;
  }, [projectState, revokeSceneUrl, selectedScene, isLoggedIn]);

  const exportProjectSettings = useCallback(() => {
    setProjectState((current) => {
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        sceneOrder: current.sceneOrder,
        definitions: current.definitions,
        settings: current.settings,
        scrollGlitch: current.scrollGlitch,
        scrollExperience: current.scrollExperience,
      };
      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `synapser-settings-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return current;
    });
  }, []);

  const importProjectSettings = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<SynapserProjectState & { version: number }>;

      setProjectState((prev) => {
        const base = createDefaultProjectState();
        const importedOrder = parsed.sceneOrder?.filter(
          (id) => typeof id === "string" && id.length > 0,
        ) ?? prev.sceneOrder;
        if (importedOrder.length === 0) return prev;

        const definitions = { ...prev.definitions, ...parsed.definitions };
        const settings = { ...prev.settings };
        const scrollGlitch = { ...prev.scrollGlitch };

        for (const id of importedOrder) {
          if (parsed.settings?.[id]) settings[id] = mergeSceneSettings(parsed.settings[id]);
          if (!definitions[id]) definitions[id] = base.definitions[id] ?? { id, label: id, defaultObject: "Torus", procedural: "torus", title: id.toUpperCase(), kicker: "", body: "" };
          if (parsed.scrollGlitch?.[id]) {
            scrollGlitch[id] = mergeScrollGlitchPatch(
              DEFAULT_SYNAPSER_SCROLL_GLITCH,
              parsed.scrollGlitch[id],
            );
          }
        }

        const next: SynapserProjectState = {
          sceneOrder: importedOrder,
          definitions,
          settings,
          scrollGlitch,
          scrollExperience: parsed.scrollExperience
            ? normalizeSynapserScrollExperience(parsed.scrollExperience)
            : prev.scrollExperience,
        };
        writeSynapserProjectState(next);
        return next;
      });

      settingsTouchedRef.current = false;
      setSettingsDirty(false);
    } catch {
      alert("설정 파일을 읽을 수 없습니다. 올바른 Synapser 설정 JSON 파일을 선택해 주세요.");
    }
  }, []);

  const value = useMemo<SynapserModelContextValue>(
    () => ({
      selectedScene,
      setSelectedScene,
      sceneList,
      sceneOrder,
      scenes,
      activeScene,
      sceneSettings,
      activeSceneSettings,
      scrollGlitch,
      scrollGlitchMap: projectState.scrollGlitch,
      scrollExperience,
      settingsDirty,
      loading,
      loadFile,
      saveModel,
      resetModel,
      setScale,
      patchSceneSettings,
      saveSceneSettings,
      resetSceneSettings,
      patchScrollGlitch,
      patchScrollExperience,
      resetScrollGlitch,
      addScene,
      removeScene,
      exportProjectSettings,
      importProjectSettings,
    }),
    [
      selectedScene,
      sceneList,
      sceneOrder,
      scenes,
      activeScene,
      sceneSettings,
      activeSceneSettings,
      scrollGlitch,
      projectState.scrollGlitch,
      scrollExperience,
      settingsDirty,
      loading,
      loadFile,
      saveModel,
      resetModel,
      setScale,
      patchSceneSettings,
      saveSceneSettings,
      resetSceneSettings,
      patchScrollGlitch,
      patchScrollExperience,
      resetScrollGlitch,
      addScene,
      removeScene,
      exportProjectSettings,
      importProjectSettings,
    ],
  );

  return <SynapserModelContext.Provider value={value}>{children}</SynapserModelContext.Provider>;
}
