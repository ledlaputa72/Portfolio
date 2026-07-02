import {
  DEFAULT_SYNAPSER_SCROLL_GLITCH,
  mergeScrollGlitchPatch,
  type SynapserScrollGlitchSettings,
} from "./synapser-scroll-glitch";
import {
  DEFAULT_SYNAPSER_SCROLL_EXPERIENCE,
  normalizeSynapserScrollExperience,
  type SynapserScrollExperience,
} from "./synapser-scroll-experience";
import {
  DEFAULT_SYNAPSER_SCENE_SETTINGS,
  mergeSceneSettings,
  sceneDefaults,
  type SynapserSceneSettings,
} from "./synapser-scene-settings";

export type SynapserSceneId = string;

export type SynapserProceduralType = "torus" | "grid" | "network";

export type SynapserSceneDefinition = {
  id: SynapserSceneId;
  label: string;
  defaultObject: string;
  procedural: SynapserProceduralType;
  title: string;
  kicker: string;
  body: string;
};

export type SynapserProjectState = {
  sceneOrder: SynapserSceneId[];
  definitions: Record<SynapserSceneId, SynapserSceneDefinition>;
  settings: Record<SynapserSceneId, SynapserSceneSettings>;
  scrollGlitch: Record<SynapserSceneId, SynapserScrollGlitchSettings>;
  scrollExperience: SynapserScrollExperience;
};

export type { SynapserScrollExperience };

const PROJECT_KEY = "synapser-project-state-v1";
const LEGACY_SETTINGS_KEY = "synapser-scene-settings-v2";
const LEGACY_GLITCH_KEY = "synapser-scroll-glitch-v7";

export const DEFAULT_SCENE_DEFINITIONS: SynapserSceneDefinition[] = [
  {
    id: "manifesto",
    label: "Manifesto",
    defaultObject: "Torus",
    procedural: "torus",
    title: "MANIFESTO",
    kicker: "Lisbon Digital Atelier",
    body: "Craft meets cinematic scroll.",
  },
  {
    id: "archive",
    label: "Archive",
    defaultObject: "Grid",
    procedural: "grid",
    title: "ARCHIVE",
    kicker: "Selected Works",
    body: "Projects drift into focus.",
  },
  {
    id: "journey",
    label: "Journey",
    defaultObject: "Network",
    procedural: "network",
    title: "JOURNEY",
    kicker: "Synapser Network",
    body: "Nodes connect — ideas flow.",
  },
];

const PROCEDURAL_CYCLE: SynapserProceduralType[] = ["torus", "grid", "network"];

function cloneGlitch(settings: SynapserScrollGlitchSettings): SynapserScrollGlitchSettings {
  return JSON.parse(JSON.stringify(settings)) as SynapserScrollGlitchSettings;
}

function cloneSettings(settings: SynapserSceneSettings): SynapserSceneSettings {
  return JSON.parse(JSON.stringify(settings)) as SynapserSceneSettings;
}

function definitionFromProcedural(
  id: SynapserSceneId,
  procedural: SynapserProceduralType,
  index: number,
): SynapserSceneDefinition {
  const templates: Record<SynapserProceduralType, Omit<SynapserSceneDefinition, "id">> = {
    torus: {
      label: `Scene ${index}`,
      defaultObject: "Torus",
      procedural: "torus",
      title: `SCENE ${index}`,
      kicker: "Synapser Studio",
      body: "Cinematic scroll scene.",
    },
    grid: {
      label: `Scene ${index}`,
      defaultObject: "Grid",
      procedural: "grid",
      title: `SCENE ${index}`,
      kicker: "Synapser Studio",
      body: "Archive-style scene.",
    },
    network: {
      label: `Scene ${index}`,
      defaultObject: "Network",
      procedural: "network",
      title: `SCENE ${index}`,
      kicker: "Synapser Network",
      body: "Connected nodes scene.",
    },
  };
  return { id, ...templates[procedural] };
}

function settingsForProcedural(procedural: SynapserProceduralType): SynapserSceneSettings {
  const map: Record<SynapserProceduralType, SynapserSceneId> = {
    torus: "manifesto",
    grid: "archive",
    network: "journey",
  };
  const templateId = map[procedural];
  return cloneSettings(DEFAULT_SYNAPSER_SCENE_SETTINGS[templateId] ?? sceneDefaults());
}

export function createDefaultProjectState(): SynapserProjectState {
  const sceneOrder = DEFAULT_SCENE_DEFINITIONS.map((d) => d.id);
  const definitions: Record<SynapserSceneId, SynapserSceneDefinition> = {};
  const settings: Record<SynapserSceneId, SynapserSceneSettings> = {};
  const scrollGlitch: Record<SynapserSceneId, SynapserScrollGlitchSettings> = {};

  for (const def of DEFAULT_SCENE_DEFINITIONS) {
    definitions[def.id] = { ...def };
    settings[def.id] = cloneSettings(DEFAULT_SYNAPSER_SCENE_SETTINGS[def.id]);
    scrollGlitch[def.id] = cloneGlitch(DEFAULT_SYNAPSER_SCROLL_GLITCH);
  }

  return {
    sceneOrder,
    definitions,
    settings,
    scrollGlitch,
    scrollExperience: { ...DEFAULT_SYNAPSER_SCROLL_EXPERIENCE },
  };
}

function migrateLegacyProjectState(): SynapserProjectState {
  const state = createDefaultProjectState();

  if (typeof window === "undefined") return state;

  try {
    const settingsRaw = localStorage.getItem(LEGACY_SETTINGS_KEY);
    if (settingsRaw) {
      const parsed = JSON.parse(settingsRaw) as Record<string, Partial<SynapserSceneSettings>>;
      for (const id of state.sceneOrder) {
        if (parsed[id]) state.settings[id] = mergeSceneSettings(parsed[id]);
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const glitchRaw = localStorage.getItem(LEGACY_GLITCH_KEY);
    if (glitchRaw) {
      const parsed = JSON.parse(glitchRaw) as SynapserScrollGlitchSettings;
      for (const id of state.sceneOrder) {
        state.scrollGlitch[id] = mergeScrollGlitchPatch(
          DEFAULT_SYNAPSER_SCROLL_GLITCH,
          parsed,
        );
      }
    }
  } catch {
    /* ignore */
  }

  return state;
}

export function readSynapserProjectState(): SynapserProjectState {
  if (typeof window === "undefined") return createDefaultProjectState();
  try {
    const raw = localStorage.getItem(PROJECT_KEY);
    if (!raw) {
      const migrated = migrateLegacyProjectState();
      writeSynapserProjectState(migrated);
      return migrated;
    }
    const parsed = JSON.parse(raw) as Partial<SynapserProjectState>;
    const base = createDefaultProjectState();
    const sceneOrder =
      parsed.sceneOrder?.filter((id) => typeof id === "string" && id.length > 0) ?? base.sceneOrder;
    if (sceneOrder.length === 0) return base;

    const definitions = { ...base.definitions, ...parsed.definitions };
    const settings = { ...base.settings };
    const scrollGlitch = { ...base.scrollGlitch };

    for (const id of sceneOrder) {
      if (parsed.settings?.[id]) settings[id] = mergeSceneSettings(parsed.settings[id]);
      if (!definitions[id]) {
        definitions[id] = definitionFromProcedural(id, "torus", sceneOrder.indexOf(id) + 1);
      }
      if (parsed.scrollGlitch?.[id]) {
        scrollGlitch[id] = mergeScrollGlitchPatch(
          DEFAULT_SYNAPSER_SCROLL_GLITCH,
          parsed.scrollGlitch[id],
        );
      }
      if (!settings[id]) settings[id] = sceneDefaults();
      settings[id] = mergeSceneSettings(settings[id]);
      if (!scrollGlitch[id]) scrollGlitch[id] = cloneGlitch(DEFAULT_SYNAPSER_SCROLL_GLITCH);
      scrollGlitch[id] = mergeScrollGlitchPatch(
        DEFAULT_SYNAPSER_SCROLL_GLITCH,
        scrollGlitch[id],
      );
    }

    return {
      sceneOrder,
      definitions,
      settings,
      scrollGlitch,
      scrollExperience: normalizeSynapserScrollExperience(parsed.scrollExperience),
    };
  } catch {
    return createDefaultProjectState();
  }
}

export function writeSynapserProjectState(state: SynapserProjectState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROJECT_KEY, JSON.stringify(state));
}

export function getSceneList(state: SynapserProjectState): SynapserSceneDefinition[] {
  return state.sceneOrder.map((id) => state.definitions[id]).filter(Boolean);
}

export function addSceneAfter(
  state: SynapserProjectState,
  afterId: SynapserSceneId,
): SynapserProjectState {
  const index = state.sceneOrder.indexOf(afterId);
  const insertAt = index >= 0 ? index + 1 : state.sceneOrder.length;
  const procedural = PROCEDURAL_CYCLE[insertAt % PROCEDURAL_CYCLE.length];
  const id = `scene-${Date.now()}`;
  const definition = definitionFromProcedural(id, procedural, insertAt + 1);

  const sceneOrder = [...state.sceneOrder];
  sceneOrder.splice(insertAt, 0, id);

  return {
    ...state,
    sceneOrder,
    definitions: { ...state.definitions, [id]: definition },
    settings: { ...state.settings, [id]: settingsForProcedural(procedural) },
    scrollGlitch: { ...state.scrollGlitch, [id]: cloneGlitch(DEFAULT_SYNAPSER_SCROLL_GLITCH) },
  };
}

export function removeScene(state: SynapserProjectState, sceneId: SynapserSceneId): SynapserProjectState {
  if (state.sceneOrder.length <= 1) return state;
  if (!state.sceneOrder.includes(sceneId)) return state;

  const sceneOrder = state.sceneOrder.filter((id) => id !== sceneId);
  const definitions = { ...state.definitions };
  const settings = { ...state.settings };
  const scrollGlitch = { ...state.scrollGlitch };
  delete definitions[sceneId];
  delete settings[sceneId];
  delete scrollGlitch[sceneId];

  return { ...state, sceneOrder, definitions, settings, scrollGlitch };
}

export function resetSceneBundle(
  state: SynapserProjectState,
  sceneId: SynapserSceneId,
): SynapserProjectState {
  const def = state.definitions[sceneId];
  const procedural = def?.procedural ?? "torus";
  return {
    ...state,
    settings: {
      ...state.settings,
      [sceneId]: settingsForProcedural(procedural),
    },
    scrollGlitch: {
      ...state.scrollGlitch,
      [sceneId]: cloneGlitch(DEFAULT_SYNAPSER_SCROLL_GLITCH),
    },
  };
}

/** @deprecated use DEFAULT_SCENE_DEFINITIONS */
export const SYNAPSER_SCENES = DEFAULT_SCENE_DEFINITIONS;
