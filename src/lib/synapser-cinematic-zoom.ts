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

/** Scroll down: 0→20% zoom-in, 80→100% zoom-out. */
function stepCinematicZoomForward(
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
      if (raw <= inCfg.start + HOLD_GAP && runtime.animElapsedMs <= 0) {
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
      const scrollBound = holdDisplayProgress(raw, inEnd, outStart);
      runtime.displayLocalP = Math.max(runtime.displayLocalP, scrollBound);

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

/** Scroll up: 100→80% reverse zoom-out, 20→0% reverse zoom-in. */
function stepCinematicZoomReverse(
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
    raw >= outCfg.end - HOLD_GAP &&
    (runtime.phase === "hold" || runtime.phase === "zooming-in" || runtime.phase === "before-in")
  ) {
    runtime.phase = "after-out";
    runtime.zoomT = 0;
    runtime.displayLocalP = outCfg.end;
    runtime.animElapsedMs = 0;
    runtime.zoomOutStartLocalP = outStart;
  }

  switch (runtime.phase) {
    case "after-out": {
      runtime.zoomT = 0;
      runtime.displayLocalP = outCfg.end;
      if (raw < outCfg.end - HOLD_GAP) {
        runtime.phase = "zooming-out";
        runtime.animElapsedMs = 0;
        runtime.zoomOutStartLocalP = outCfg.end;
      }
      break;
    }
    case "zooming-out": {
      if (raw >= outCfg.end - HOLD_GAP && runtime.animElapsedMs <= 0) {
        runtime.phase = "after-out";
        runtime.zoomT = 0;
        runtime.displayLocalP = outCfg.end;
        break;
      }

      if (raw < outStart + HOLD_GAP) {
        runtime.phase = "hold";
        runtime.zoomT = 1;
        runtime.displayLocalP = holdDisplayProgress(raw, inEnd, outStart);
        break;
      }

      runtime.animElapsedMs += deltaMs;
      const progress = clamp01(runtime.animElapsedMs / outCfg.durationMs);
      const eased = applyCinematicEasing(progress, outCfg.easing);
      runtime.zoomT = eased;
      runtime.displayLocalP = lerp(outCfg.end, outStart, eased);

      if (progress >= 1) {
        runtime.phase = "hold";
        runtime.zoomT = 1;
        runtime.displayLocalP = holdDisplayProgress(raw, inEnd, outStart);
      }
      break;
    }
    case "hold": {
      runtime.zoomT = 1;
      const scrollBound = holdDisplayProgress(raw, inEnd, outStart);
      runtime.displayLocalP = Math.min(runtime.displayLocalP, scrollBound);

      if (raw <= inEnd + HOLD_GAP) {
        runtime.phase = "zooming-in";
        runtime.animElapsedMs = 0;
      }
      break;
    }
    case "zooming-in": {
      if (raw > inEnd + HOLD_GAP) {
        runtime.phase = "hold";
        runtime.zoomT = 1;
        runtime.displayLocalP = holdDisplayProgress(raw, inEnd, outStart);
        runtime.animElapsedMs = 0;
        break;
      }

      runtime.animElapsedMs += deltaMs;
      const progress = clamp01(runtime.animElapsedMs / inCfg.durationMs);
      const eased = applyCinematicEasing(progress, inCfg.easing);
      runtime.zoomT = 1 - eased;
      runtime.displayLocalP = lerp(inEnd, inCfg.start, eased);

      if (progress >= 1) {
        runtime.phase = "before-in";
        runtime.zoomT = 0;
        runtime.displayLocalP = inCfg.start;
      }
      break;
    }
    case "before-in": {
      runtime.zoomT = 0;
      runtime.displayLocalP = clamp01(Math.max(raw, inCfg.start));
      break;
    }
  }
}

export function stepCinematicZoom(
  runtime: CinematicZoomRuntime,
  rawLocalP: number,
  config: SynapserCinematicScrollSettings,
  deltaMs: number,
  direction: 1 | -1 = 1,
): void {
  if (direction < 0) {
    stepCinematicZoomReverse(runtime, rawLocalP, config, deltaMs);
  } else {
    stepCinematicZoomForward(runtime, rawLocalP, config, deltaMs);
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

export function syncCinematicChainHead(
  chainHead: { index: number },
  rawGlobalP: number,
  prevRawGlobalP: number,
  scrollDirection: 1 | -1,
  sceneCount: number,
  getActiveSceneIndex: (globalP: number, sceneCount: number) => number,
): void {
  const scrollHead = getActiveSceneIndex(rawGlobalP, sceneCount);

  if (scrollDirection < 0 && scrollHead < chainHead.index) {
    chainHead.index = scrollHead;
    return;
  }

  if (scrollDirection > 0) return;

  const scrollBackEpsilon = 1 / 2000;
  if (rawGlobalP < prevRawGlobalP - scrollBackEpsilon && scrollHead < chainHead.index) {
    chainHead.index = scrollHead;
  }
}

function kickNextSceneZoomIn(
  runtimes: Record<string, CinematicZoomRuntime>,
  nextSceneId: string,
  nextConfig: SynapserCinematicScrollSettings,
): void {
  const nextRuntime = getCinematicZoomRuntime(runtimes, nextSceneId);
  nextRuntime.phase = "zooming-in";
  nextRuntime.animElapsedMs = 0;
  nextRuntime.zoomT = 0;
  nextRuntime.displayLocalP = nextConfig.autoZoomIn.start;
}

function kickPrevSceneAfterOut(
  runtimes: Record<string, CinematicZoomRuntime>,
  prevSceneId: string,
  prevConfig: SynapserCinematicScrollSettings,
): void {
  const prevRuntime = getCinematicZoomRuntime(runtimes, prevSceneId);
  prevRuntime.phase = "after-out";
  prevRuntime.animElapsedMs = 0;
  prevRuntime.zoomT = 0;
  prevRuntime.displayLocalP = prevConfig.autoZoomOut.end;
  prevRuntime.zoomOutStartLocalP = prevConfig.autoZoomOut.start;
}

function cinematicStepRawForward(
  runtime: CinematicZoomRuntime,
  rawLocalP: number,
  config: SynapserCinematicScrollSettings,
): number {
  const inStart = config.autoZoomIn.start;
  const inEnd = config.autoZoomIn.end;
  const autoDriven =
    runtime.phase === "zooming-in" ||
    runtime.phase === "hold" ||
    runtime.phase === "zooming-out" ||
    runtime.phase === "after-out";
  if (autoDriven && rawLocalP < inEnd - HOLD_GAP) {
    return Math.max(runtime.displayLocalP, inStart + HOLD_GAP * 2);
  }
  return rawLocalP;
}

function cinematicStepRawReverse(
  runtime: CinematicZoomRuntime,
  rawLocalP: number,
  config: SynapserCinematicScrollSettings,
): number {
  const outStart = config.autoZoomOut.start;
  const outEnd = config.autoZoomOut.end;
  const autoDriven =
    runtime.phase === "zooming-out" ||
    runtime.phase === "hold" ||
    runtime.phase === "zooming-in" ||
    runtime.phase === "before-in";
  if (autoDriven && rawLocalP > outStart + HOLD_GAP) {
    return Math.min(runtime.displayLocalP, outEnd - HOLD_GAP * 2);
  }
  return rawLocalP;
}

export function tickCinematicZoomSystem({
  rawGlobalP,
  sceneOrder,
  sceneCount,
  sceneSettings,
  runtimes,
  chainHead,
  scrollState,
  deltaMs,
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
  deltaMs: number;
  getActiveSceneIndex: (globalP: number, sceneCount: number) => number;
  getSceneLocalProgress: (globalP: number, sceneIndex: number, sceneCount: number) => number;
}): number {
  if (sceneCount <= 0) return rawGlobalP;

  const scrollDirection = resolveScrollDirection(
    rawGlobalP,
    scrollState.prevRawGlobalP,
    scrollState.scrollDirection,
  );
  scrollState.scrollDirection = scrollDirection;

  syncCinematicChainHead(
    chainHead,
    rawGlobalP,
    scrollState.prevRawGlobalP,
    scrollDirection,
    sceneCount,
    getActiveSceneIndex,
  );
  scrollState.prevRawGlobalP = rawGlobalP;
  chainHead.index = Math.max(0, Math.min(sceneCount - 1, chainHead.index));

  for (let i = 0; i < sceneOrder.length; i++) {
    const id = sceneOrder[i];
    const config = sceneSettings[id]?.cinematicScroll;
    if (!config?.enabled) continue;
    const runtime = getCinematicZoomRuntime(runtimes, id);

    if (scrollDirection > 0) {
      if (i < chainHead.index) {
        runtime.phase = "after-out";
        runtime.zoomT = 0;
        runtime.displayLocalP = config.autoZoomOut.end;
      } else if (i > chainHead.index) {
        resetCinematicZoomRuntime(runtimes, id);
      }
    } else if (i > chainHead.index) {
      resetCinematicZoomRuntime(runtimes, id);
    } else if (i < chainHead.index) {
      runtime.phase = "before-in";
      runtime.zoomT = 0;
      runtime.displayLocalP = config.autoZoomIn.start;
      runtime.animElapsedMs = 0;
    }
  }

  const maxPasses = sceneCount * 2;
  for (let pass = 0; pass < maxPasses; pass++) {
    const headIndex = chainHead.index;
    const headId = sceneOrder[headIndex];
    if (!headId) break;
    const headConfig = sceneSettings[headId]?.cinematicScroll;
    if (!headConfig?.enabled) {
      if (scrollDirection > 0 && headIndex < sceneCount - 1) {
        chainHead.index = headIndex + 1;
        continue;
      }
      if (scrollDirection < 0 && headIndex > 0) {
        chainHead.index = headIndex - 1;
        continue;
      }
      return rawGlobalP;
    }

    const headRuntime = getCinematicZoomRuntime(runtimes, headId);
    const rawLocalP = getSceneLocalProgress(rawGlobalP, headIndex, sceneCount);

    if (
      scrollDirection < 0 &&
      rawLocalP >= headConfig.autoZoomOut.start - HOLD_GAP &&
      (headRuntime.phase === "before-in" || headRuntime.phase === "zooming-in")
    ) {
      headRuntime.phase = "after-out";
      headRuntime.zoomT = 0;
      headRuntime.displayLocalP = headConfig.autoZoomOut.end;
      headRuntime.animElapsedMs = 0;
      headRuntime.zoomOutStartLocalP = headConfig.autoZoomOut.start;
    }

    if (scrollDirection > 0 && headIndex > 0) {
      const prevId = sceneOrder[headIndex - 1];
      const prevRuntime = runtimes[prevId];
      const prevConfig = sceneSettings[prevId]?.cinematicScroll;
      if (
        prevConfig?.enabled &&
        prevRuntime?.phase === "after-out" &&
        headRuntime.phase === "before-in"
      ) {
        kickNextSceneZoomIn(runtimes, headId, headConfig);
      }
    }

    if (scrollDirection < 0 && headIndex > 0) {
      const prevId = sceneOrder[headIndex - 1];
      const prevRuntime = runtimes[prevId];
      const prevConfig = sceneSettings[prevId]?.cinematicScroll;
      if (
        prevConfig?.enabled &&
        headRuntime.phase === "before-in" &&
        prevRuntime?.phase === "before-in"
      ) {
        kickPrevSceneAfterOut(runtimes, prevId, prevConfig);
        chainHead.index = headIndex - 1;
        continue;
      }
    }

    const stepRaw =
      scrollDirection < 0
        ? cinematicStepRawReverse(headRuntime, rawLocalP, headConfig)
        : cinematicStepRawForward(headRuntime, rawLocalP, headConfig);

    stepCinematicZoom(headRuntime, stepRaw, headConfig, deltaMs, scrollDirection);

    if (
      scrollDirection > 0 &&
      headRuntime.phase === "after-out" &&
      headIndex < sceneCount - 1
    ) {
      const nextId = sceneOrder[headIndex + 1];
      const nextConfig = sceneSettings[nextId]?.cinematicScroll;
      const nextRuntime = runtimes[nextId];
      if (nextConfig?.enabled && nextRuntime?.phase === "before-in") {
        kickNextSceneZoomIn(runtimes, nextId, nextConfig);
        chainHead.index = headIndex + 1;
        continue;
      }
    }

    break;
  }

  const finalHeadId = sceneOrder[chainHead.index];
  const finalRuntime = finalHeadId ? runtimes[finalHeadId] : undefined;
  const finalConfig = finalHeadId ? sceneSettings[finalHeadId]?.cinematicScroll : undefined;
  if (!finalRuntime || !finalConfig?.enabled) return rawGlobalP;

  return effectiveGlobalFromDisplayLocal(chainHead.index, finalRuntime.displayLocalP, sceneCount);
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
