import {
  DEFAULT_OBJECT_ANCHOR,
  DEFAULT_TYPOGRAPHY_ANCHOR,
  getSynapserTypographyAnchorStyle,
  getSynapserTypographyTextAlign,
  normalizeSynapserAnchor,
  type SynapserAnchorAlignX,
  type SynapserAnchorAlignY,
  type SynapserAnchorSettings,
} from "./synapser-anchor-layout";
import {
  DEFAULT_CINEMATIC_ZOOM_IN,
  DEFAULT_CINEMATIC_ZOOM_OUT,
  DEFAULT_CINEMATIC_SCROLL_ROTATION,
  normalizeCinematicScroll,
  scrollDrivenCinematicZoomT,
  type CinematicEasing,
  type CinematicScrollTransition,
  type CinematicZoomRuntime,
} from "./synapser-cinematic-zoom";
import type { SynapserSceneId } from "./synapser-model-store";
import { migrateObjectMotionValue } from "./synapser-object-motion";

export type { CinematicEasing, CinematicScrollTransition };
export { normalizeCinematicScroll };

export type { SynapserSceneId };

export type { SynapserAnchorAlignX, SynapserAnchorAlignY, SynapserAnchorSettings };

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

export type SynapserTypographyAlignX = SynapserAnchorAlignX;
export type SynapserTypographyAlignY = SynapserAnchorAlignY;

export type SynapserTypographySettings = SynapserAnchorSettings;
export type SynapserObjectAnchorSettings = SynapserAnchorSettings;

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
    /** Screen anchor — object center aligns to this 3×3 grid point. */
    anchor: SynapserObjectAnchorSettings;
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
    /** @deprecated use autoZoomIn.end */
    zoomInEnd: number;
    /** @deprecated use autoZoomOut.start */
    holdEnd: number;
    autoZoomIn: CinematicScrollTransition;
    autoZoomOut: CinematicScrollTransition;
    scrollRotation: {
      revolutions: number;
      easing: CinematicEasing;
    };
  };
  typography: SynapserTypographySettings;
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

const DEFAULT_TYPOGRAPHY: SynapserTypographySettings = { ...DEFAULT_TYPOGRAPHY_ANCHOR };

export function sceneDefaults(
  overrides: {
    lighting?: Partial<SynapserSceneSettings["lighting"]>;
    background?: Partial<SynapserSceneSettings["background"]>;
    objectMotion?: Partial<SynapserSceneSettings["objectMotion"]>;
    camera?: Partial<SynapserSceneSettings["camera"]>;
    cameraAnimation?: Partial<SynapserSceneSettings["cameraAnimation"]>;
    cinematicScroll?: Partial<SynapserSceneSettings["cinematicScroll"]>;
    typography?: Partial<SynapserTypographySettings>;
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
      anchor: { ...DEFAULT_OBJECT_ANCHOR },
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
    cinematicScroll: normalizeCinematicScroll({
      enabled: true,
      distanceFar: 10,
      distanceNear: 4,
      autoZoomIn: { ...DEFAULT_CINEMATIC_ZOOM_IN },
      autoZoomOut: { ...DEFAULT_CINEMATIC_ZOOM_OUT },
      scrollRotation: { ...DEFAULT_CINEMATIC_SCROLL_ROTATION },
    }),
    typography: { ...DEFAULT_TYPOGRAPHY },
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
    cinematicScroll: normalizeCinematicScroll({
      ...base.cinematicScroll,
      ...overrides.cinematicScroll,
    }),
    typography: { ...base.typography, ...overrides.typography },
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
    anchor: normalizeSynapserAnchor(motion.anchor, defaults.anchor),
  };
}

/** Deep-merge a partial patch onto existing scene settings (preserves nested arrays). */
export function applySceneSettingsPatch(
  base: SynapserSceneSettings,
  patch: Partial<SynapserSceneSettings>,
): SynapserSceneSettings {
  return {
    lighting: patch.lighting
      ? {
          ...base.lighting,
          ...patch.lighting,
          lights: patch.lighting.lights ?? base.lighting.lights,
        }
      : base.lighting,
    background: patch.background ? { ...base.background, ...patch.background } : base.background,
    objectMotion: patch.objectMotion
      ? {
          ...normalizeObjectMotion({ ...base.objectMotion, ...patch.objectMotion }, base.objectMotion),
          anchor: patch.objectMotion.anchor
            ? normalizeSynapserAnchor(
                { ...base.objectMotion.anchor, ...patch.objectMotion.anchor },
                base.objectMotion.anchor,
              )
            : base.objectMotion.anchor,
        }
      : base.objectMotion,
    camera: patch.camera ? { ...base.camera, ...patch.camera } : base.camera,
    cameraAnimation: patch.cameraAnimation
      ? {
          ...base.cameraAnimation,
          ...patch.cameraAnimation,
          keyframes: patch.cameraAnimation.keyframes ?? base.cameraAnimation.keyframes,
        }
      : base.cameraAnimation,
    cinematicScroll: patch.cinematicScroll
      ? normalizeCinematicScroll({ ...base.cinematicScroll, ...patch.cinematicScroll })
      : base.cinematicScroll,
    typography: patch.typography
      ? normalizeSynapserTypography({ ...base.typography, ...patch.typography })
      : base.typography,
  };
}

export function mergeSceneSettings(partial: Partial<SynapserSceneSettings>): SynapserSceneSettings {
  const defaults = sceneDefaults();
  return {
    lighting: {
      ...defaults.lighting,
      ...partial.lighting,
      lights: partial.lighting?.lights ?? defaults.lighting.lights,
    },
    background: { ...defaults.background, ...partial.background },
    objectMotion: normalizeObjectMotion(partial.objectMotion ?? {}, defaults.objectMotion),
    camera: { ...defaults.camera, ...partial.camera },
    cameraAnimation: {
      ...defaults.cameraAnimation,
      ...partial.cameraAnimation,
      keyframes: partial.cameraAnimation?.keyframes ?? defaults.cameraAnimation.keyframes,
    },
    cinematicScroll: normalizeCinematicScroll({
      ...defaults.cinematicScroll,
      ...partial.cinematicScroll,
    }),
    typography: normalizeSynapserTypography(partial.typography),
  };
}

export function normalizeSynapserTypography(
  typography?: Partial<SynapserTypographySettings> | null,
): SynapserTypographySettings {
  return normalizeSynapserAnchor(typography, DEFAULT_TYPOGRAPHY);
}

export function getSynapserTypographyLayoutClasses(
  typography?: Partial<SynapserTypographySettings> | null,
): {
  container: string;
  body: string;
  anchorStyle: ReturnType<typeof getSynapserTypographyAnchorStyle>;
} {
  const t = normalizeSynapserTypography(typography);
  const textAlign = getSynapserTypographyTextAlign(t);

  return {
    container: `pointer-events-none absolute z-10 flex flex-col px-4 sm:px-6 ${textAlign}`,
    body:
      t.alignX === "center"
        ? "mx-auto max-w-md"
        : t.alignX === "right"
          ? "ml-auto max-w-md"
          : "max-w-md",
    anchorStyle: getSynapserTypographyAnchorStyle(t),
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

/** @deprecated use scrollDrivenCinematicZoomT */
export function cinematicZoomT(
  localT: number,
  config: SynapserSceneSettings["cinematicScroll"],
): number {
  return scrollDrivenCinematicZoomT(localT, normalizeCinematicScroll(config));
}

export function getCinematicCamera(
  settings: SynapserSceneSettings,
  zoomT: number,
): { position: Vec3; lookAt: Vec3; fov: number; forward: Vec3 } {
  const cfg = settings.cinematicScroll;
  const cam = settings.camera;
  const lookAt: Vec3 = [cam.lookAt[0], cam.lookAt[1], cam.lookAt[2]];
  const base: Vec3 = [cam.position[0], cam.position[1], cam.position[2]];

  const toLook: Vec3 = [lookAt[0] - base[0], lookAt[1] - base[1], lookAt[2] - base[2]];
  const baseLen = Math.hypot(toLook[0], toLook[1], toLook[2]);
  if (baseLen < 1e-6) {
    return { position: base, lookAt, fov: cam.fov, forward: [0, 0, -1] };
  }

  const fwd: Vec3 = [toLook[0] / baseLen, toLook[1] / baseLen, toLook[2] / baseLen];
  const nearDist = cfg.distanceNear;
  const farDist = Math.max(nearDist, cfg.distanceFar);
  const pullBack = (1 - clamp01(zoomT)) * (farDist - nearDist);

  const nearPos: Vec3 = [
    lookAt[0] - fwd[0] * nearDist,
    lookAt[1] - fwd[1] * nearDist,
    lookAt[2] - fwd[2] * nearDist,
  ];

  return {
    position: [
      nearPos[0] - fwd[0] * pullBack,
      nearPos[1] - fwd[1] * pullBack,
      nearPos[2] - fwd[2] * pullBack,
    ],
    lookAt,
    fov: cam.fov,
    forward: fwd,
  };
}

/** Active scene only — no start crossfade; background/object/floor are fully visible. */
export function getSynapserSceneVisibilities(
  globalP: number,
  sceneIds: string[],
  sceneSettings: Record<string, { cinematicScroll?: { enabled?: boolean } }>,
): Record<string, number> {
  const sceneCount = sceneIds.length;
  if (sceneCount === 0) return {};

  const activeIdx = getActiveSceneIndex(globalP, sceneCount);
  const activeId = sceneIds[activeIdx];
  const cinematic = Boolean(activeId && sceneSettings[activeId]?.cinematicScroll?.enabled);

  if (cinematic) {
    const result: Record<string, number> = {};
    for (const id of sceneIds) result[id] = id === activeId ? 1 : 0;
    return result;
  }

  return getCinematicSceneVisibilities(globalP, sceneIds);
}

export function applySynapserSceneGroupScales(
  sceneIds: string[],
  vis: Record<string, number>,
  setScale: (sceneId: string, weight: number) => void,
): void {
  for (const id of sceneIds) {
    setScale(id, vis[id] ?? 0);
  }
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function getSceneLocalProgress(
  globalP: number,
  sceneIndex: number,
  sceneCount = 3,
): number {
  if (sceneCount <= 0) return 0;
  const segment = 1 / sceneCount;
  const start = sceneIndex * segment;
  const local = (globalP - start) / segment;
  return Math.max(0, Math.min(1, local));
}

export function getActiveSceneIndex(globalP: number, sceneCount = 3): number {
  if (sceneCount <= 0) return 0;
  return Math.min(sceneCount - 1, Math.max(0, Math.floor(globalP * sceneCount)));
}

const CROSSFADE = 0.08;

export function getCinematicSceneVisibilities(
  globalP: number,
  sceneIds: string[],
): Record<string, number> {
  const sceneCount = sceneIds.length;
  if (sceneCount === 0) return {};
  const segment = 1 / sceneCount;
  const result: Record<string, number> = {};
  for (const id of sceneIds) result[id] = 0;

  sceneIds.forEach((id, i) => {
    const start = i * segment;
    const raw = (globalP - start) / segment;

    if (raw < -0.02 || raw > 1.02) {
      result[id] = 0;
      return;
    }

    if (raw <= 0) {
      result[id] =
        globalP >= start - segment * 0.001
          ? smoothstep(Math.min(1, (globalP - start + segment * 0.002) / (segment * CROSSFADE)))
          : 0;
      return;
    }

    if (raw >= 1) {
      result[id] =
        globalP <= start + segment + segment * 0.001
          ? smoothstep(Math.min(1, (start + segment - globalP + segment * 0.002) / (segment * CROSSFADE)))
          : 0;
      return;
    }

    let vis = 1;
    if (raw < CROSSFADE) vis = smoothstep(raw / CROSSFADE);
    else if (raw > 1 - CROSSFADE) vis = smoothstep((1 - raw) / CROSSFADE);
    result[id] = vis;
  });

  return result;
}

export function getChainedSceneVisibilities(
  sceneOrder: string[],
  runtimes: Record<string, CinematicZoomRuntime>,
  sceneSettings: Record<string, { cinematicScroll?: import("./synapser-cinematic-zoom").SynapserCinematicScrollSettings }>,
  chainHead: number,
  fallbackGlobalP: number,
): Record<string, number> {
  const vis = getCinematicSceneVisibilities(fallbackGlobalP, sceneOrder);
  const headId = sceneOrder[chainHead];
  if (!headId) return vis;

  const headRuntime = runtimes[headId];
  const headConfig = sceneSettings[headId]?.cinematicScroll;
  if (!headRuntime || !headConfig?.enabled) return vis;

  if (
    headRuntime.phase === "zooming-in" ||
    headRuntime.phase === "hold" ||
    headRuntime.phase === "zooming-out"
  ) {
    vis[headId] = Math.max(vis[headId] ?? 0, 0.35 + headRuntime.zoomT * 0.65);
  }

  if (chainHead > 0 && headRuntime.phase === "zooming-in") {
    const prevId = sceneOrder[chainHead - 1];
    const blend = smoothstep(headRuntime.zoomT);
    if (prevId) vis[prevId] = (vis[prevId] ?? 0) * (1 - blend);
    vis[headId] = Math.max(vis[headId] ?? 0, blend);
  }

  return vis;
}

/** @deprecated use getCinematicSceneVisibilities(globalP, sceneIds) */
export function getCinematicSceneVisibilitiesLegacy(
  globalP: number,
): Record<SynapserSceneId, number> {
  return getCinematicSceneVisibilities(globalP, SCENE_IDS) as Record<SynapserSceneId, number>;
}

/** @deprecated use getCinematicSceneVisibilities for scroll-driven scenes */
export function getSceneVisibilities(
  globalP: number,
  sceneIds: SynapserSceneId[] = SCENE_IDS,
): Record<string, number> {
  return getCinematicSceneVisibilities(globalP, sceneIds);
}

export const MAX_SCENE_LIGHTS = 3;
