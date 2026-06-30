import type { SynapserSceneId } from "./synapser-model-store";
import { migrateObjectMotionValue } from "./synapser-object-motion";

export type { SynapserSceneId };

export type Vec3 = [number, number, number];

export type SynapserLightType = "directional" | "point" | "spot";

export type SynapserLightConfig = {
  enabled: boolean;
  type: SynapserLightType;
  intensity: number;
  color: string;
  position: Vec3;
};

export type SynapserCameraKeyframe = {
  at: number;
  position: Vec3;
  lookAt: Vec3;
  fov: number;
};

export type SynapserSceneSettings = {
  lighting: {
    ambientIntensity: number;
    ambientColor: string;
    lights: SynapserLightConfig[];
  };
  background: {
    canvasColor: string;
    fogEnabled: boolean;
    fogColor: string;
    fogNear: number;
    fogFar: number;
    floorColor: string;
    floorVisible: boolean;
    floorY: number;
  };
  objectMotion: {
    floatEnabled: boolean;
    floatSpeed: number;
    rotationIntensity: number;
    floatIntensity: number;
    autoRotateX: number;
    autoRotateY: number;
    autoRotateZ: number;
    groupOffset: Vec3;
    groupScale: number;
    pointerTiltX: number;
    pointerTiltY: number;
  };
  camera: {
    fov: number;
    position: Vec3;
    lookAt: Vec3;
    /** Mouse-edge yaw orbit strength (left/right). */
    pointerDriftX: number;
    /** Mouse-edge pitch orbit strength (up/down, inverted). */
    pointerDriftY: number;
    /** Camera pull toward look-at on object hover (0–1). */
    hoverZoomPull: number;
    /** FOV reduction on object hover. */
    hoverZoomFovPull: number;
    /** Hover zoom in/out smoothing speed. */
    hoverZoomDamp: number;
    /** Pointer orbit smoothing speed. */
    orbitDamp: number;
    /** Edge emphasis curve (lower = stronger at screen edges). */
    orbitEdgePower: number;
    lerpSpeed: number;
    near: number;
    far: number;
  };
  cameraAnimation: {
    enabled: boolean;
    useScrollProgress: boolean;
    loop: boolean;
    fps: number;
    durationFrames: number;
    keyframes: SynapserCameraKeyframe[];
  };
  cinematicScroll: {
    enabled: boolean;
    distanceFar: number;
    distanceNear: number;
    zoomInEnd: number;
    holdEnd: number;
  };
};

export type SynapserSceneSettingsMap = Record<SynapserSceneId, SynapserSceneSettings>;

const STORAGE_KEY = "synapser-scene-settings-v2";
const SCENE_IDS: SynapserSceneId[] = ["manifesto", "archive", "journey"];

const BASE_LIGHTS: SynapserLightConfig[] = [
  {
    enabled: true,
    type: "directional",
    intensity: 1.1,
    color: "#f5e6d3",
    position: [4, 6, 3],
  },
  {
    enabled: true,
    type: "point",
    intensity: 0.5,
    color: "#6b8cce",
    position: [-3, 2, 2],
  },
];

function cloneLights(): SynapserLightConfig[] {
  return BASE_LIGHTS.map((l) => ({ ...l, position: [...l.position] as Vec3 }));
}

function sceneDefaults(
  overrides: {
    lighting?: Partial<SynapserSceneSettings["lighting"]>;
    background?: Partial<SynapserSceneSettings["background"]>;
    objectMotion?: Partial<SynapserSceneSettings["objectMotion"]>;
    camera?: Partial<SynapserSceneSettings["camera"]>;
    cameraAnimation?: Partial<SynapserSceneSettings["cameraAnimation"]>;
    cinematicScroll?: Partial<SynapserSceneSettings["cinematicScroll"]>;
  } = {},
): SynapserSceneSettings {
  const base: SynapserSceneSettings = {
    lighting: {
      ambientIntensity: 0.45,
      ambientColor: "#ffffff",
      lights: cloneLights(),
    },
    background: {
      canvasColor: "#0f0c0a",
      fogEnabled: true,
      fogColor: "#0f0c0a",
      fogNear: 4,
      fogFar: 14,
      floorColor: "#1a1410",
      floorVisible: true,
      floorY: -2,
    },
    objectMotion: {
      floatEnabled: true,
      floatSpeed: 0.12,
      rotationIntensity: 0.08,
      floatIntensity: 0.15,
      autoRotateX: 0,
      autoRotateY: 0,
      autoRotateZ: 0,
      groupOffset: [0, 0, 0],
      groupScale: 1,
      pointerTiltX: 0.001,
      pointerTiltY: 0.002,
    },
    camera: {
      fov: 45,
      position: [0, 1.4, 5.5],
      lookAt: [0, 0, 0],
      pointerDriftX: 0.45,
      pointerDriftY: 0.25,
      hoverZoomPull: 0.42,
      hoverZoomFovPull: 3.5,
      hoverZoomDamp: 7,
      orbitDamp: 8,
      orbitEdgePower: 0.82,
      lerpSpeed: 0.06,
      near: 0.1,
      far: 100,
    },
    cameraAnimation: {
      enabled: false,
      useScrollProgress: true,
      loop: false,
      fps: 30,
      durationFrames: 90,
      keyframes: [
        { at: 0, position: [0, 1.4, 5.5], lookAt: [0, 0, 0], fov: 45 },
        { at: 1, position: [2.2, 2.1, 4.2], lookAt: [0, 0, 0], fov: 45 },
      ],
    },
    cinematicScroll: {
      enabled: true,
      distanceFar: 10,
      distanceNear: 4,
      zoomInEnd: 0.38,
      holdEnd: 0.62,
    },
  };

  return {
    lighting: { ...base.lighting, ...overrides.lighting },
    background: { ...base.background, ...overrides.background },
    objectMotion: { ...base.objectMotion, ...overrides.objectMotion },
    camera: { ...base.camera, ...overrides.camera },
    cameraAnimation: {
      ...base.cameraAnimation,
      ...overrides.cameraAnimation,
      keyframes:
        overrides.cameraAnimation?.keyframes ?? base.cameraAnimation.keyframes,
    },
    cinematicScroll: {
      ...base.cinematicScroll,
      ...overrides.cinematicScroll,
    },
  };
}

export const DEFAULT_SYNAPSER_SCENE_SETTINGS: SynapserSceneSettingsMap = {
  manifesto: sceneDefaults({
    background: { canvasColor: "#0a1c4d", fogColor: "#0a1c4d", fogEnabled: false },
    objectMotion: { floatSpeed: 0.1, rotationIntensity: 0.06, floatIntensity: 0.12, floatEnabled: false },
  }),
  archive: sceneDefaults({
    background: { canvasColor: "#0f0c0a", fogColor: "#0f0c0a" },
    objectMotion: { floatSpeed: 0.1, rotationIntensity: 0.06, floatIntensity: 0.12, groupOffset: [0, -0.2, 0], floatEnabled: false },
    lighting: {
      ambientIntensity: 0.4,
      ambientColor: "#e8edf5",
      lights: [
        { enabled: true, type: "directional", intensity: 0.95, color: "#d4dce8", position: [3, 5, 4] },
        { enabled: true, type: "point", intensity: 0.35, color: "#8a9bb5", position: [-2, 1.5, 3] },
      ],
    },
  }),
  journey: sceneDefaults({
    background: { canvasColor: "#060810", fogColor: "#060810", fogFar: 16 },
    objectMotion: { floatSpeed: 0.08, rotationIntensity: 0.05, floatIntensity: 0.1, floatEnabled: false },
  }),
};

function deepCloneSettings(map: SynapserSceneSettingsMap): SynapserSceneSettingsMap {
  return JSON.parse(JSON.stringify(map)) as SynapserSceneSettingsMap;
}

function normalizeObjectMotion(
  motion: Partial<SynapserSceneSettings["objectMotion"]>,
  defaults: SynapserSceneSettings["objectMotion"],
): SynapserSceneSettings["objectMotion"] {
  const merged = { ...defaults, ...motion };
  return {
    ...merged,
    floatSpeed: migrateObjectMotionValue("floatSpeed", merged.floatSpeed),
    rotationIntensity: migrateObjectMotionValue("rotationIntensity", merged.rotationIntensity),
    floatIntensity: migrateObjectMotionValue("floatIntensity", merged.floatIntensity),
    autoRotateX: migrateObjectMotionValue("autoRotateX", merged.autoRotateX),
    autoRotateY: migrateObjectMotionValue("autoRotateY", merged.autoRotateY),
    autoRotateZ: migrateObjectMotionValue("autoRotateZ", merged.autoRotateZ),
  };
}

function mergeSceneSettings(partial: Partial<SynapserSceneSettings>): SynapserSceneSettings {
  const defaults = sceneDefaults();
  return {
    lighting: { ...defaults.lighting, ...partial.lighting, lights: partial.lighting?.lights ?? defaults.lighting.lights },
    background: { ...defaults.background, ...partial.background },
    objectMotion: normalizeObjectMotion(partial.objectMotion ?? {}, defaults.objectMotion),
    camera: { ...defaults.camera, ...partial.camera },
    cameraAnimation: {
      ...defaults.cameraAnimation,
      ...partial.cameraAnimation,
      keyframes: partial.cameraAnimation?.keyframes ?? defaults.cameraAnimation.keyframes,
    },
    cinematicScroll: { ...defaults.cinematicScroll, ...partial.cinematicScroll },
  };
}

export function readSynapserSceneSettingsMap(): SynapserSceneSettingsMap {
  if (typeof window === "undefined") return deepCloneSettings(DEFAULT_SYNAPSER_SCENE_SETTINGS);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return deepCloneSettings(DEFAULT_SYNAPSER_SCENE_SETTINGS);
    const parsed = JSON.parse(raw) as Partial<SynapserSceneSettingsMap>;
    const result = deepCloneSettings(DEFAULT_SYNAPSER_SCENE_SETTINGS);
    for (const id of SCENE_IDS) {
      if (parsed[id]) result[id] = mergeSceneSettings(parsed[id]!);
    }
    return result;
  } catch {
    return deepCloneSettings(DEFAULT_SYNAPSER_SCENE_SETTINGS);
  }
}

export function writeSynapserSceneSettingsMap(map: SynapserSceneSettingsMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function resetSynapserSceneSettings(sceneId: SynapserSceneId): SynapserSceneSettingsMap {
  const map = readSynapserSceneSettingsMap();
  map[sceneId] = deepCloneSettings(DEFAULT_SYNAPSER_SCENE_SETTINGS)[sceneId];
  writeSynapserSceneSettingsMap(map);
  return map;
}

export function resetAllSynapserSceneSettings(): SynapserSceneSettingsMap {
  const map = deepCloneSettings(DEFAULT_SYNAPSER_SCENE_SETTINGS);
  writeSynapserSceneSettingsMap(map);
  return map;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

export function sampleCameraKeyframes(
  keyframes: SynapserCameraKeyframe[],
  t: number,
): { position: Vec3; lookAt: Vec3; fov: number } {
  if (keyframes.length === 0) {
    return { position: [0, 1.4, 5.5], lookAt: [0, 0, 0], fov: 45 };
  }
  if (keyframes.length === 1) {
    const k = keyframes[0];
    return { position: k.position, lookAt: k.lookAt, fov: k.fov };
  }
  const sorted = [...keyframes].sort((a, b) => a.at - b.at);
  const clamped = Math.max(0, Math.min(1, t));
  if (clamped <= sorted[0].at) {
    return { position: sorted[0].position, lookAt: sorted[0].lookAt, fov: sorted[0].fov };
  }
  const last = sorted[sorted.length - 1];
  if (clamped >= last.at) {
    return { position: last.position, lookAt: last.lookAt, fov: last.fov };
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (clamped >= a.at && clamped <= b.at) {
      const local = (clamped - a.at) / (b.at - a.at || 1);
      return {
        position: lerpVec3(a.position, b.position, local),
        lookAt: lerpVec3(a.lookAt, b.lookAt, local),
        fov: lerp(a.fov, b.fov, local),
      };
    }
  }
  return { position: last.position, lookAt: last.lookAt, fov: last.fov };
}

export function smoothstep(t: number) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

/** 0 = far from target, 1 = near to target */
export function cinematicZoomT(
  localT: number,
  config: SynapserSceneSettings["cinematicScroll"],
): number {
  const t = Math.max(0, Math.min(1, localT));
  const zoomInEnd = config.zoomInEnd;
  const holdEnd = config.holdEnd;

  if (t < zoomInEnd) {
    return smoothstep(t / zoomInEnd);
  }
  if (t < holdEnd) {
    return 1;
  }
  return 1 - smoothstep((t - holdEnd) / (1 - holdEnd));
}

export function getCinematicCamera(
  settings: SynapserSceneSettings,
  zoomT: number,
): { position: Vec3; lookAt: Vec3; fov: number } {
  const cfg = settings.cinematicScroll;
  const cam = settings.camera;
  const dist = lerp(cfg.distanceFar, cfg.distanceNear, zoomT);
  const lookAt: Vec3 = [0, 0, 0];
  const height = cam.position[1];

  return {
    position: [0, height, dist],
    lookAt,
    fov: cam.fov,
  };
}

export function getSceneLocalProgress(globalP: number, sceneIndex: number): number {
  const segment = 1 / 3;
  const start = sceneIndex * segment;
  const local = (globalP - start) / segment;
  return Math.max(0, Math.min(1, local));
}

export function getActiveSceneIndex(globalP: number): number {
  return Math.min(2, Math.max(0, Math.floor(globalP * 3)));
}

const CROSSFADE = 0.08;

export function getCinematicSceneVisibilities(
  globalP: number,
): Record<SynapserSceneId, number> {
  const segment = 1 / 3;
  const result: Record<SynapserSceneId, number> = {
    manifesto: 0,
    archive: 0,
    journey: 0,
  };

  SCENE_IDS.forEach((id, i) => {
    const start = i * segment;
    const raw = (globalP - start) / segment;

    if (raw < -0.02 || raw > 1.02) {
      result[id] = 0;
      return;
    }

    if (raw <= 0) {
      result[id] = globalP > start ? smoothstep(Math.min(1, (globalP - start) / (segment * CROSSFADE))) : 0;
      return;
    }

    if (raw >= 1) {
      result[id] = globalP < start + segment ? smoothstep(Math.min(1, (start + segment - globalP) / (segment * CROSSFADE))) : 0;
      return;
    }

    let vis = 1;
    if (raw < CROSSFADE) vis = smoothstep(raw / CROSSFADE);
    else if (raw > 1 - CROSSFADE) vis = smoothstep((1 - raw) / CROSSFADE);
    result[id] = vis;
  });

  return result;
}

/** @deprecated use getCinematicSceneVisibilities for scroll-driven scenes */
export function getSceneVisibilities(globalP: number): Record<SynapserSceneId, number> {
  return getCinematicSceneVisibilities(globalP);
}

export const MAX_SCENE_LIGHTS = 3;
