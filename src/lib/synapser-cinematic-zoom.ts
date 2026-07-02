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

const HOLD_GAP = 0.01;

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

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function applyCinematicEasing(t: number, easing: CinematicEasing): number {
  const x = clamp01(t);
  if (easing === "ease-in") return x * x;
  if (easing === "ease-out") return 1 - (1 - x) * (1 - x);
  return x;
}

function holdDisplayProgress(raw: number, inEnd: number, outStart: number): number {
  return clamp01(Math.max(inEnd, Math.min(raw, outStart)));
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

export function stepCinematicZoom(
  runtime: CinematicZoomRuntime,
  rawLocalP: number,
  config: SynapserCinematicScrollSettings,
  deltaMs: number,
): void {
  const raw = clamp01(rawLocalP);
  const inCfg = config.autoZoomIn;
  const outCfg = config.autoZoomOut;
  const inEnd = inCfg.end;
  const outStart = outCfg.start;

  if (
    raw <= inCfg.start + HOLD_GAP &&
    (runtime.phase === "hold" || runtime.phase === "zooming-out" || runtime.phase === "after-out")
  ) {
    Object.assign(runtime, createCinematicZoomRuntime());
  }

  switch (runtime.phase) {
    case "before-in": {
      runtime.zoomT = 0;
      runtime.displayLocalP = clamp01(Math.min(raw, inCfg.start));
      if (raw > inCfg.start + HOLD_GAP) {
        runtime.phase = "zooming-in";
        runtime.animElapsedMs = 0;
      }
      break;
    }
    case "zooming-in": {
      if (raw <= inCfg.start + HOLD_GAP) {
        Object.assign(runtime, createCinematicZoomRuntime());
        break;
      }

      if (raw > inEnd + HOLD_GAP) {
        runtime.phase = "hold";
        runtime.zoomT = 1;
        runtime.displayLocalP = holdDisplayProgress(raw, inEnd, outStart);
        break;
      }

      runtime.animElapsedMs += deltaMs;
      const progress = clamp01(runtime.animElapsedMs / inCfg.durationMs);
      const eased = applyCinematicEasing(progress, inCfg.easing);
      runtime.zoomT = eased;
      runtime.displayLocalP = lerp(inCfg.start, inEnd, eased);

      if (progress >= 1) {
        runtime.phase = "hold";
        runtime.zoomT = 1;
        runtime.displayLocalP = holdDisplayProgress(raw, inEnd, outStart);
      }
      break;
    }
    case "hold": {
      runtime.zoomT = 1;
      runtime.displayLocalP = holdDisplayProgress(raw, inEnd, outStart);

      if (raw <= inCfg.start + HOLD_GAP) {
        Object.assign(runtime, createCinematicZoomRuntime());
        break;
      }

      if (raw >= outStart - HOLD_GAP) {
        runtime.phase = "zooming-out";
        runtime.animElapsedMs = 0;
        runtime.zoomOutStartLocalP = runtime.displayLocalP;
      }
      break;
    }
    case "zooming-out": {
      if (raw < outStart - HOLD_GAP) {
        runtime.phase = "hold";
        runtime.zoomT = 1;
        runtime.displayLocalP = holdDisplayProgress(raw, inEnd, outStart);
        runtime.animElapsedMs = 0;
        break;
      }

      runtime.animElapsedMs += deltaMs;
      const progress = clamp01(runtime.animElapsedMs / outCfg.durationMs);
      const eased = applyCinematicEasing(progress, outCfg.easing);
      runtime.zoomT = 1 - eased;
      runtime.displayLocalP = lerp(runtime.zoomOutStartLocalP, outCfg.end, eased);

      if (progress >= 1) {
        runtime.phase = "after-out";
        runtime.zoomT = 0;
        runtime.displayLocalP = outCfg.end;
      }
      break;
    }
    case "after-out": {
      runtime.zoomT = 0;
      runtime.displayLocalP = outCfg.end;
      break;
    }
  }
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
