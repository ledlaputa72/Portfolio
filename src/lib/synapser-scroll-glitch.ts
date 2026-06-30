import { getActiveSceneIndex, getSceneLocalProgress } from "./synapser-scene-settings";

export type SynapserGlitchPresetId = "cinematic" | "rupture" | "pulse" | "whisper" | "custom";

export type SynapserGlitchLayerSettings = {
  enabled: boolean;
  intensity: number;
  rgbShift: number;
  sliceStrength: number;
  scanlineOpacity: number;
  gritOpacity: number;
  irregularity: number;
};

export type SynapserGlitchObjectLayer = SynapserGlitchLayerSettings & {
  displace: number;
  /** Idle glitch floor as fraction of configured intensity (default 0.3 = 30%). */
  idleMin: number;
  /** Idle glitch ceiling as fraction of configured intensity (default 0.6 = 60%). */
  idleMax: number;
  /** Speed of idle pulse between idleMin and idleMax. */
  idlePulseSpeed: number;
  /** Glitch multiplier on pointer hover (default 1.5 = 150%). */
  hoverMultiplier: number;
  colorAccent: string;
  colorFringeA: string;
  colorFringeB: string;
  colorBar: string;
  colorSpeckle: string;
  /** Blend from procedural noise (0) toward accent palette (1). */
  colorTint: number;
};

export type SynapserGlitchScreenLayer = SynapserGlitchLayerSettings & {
  /** Rectangular speckle particle density across the full screen. */
  particleDensity: number;
};

export type SynapserScrollGlitchSettings = {
  preset: SynapserGlitchPresetId;
  enabled: boolean;
  masterIntensity: number;
  decayRate: number;
  burstOnSceneChange: boolean;
  burstAtSceneStart: boolean;
  sceneStartWindow: number;
  scrollSensitivity: number;
  object: SynapserGlitchObjectLayer;
  flat: SynapserGlitchLayerSettings;
  screen: SynapserGlitchScreenLayer;
};

const DEFAULT_LAYER: SynapserGlitchLayerSettings = {
  enabled: true,
  intensity: 1,
  rgbShift: 1.15,
  sliceStrength: 1.15,
  scanlineOpacity: 0.55,
  gritOpacity: 0.65,
  irregularity: 0.78,
};

const DEFAULT_OBJECT: SynapserGlitchObjectLayer = {
  ...DEFAULT_LAYER,
  displace: 2.7,
  idleMin: 0.3,
  idleMax: 0.6,
  idlePulseSpeed: 0.85,
  hoverMultiplier: 1.5,
  colorAccent: "#ff006e",
  colorFringeA: "#ff0073",
  colorFringeB: "#00d4ff",
  colorBar: "#f5f0eb",
  colorSpeckle: "#ffffff",
  colorTint: 0.72,
};

const DEFAULT_FLAT: SynapserGlitchLayerSettings = {
  ...DEFAULT_LAYER,
  intensity: 1,
  sliceStrength: 0.95,
  rgbShift: 1.1,
};

const DEFAULT_SCREEN: SynapserGlitchScreenLayer = {
  ...DEFAULT_LAYER,
  intensity: 0.07,
  sliceStrength: 0.5,
  gritOpacity: 0.55,
  scanlineOpacity: 0.45,
  irregularity: 0.72,
  particleDensity: 0.75,
};

export type SynapserScrollGlitchSettingsPatch = Partial<
  Omit<SynapserScrollGlitchSettings, "object" | "flat" | "screen">
> & {
  object?: Partial<SynapserGlitchObjectLayer>;
  flat?: Partial<SynapserGlitchLayerSettings>;
  screen?: Partial<SynapserGlitchScreenLayer>;
};

function buildPreset(
  id: Exclude<SynapserGlitchPresetId, "custom">,
  overrides: SynapserScrollGlitchSettingsPatch,
): SynapserScrollGlitchSettings {
  const { object, flat, screen, ...rest } = overrides;
  return {
    preset: id,
    enabled: true,
    masterIntensity: 1,
    decayRate: 0.88,
    burstOnSceneChange: true,
    burstAtSceneStart: true,
    sceneStartWindow: 0.1,
    scrollSensitivity: 1.6,
    ...rest,
    object: { ...DEFAULT_OBJECT, ...object },
    flat: { ...DEFAULT_FLAT, ...flat },
    screen: { ...DEFAULT_SCREEN, ...screen },
  };
}

export const SYNAPSER_GLITCH_PRESET_OPTIONS: {
  id: Exclude<SynapserGlitchPresetId, "custom">;
  label: string;
  description: string;
}[] = [
  { id: "cinematic", label: "Cinematic", description: "오브젝트 중심 · 화면은 은은하게" },
  { id: "rupture", label: "Rupture", description: "씬 전환 시 불규칙 파열" },
  { id: "pulse", label: "Pulse", description: "스크롤 속도에 맞춰 맥동" },
  { id: "whisper", label: "Whisper", description: "가장 절제된 표현" },
];

export const SYNAPSER_GLITCH_PRESETS: Record<
  Exclude<SynapserGlitchPresetId, "custom">,
  SynapserScrollGlitchSettings
> = {
  cinematic: buildPreset("cinematic", {
    object: { intensity: 1.15, irregularity: 0.82, displace: 2.7 },
    flat: { intensity: 1, rgbShift: 1.1 },
    screen: { intensity: 0.07 },
    scrollSensitivity: 1.5,
  }),
  rupture: buildPreset("rupture", {
    masterIntensity: 1.15,
    sceneStartWindow: 0.14,
    decayRate: 0.85,
    object: { intensity: 1.45, irregularity: 0.9, sliceStrength: 1.45, rgbShift: 1.35, displace: 2.9 },
    flat: { intensity: 1.2, sliceStrength: 1.3, irregularity: 0.85 },
    screen: { intensity: 0.1 },
    scrollSensitivity: 1.2,
  }),
  pulse: buildPreset("pulse", {
    burstAtSceneStart: false,
    decayRate: 0.9,
    scrollSensitivity: 2.6,
    object: { intensity: 1.05, irregularity: 0.72 },
    flat: { intensity: 0.95 },
    screen: { intensity: 0.06 },
  }),
  whisper: buildPreset("whisper", {
    masterIntensity: 0.82,
    scrollSensitivity: 0.9,
    object: { intensity: 0.62, irregularity: 0.58, sliceStrength: 0.85, displace: 2.4 },
    flat: { intensity: 0.7, gritOpacity: 0.45 },
    screen: { intensity: 0.035, gritOpacity: 0.3 },
  }),
};

export const DEFAULT_SYNAPSER_SCROLL_GLITCH: SynapserScrollGlitchSettings = {
  ...SYNAPSER_GLITCH_PRESETS.cinematic,
};

const STORAGE_KEY = "synapser-scroll-glitch-v5";
const LEGACY_STORAGE_KEYS = ["synapser-scroll-glitch-v4", "synapser-scroll-glitch-v3"];

type LegacyFlat = {
  intensity?: number;
  objectIntensity?: number;
  screenIntensity?: number;
  objectFocusSize?: number;
  typographyGlitch?: boolean;
  rgbShift?: number;
  sliceStrength?: number;
  scanlineOpacity?: number;
  gritOpacity?: number;
  irregularity?: number;
};

function migrateLegacySettings(parsed: LegacyFlat & Partial<SynapserScrollGlitchSettings>): SynapserScrollGlitchSettings {
  if (parsed.object && parsed.flat && parsed.screen) {
    return {
      ...DEFAULT_SYNAPSER_SCROLL_GLITCH,
      ...parsed,
      object: { ...DEFAULT_OBJECT, ...parsed.object },
      flat: { ...DEFAULT_FLAT, ...parsed.flat },
      screen: { ...DEFAULT_SCREEN, ...parsed.screen },
    };
  }

  const shared = {
    rgbShift: parsed.rgbShift ?? DEFAULT_LAYER.rgbShift,
    sliceStrength: parsed.sliceStrength ?? DEFAULT_LAYER.sliceStrength,
    scanlineOpacity: parsed.scanlineOpacity ?? DEFAULT_LAYER.scanlineOpacity,
    gritOpacity: parsed.gritOpacity ?? DEFAULT_LAYER.gritOpacity,
    irregularity: parsed.irregularity ?? DEFAULT_LAYER.irregularity,
  };

  return {
    ...DEFAULT_SYNAPSER_SCROLL_GLITCH,
    preset: parsed.preset ?? "cinematic",
    enabled: parsed.enabled ?? true,
    masterIntensity: parsed.masterIntensity ?? parsed.intensity ?? 1,
    decayRate: parsed.decayRate ?? 0.88,
    burstOnSceneChange: parsed.burstOnSceneChange ?? true,
    burstAtSceneStart: parsed.burstAtSceneStart ?? true,
    sceneStartWindow: parsed.sceneStartWindow ?? 0.1,
    scrollSensitivity: parsed.scrollSensitivity ?? 1.6,
    object: {
      ...DEFAULT_OBJECT,
      ...shared,
      enabled: true,
      intensity: parsed.objectIntensity ?? parsed.object?.intensity ?? 1.15,
      displace: parsed.objectFocusSize ?? parsed.object?.displace ?? 2.7,
    },
    flat: {
      ...DEFAULT_FLAT,
      ...shared,
      enabled: parsed.typographyGlitch ?? parsed.flat?.enabled ?? true,
      intensity: parsed.flat?.intensity ?? 1,
    },
    screen: {
      ...DEFAULT_SCREEN,
      ...shared,
      enabled: true,
      intensity: parsed.screenIntensity ?? parsed.screen?.intensity ?? 0.07,
    },
  };
}

export function applySynapserGlitchPreset(
  id: Exclude<SynapserGlitchPresetId, "custom">,
): SynapserScrollGlitchSettings {
  return { ...SYNAPSER_GLITCH_PRESETS[id] };
}

export function parseSynapserHexColor(hex: string): [number, number, number] {
  let raw = hex.trim().replace("#", "");
  if (raw.length === 3) raw = raw.split("").map((c) => c + c).join("");
  const num = Number.parseInt(raw, 16);
  if (!Number.isFinite(num) || raw.length !== 6) return [1, 1, 1];
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

export function computeSynapserObjectGlitchIntensity({
  settings,
  scrollBurst,
  sceneVisibility,
  idlePhase,
  hoverBlend = 0,
}: {
  settings: SynapserScrollGlitchSettings;
  /** Scroll-driven burst 0–1 (glitchRef × master × object intensity × visibility). */
  scrollBurst: number;
  sceneVisibility: number;
  /** 0–1 oscillation phase for idle pulse. */
  idlePhase: number;
  /** 0–1 pointer hover blend for this scene's object. */
  hoverBlend?: number;
}): number {
  const layer = settings.object;
  if (!layer.enabled || sceneVisibility <= 0.015) return 0;

  const configured = settings.masterIntensity * layer.intensity * sceneVisibility;
  if (configured <= 0.015) return 0;

  const idleFactor = layer.idleMin + (layer.idleMax - layer.idleMin) * idlePhase;
  const idle = configured * idleFactor;
  const base = Math.max(idle, scrollBurst);

  if (hoverBlend > 0.001) {
    const hoveredGlitch = configured * layer.hoverMultiplier;
    return base + (hoveredGlitch - base) * Math.min(1, hoverBlend);
  }

  return base;
}

export function readSynapserScrollGlitchSettings(): SynapserScrollGlitchSettings {
  if (typeof window === "undefined") return { ...DEFAULT_SYNAPSER_SCROLL_GLITCH };
  try {
    for (const key of [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as LegacyFlat & Partial<SynapserScrollGlitchSettings>;
      const settings = migrateLegacySettings(parsed);
      if (key !== STORAGE_KEY) writeSynapserScrollGlitchSettings(settings);
      return settings;
    }
    return { ...DEFAULT_SYNAPSER_SCROLL_GLITCH };
  } catch {
    return { ...DEFAULT_SYNAPSER_SCROLL_GLITCH };
  }
}

export function writeSynapserScrollGlitchSettings(settings: SynapserScrollGlitchSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function resetSynapserScrollGlitchSettings(): SynapserScrollGlitchSettings {
  const defaults = { ...DEFAULT_SYNAPSER_SCROLL_GLITCH };
  writeSynapserScrollGlitchSettings(defaults);
  return defaults;
}

export function mergeScrollGlitchPatch(
  prev: SynapserScrollGlitchSettings,
  patch: SynapserScrollGlitchSettingsPatch,
): SynapserScrollGlitchSettings {
  return {
    ...prev,
    ...patch,
    object: patch.object ? { ...prev.object, ...patch.object } : prev.object,
    flat: patch.flat ? { ...prev.flat, ...patch.flat } : prev.flat,
    screen: patch.screen ? { ...prev.screen, ...patch.screen } : prev.screen,
  };
}

export function applySynapserScrollGlitch({
  progress,
  prevSceneIndex,
  prevProgress,
  glitchRef,
  settings,
}: {
  progress: number;
  prevSceneIndex: number;
  prevProgress: number;
  glitchRef: { current: number };
  settings: SynapserScrollGlitchSettings;
}): number {
  if (!settings.enabled) {
    glitchRef.current = 0;
    return getActiveSceneIndex(progress);
  }

  let glitch = glitchRef.current;
  const sceneIndex = getActiveSceneIndex(progress);
  const local = getSceneLocalProgress(progress, sceneIndex);

  if (settings.burstOnSceneChange && sceneIndex !== prevSceneIndex) {
    glitch = 1;
  }

  if (settings.burstAtSceneStart && local < settings.sceneStartWindow) {
    const ramp = 1 - local / settings.sceneStartWindow;
    glitch = Math.max(glitch, ramp);
  }

  if (settings.scrollSensitivity > 0) {
    const delta = Math.abs(progress - prevProgress);
    if (delta > 0.0001) {
      glitch = Math.max(glitch, Math.min(1, delta * settings.scrollSensitivity * 22));
    }
  }

  glitchRef.current = Math.max(0, Math.min(1, glitch));
  return sceneIndex;
}

export function getSynapserGlitchDisplay(
  glitchRef: { current: number },
  settings: SynapserScrollGlitchSettings,
): number {
  if (!settings.enabled) return 0;
  return Math.max(0, Math.min(1, glitchRef.current * settings.masterIntensity));
}

export function getSynapserLayerGlitchDisplay(
  glitchRef: { current: number },
  settings: SynapserScrollGlitchSettings,
  layer: "object" | "flat" | "screen",
): number {
  const zone = settings[layer];
  if (!settings.enabled || !zone.enabled) return 0;
  return getSynapserGlitchDisplay(glitchRef, settings) * zone.intensity;
}

export function getSynapserObjectGlitchDisplay(
  glitchRef: { current: number },
  settings: SynapserScrollGlitchSettings,
): number {
  return getSynapserLayerGlitchDisplay(glitchRef, settings, "object");
}

export function getSynapserFlatGlitchDisplay(
  glitchRef: { current: number },
  settings: SynapserScrollGlitchSettings,
): number {
  return getSynapserLayerGlitchDisplay(glitchRef, settings, "flat");
}

export function getSynapserScreenGlitchDisplay(
  glitchRef: { current: number },
  settings: SynapserScrollGlitchSettings,
): number {
  return getSynapserLayerGlitchDisplay(glitchRef, settings, "screen");
}

export function getSynapserObjectGlitchBaseline(settings: SynapserScrollGlitchSettings): number {
  const layer = settings.object;
  if (!layer.enabled) return 0;
  const idleMid = (layer.idleMin + layer.idleMax) / 2;
  return settings.masterIntensity * layer.intensity * idleMid;
}

/** Full-screen rectangular particle noise strength (burst + ambient + object idle). */
export function getSynapserParticleNoiseDisplay(
  glitchRef: { current: number },
  settings: SynapserScrollGlitchSettings,
): number {
  const layer = settings.screen;
  if (!layer.enabled) return 0;

  const burst = settings.enabled ? getSynapserGlitchDisplay(glitchRef, settings) : 0;
  const ambient = layer.intensity * layer.particleDensity * 0.22;
  const objectDust = getSynapserObjectGlitchBaseline(settings) * layer.particleDensity * 0.5;
  const strength = Math.max(burst, ambient, objectDust);

  return Math.min(1, strength * layer.particleDensity * (0.4 + layer.gritOpacity * 0.85));
}
