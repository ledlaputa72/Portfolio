export type CinematicEasing = "linear" | "ease-in" | "ease-out";

export type CinematicScrollTransition = {
  /** Scene-local progress where auto transition starts (0–1). */
  start: number;
  /** Scene-local progress where auto transition ends (0–1). */
  end: number;
  durationMs: number;
  easing: CinematicEasing;
};

export type SynapserCinematicScrollSettings = {
  enabled: boolean;
  distanceFar: number;
  distanceNear: number;
  zoomInEnd: number;
  holdEnd: number;
  autoZoomIn: CinematicScrollTransition;
  autoZoomOut: CinematicScrollTransition;
  /** Scroll-driven Y rotation between zoom-in end and zoom-out start. */
  scrollRotation: CinematicScrollRotation;
};

export type CinematicScrollRotation = {
  /** Full revolutions across the hold zone (zoom-in end → zoom-out start). */
  revolutions: number;
  easing: CinematicEasing;
};

export type CinematicZoomPhase =
  | "before-in"
  | "zooming-in"
  | "hold"
  | "zooming-out"
  | "after-out";

export type CinematicZoomRuntime = {
  phase: CinematicZoomPhase;
  zoomT: number;
  displayLocalP: number;
  animElapsedMs: number;
  zoomOutStartLocalP: number;
};

export type CinematicScrollState = {
  prevRawGlobalP: number;
  scrollDirection: 1 | -1;
};

const HOLD_GAP = 0.01;
const SCROLL_DIR_EPSILON = 1 / 4000;

export const DEFAULT_CINEMATIC_ZOOM_IN: CinematicScrollTransition = {
  start: 0,
  end: 0.2,
  durationMs: 100,
  easing: "ease-out",
};

export const DEFAULT_CINEMATIC_ZOOM_OUT: CinematicScrollTransition = {
  start: 0.8,
  end: 1,
  durationMs: 100,
  easing: "ease-in",
};

export const DEFAULT_CINEMATIC_SCROLL_ROTATION: CinematicScrollRotation = {
  revolutions: 1,
  easing: "linear",
};

export function createCinematicZoomRuntime(): CinematicZoomRuntime {
  return {
    phase: "before-in",
    zoomT: 0,
    displayLocalP: 0,
    animElapsedMs: 0,
    zoomOutStartLocalP: 0.8,
  };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function applyCinematicEasing(t: number, easing: CinematicEasing): number {
  const x = clamp01(t);
  if (easing === "ease-in") return x * x;
  if (easing === "ease-out") return 1 - (1 - x) * (1 - x);
  return x;
}

export function resolveScrollDirection(
  rawGlobalP: number,
  prevRawGlobalP: number,
  prevDirection: 1 | -1,
): 1 | -1 {
  if (rawGlobalP > prevRawGlobalP + SCROLL_DIR_EPSILON) return 1;
  if (rawGlobalP < prevRawGlobalP - SCROLL_DIR_EPSILON) return -1;
  return prevDirection;
}

export function normalizeCinematicScrollRotation(
  partial?: Partial<CinematicScrollRotation> | null,
): CinematicScrollRotation {
  const revolutions = partial?.revolutions ?? DEFAULT_CINEMATIC_SCROLL_ROTATION.revolutions;
  return {
    revolutions: Math.max(0, Math.min(8, Number.isFinite(revolutions) ? revolutions : 0)),
    easing:
      partial?.easing === "linear" || partial?.easing === "ease-in" || partial?.easing === "ease-out"
        ? partial.easing
        : DEFAULT_CINEMATIC_SCROLL_ROTATION.easing,
  };
}

export function getCinematicScrollRotation(
  rawLocalP: number,
  config: SynapserCinematicScrollSettings,
): number {
  if (!config.enabled || config.scrollRotation.revolutions <= 0) return 0;
  const inEnd = config.autoZoomIn.end;
  const outStart = config.autoZoomOut.start;
  const raw = clamp01(rawLocalP);
  if (raw <= inEnd || raw >= outStart || outStart <= inEnd + HOLD_GAP) return 0;
  const t = (raw - inEnd) / (outStart - inEnd);
  const eased = applyCinematicEasing(t, config.scrollRotation.easing);
  return eased * config.scrollRotation.revolutions * Math.PI * 2;
}

export function normalizeCinematicScrollTransition(
  partial: Partial<CinematicScrollTransition> | undefined,
  defaults: CinematicScrollTransition,
): CinematicScrollTransition {
  return {
    start: clamp01(partial?.start ?? defaults.start),
    end: clamp01(partial?.end ?? defaults.end),
    durationMs: Math.max(16, Math.min(5000, partial?.durationMs ?? defaults.durationMs)),
    easing:
      partial?.easing === "linear" || partial?.easing === "ease-in" || partial?.easing === "ease-out"
        ? partial.easing
        : defaults.easing,
  };
}

export function normalizeCinematicScroll(
  partial?: Partial<SynapserCinematicScrollSettings> | null,
): SynapserCinematicScrollSettings {
  const autoZoomIn = normalizeCinematicScrollTransition(partial?.autoZoomIn, DEFAULT_CINEMATIC_ZOOM_IN);
  const autoZoomOut = normalizeCinematicScrollTransition(partial?.autoZoomOut, DEFAULT_CINEMATIC_ZOOM_OUT);

  if (partial?.zoomInEnd != null && partial.autoZoomIn?.end == null) {
    autoZoomIn.end = clamp01(partial.zoomInEnd);
  }
  if (partial?.holdEnd != null && partial.autoZoomOut?.start == null) {
    autoZoomOut.start = clamp01(partial.holdEnd);
  }

  if (autoZoomIn.end < autoZoomIn.start) autoZoomIn.end = autoZoomIn.start;
  if (autoZoomOut.end < autoZoomOut.start) autoZoomOut.end = autoZoomOut.start;
  if (autoZoomOut.start <= autoZoomIn.end) {
    autoZoomOut.start = Math.min(1, autoZoomIn.end + HOLD_GAP);
  }

  const scrollRotation = normalizeCinematicScrollRotation(partial?.scrollRotation);

  return {
    enabled: partial?.enabled ?? true,
    distanceFar: partial?.distanceFar ?? 10,
    distanceNear: partial?.distanceNear ?? 4,
    zoomInEnd: autoZoomIn.end,
    holdEnd: autoZoomOut.start,
    autoZoomIn,
    autoZoomOut,
    scrollRotation,
  };
}

/** Map scene-local scroll progress (0–1) directly to camera zoomT. */
export function scrollDrivenCinematicZoomT(
  localP: number,
  config: SynapserCinematicScrollSettings,
): number {
  const t = clamp01(localP);
  const inStart = config.autoZoomIn.start;
  const inEnd = config.autoZoomIn.end;
  const outStart = config.autoZoomOut.start;
  const outEnd = config.autoZoomOut.end;

  if (t <= inStart + HOLD_GAP) return 0;

  if (t < inEnd - HOLD_GAP) {
    const span = Math.max(HOLD_GAP, inEnd - inStart);
    const seg = clamp01((t - inStart) / span);
    return applyCinematicEasing(seg, config.autoZoomIn.easing);
  }

  if (t < outStart + HOLD_GAP) return 1;

  if (t < outEnd - HOLD_GAP) {
    const span = Math.max(HOLD_GAP, outEnd - outStart);
    const seg = clamp01((t - outStart) / span);
    return 1 - applyCinematicEasing(seg, config.autoZoomOut.easing);
  }

  return 0;
}

export function cinematicPhaseFromScroll(
  localP: number,
  config: SynapserCinematicScrollSettings,
): CinematicZoomPhase {
  const t = clamp01(localP);
  if (t <= config.autoZoomIn.start + HOLD_GAP) return "before-in";
  if (t < config.autoZoomIn.end - HOLD_GAP) return "zooming-in";
  if (t < config.autoZoomOut.start + HOLD_GAP) return "hold";
  if (t < config.autoZoomOut.end - HOLD_GAP) return "zooming-out";
  return "after-out";
}

function applyScrollDrivenCinematicRuntime(
  runtime: CinematicZoomRuntime,
  localP: number,
  config: SynapserCinematicScrollSettings,
): void {
  const clamped = clamp01(localP);
  runtime.displayLocalP = clamped;
  runtime.zoomT = scrollDrivenCinematicZoomT(clamped, config);
  runtime.phase = cinematicPhaseFromScroll(clamped, config);
  runtime.animElapsedMs = 0;
}

/** @deprecated time-based; scroll position drives zoom via tickCinematicZoomSystem */
export function stepCinematicZoom(
  runtime: CinematicZoomRuntime,
  rawLocalP: number,
  config: SynapserCinematicScrollSettings,
  _deltaMs: number,
  _direction: 1 | -1 = 1,
): void {
  applyScrollDrivenCinematicRuntime(runtime, rawLocalP, config);
}

export function effectiveGlobalFromDisplayLocal(
  sceneIndex: number,
  displayLocalP: number,
  sceneCount: number,
): number {
  if (sceneCount <= 0) return 0;
  const segment = 1 / sceneCount;
  return sceneIndex * segment + clamp01(displayLocalP) * segment;
}

export function syncCinematicChainHead(
  chainHead: { index: number },
  rawGlobalP: number,
  _prevRawGlobalP: number,
  _scrollDirection: 1 | -1,
  sceneCount: number,
  getActiveSceneIndex: (globalP: number, sceneCount: number) => number,
): void {
  chainHead.index = getActiveSceneIndex(rawGlobalP, sceneCount);
}

export function tickCinematicZoomSystem({
  rawGlobalP,
  sceneOrder,
  sceneCount,
  sceneSettings,
  runtimes,
  chainHead,
  scrollState,
  getActiveSceneIndex,
  getSceneLocalProgress,
}: {
  rawGlobalP: number;
  sceneOrder: string[];
  sceneCount: number;
  sceneSettings: Record<string, { cinematicScroll?: SynapserCinematicScrollSettings }>;
  runtimes: Record<string, CinematicZoomRuntime>;
  chainHead: { index: number };
  scrollState: CinematicScrollState;
  deltaMs?: number;
  getActiveSceneIndex: (globalP: number, sceneCount: number) => number;
  getSceneLocalProgress: (globalP: number, sceneIndex: number, sceneCount: number) => number;
}): number {
  if (sceneCount <= 0) return rawGlobalP;

  scrollState.scrollDirection = resolveScrollDirection(
    rawGlobalP,
    scrollState.prevRawGlobalP,
    scrollState.scrollDirection,
  );
  scrollState.prevRawGlobalP = rawGlobalP;

  syncCinematicChainHead(
    chainHead,
    rawGlobalP,
    scrollState.prevRawGlobalP,
    scrollState.scrollDirection,
    sceneCount,
    getActiveSceneIndex,
  );
  chainHead.index = Math.max(0, Math.min(sceneCount - 1, chainHead.index));

  const activeIndex = chainHead.index;

  for (let i = 0; i < sceneOrder.length; i++) {
    const id = sceneOrder[i];
    const config = sceneSettings[id]?.cinematicScroll;
    if (!config?.enabled) continue;

    const localP = getSceneLocalProgress(rawGlobalP, i, sceneCount);
    const runtime = getCinematicZoomRuntime(runtimes, id);

    if (localP < -0.02) {
      if (i < activeIndex) {
        runtime.phase = "after-out";
        runtime.zoomT = 0;
        runtime.displayLocalP = config.autoZoomOut.end;
      } else {
        resetCinematicZoomRuntime(runtimes, id);
      }
      continue;
    }

    if (localP > 1.02) {
      if (i > activeIndex) {
        resetCinematicZoomRuntime(runtimes, id);
      } else {
        runtime.phase = "before-in";
        runtime.zoomT = 0;
        runtime.displayLocalP = config.autoZoomIn.start;
      }
      continue;
    }

    applyScrollDrivenCinematicRuntime(runtime, localP, config);
  }

  return rawGlobalP;
}

export function resolveEffectiveGlobalProgress(
  rawGlobalP: number,
  sceneOrder: string[],
  sceneCount: number,
  sceneSettings: Record<string, { cinematicScroll?: SynapserCinematicScrollSettings }>,
  runtimes: Record<string, CinematicZoomRuntime>,
  getActiveSceneIndex: (globalP: number, sceneCount: number) => number,
): number {
  if (sceneCount <= 0) return rawGlobalP;
  const idx = getActiveSceneIndex(rawGlobalP, sceneCount);
  const id = sceneOrder[idx];
  if (!id) return rawGlobalP;

  const config = sceneSettings[id]?.cinematicScroll;
  const runtime = runtimes[id];
  if (!config?.enabled || !runtime) return rawGlobalP;

  return effectiveGlobalFromDisplayLocal(idx, runtime.displayLocalP, sceneCount);
}

export function getSceneDisplayLocalProgress(
  sceneIndex: number,
  sceneCount: number,
  sceneId: string,
  runtimes: Record<string, CinematicZoomRuntime>,
  fallbackLocalP: number,
): number {
  const runtime = runtimes[sceneId];
  if (!runtime) return fallbackLocalP;
  return runtime.displayLocalP;
}

export function getCinematicZoomRuntime(
  runtimes: Record<string, CinematicZoomRuntime>,
  sceneId: string,
): CinematicZoomRuntime {
  if (!runtimes[sceneId]) runtimes[sceneId] = createCinematicZoomRuntime();
  return runtimes[sceneId];
}

export function resetCinematicZoomRuntime(
  runtimes: Record<string, CinematicZoomRuntime>,
  sceneId: string,
): void {
  runtimes[sceneId] = createCinematicZoomRuntime();
}
