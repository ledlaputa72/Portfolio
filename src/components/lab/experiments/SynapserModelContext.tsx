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
import { mergeSceneSettings, type SynapserSceneSettings } from "@/lib/synapser-scene-settings";
import {
  DEFAULT_SYNAPSER_SCROLL_GLITCH,
  mergeScrollGlitchPatch,
  type SynapserScrollGlitchSettings,
} from "@/lib/synapser-scroll-glitch";

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
  saveSceneSettings: () => void;
  resetSceneSettings: (sceneId?: SynapserSceneId) => void;
  patchScrollGlitch: (patch: Partial<SynapserScrollGlitchSettings>) => void;
  resetScrollGlitch: () => void;
  addScene: () => void;
  removeScene: () => boolean;
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

export function SynapserModelProvider({ children }: { children: ReactNode }) {
  const [projectState, setProjectState] = useState<SynapserProjectState>(createDefaultProjectState);
  const [selectedScene, setSelectedScene] = useState<SynapserSceneId>("manifesto");
  const [scenes, setScenes] = useState<Record<SynapserSceneId, SceneModelState>>(() =>
    createEmptyScenes(createDefaultProjectState().sceneOrder),
  );
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const urlRefs = useRef<Partial<Record<SynapserSceneId, string>>>({});

  const sceneList = useMemo(() => getSceneList(projectState), [projectState]);
  const sceneOrder = projectState.sceneOrder;
  const sceneSettings = projectState.settings;
  const activeSceneSettings =
    projectState.settings[selectedScene] ?? projectState.settings[sceneOrder[0]];
  const scrollGlitch =
    projectState.scrollGlitch[selectedScene] ??
    projectState.scrollGlitch[sceneOrder[0]] ??
    DEFAULT_SYNAPSER_SCROLL_GLITCH;

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
    const state = readSynapserProjectState();
    setProjectState(state);
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
    setSettingsDirty(false);
    setLoading(false);
  }, [revokeAllUrls]);

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

  const patchSceneSettings = useCallback(
    (
      sceneId: SynapserSceneId,
      patch: Partial<SynapserSceneSettings> | ((prev: SynapserSceneSettings) => SynapserSceneSettings),
    ) => {
      setProjectState((prev) => {
        const current = prev.settings[sceneId];
        if (!current) return prev;
        const base = mergeSceneSettings(current);
        const next =
          typeof patch === "function"
            ? mergeSceneSettings(patch(base))
            : mergeSceneSettings({ ...base, ...patch });
        return {
          ...prev,
          settings: { ...prev.settings, [sceneId]: next },
        };
      });
      setSettingsDirty(true);
    },
    [],
  );

  const saveSceneSettings = useCallback(() => {
    writeSynapserProjectState(projectState);
    setSettingsDirty(false);
  }, [projectState]);

  const patchScrollGlitch = useCallback(
    (patch: Partial<SynapserScrollGlitchSettings>) => {
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

  const resetScrollGlitch = useCallback(() => {
    setProjectState((prev) => resetSceneBundle(prev, selectedScene));
    setSettingsDirty(true);
  }, [selectedScene]);

  const resetSceneSettings = useCallback((sceneId?: SynapserSceneId) => {
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

    setProjectState((prev) => removeSceneFromProject(prev, selectedScene));
    setScenes((prev) => {
      const next = { ...prev };
      delete next[selectedScene];
      return next;
    });
    setSelectedScene(nextSelected);
    setSettingsDirty(true);
    return true;
  }, [projectState, revokeSceneUrl, selectedScene]);

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
      resetScrollGlitch,
      addScene,
      removeScene,
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
      resetScrollGlitch,
      addScene,
      removeScene,
    ],
  );

  return <SynapserModelContext.Provider value={value}>{children}</SynapserModelContext.Provider>;
}
