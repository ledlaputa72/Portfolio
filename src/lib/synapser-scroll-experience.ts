/** Base sticky scroll track before pace multiplier (vh). */
export const SYNAPSER_BASE_SCROLL_VH = 400;

export type SynapserScrollExperience = {
  /**
   * Scroll track length multiplier.
   * 1 = default; higher = more scroll needed per % (slower progress); lower = faster % change.
   */
  trackScale: number;
};

export const DEFAULT_SYNAPSER_SCROLL_EXPERIENCE: SynapserScrollExperience = {
  trackScale: 10,
};

export const SYNAPSER_SCROLL_TRACK_SCALE_MIN = 0.25;
export const SYNAPSER_SCROLL_TRACK_SCALE_MAX = 10;
/** Previous UI cap before track scale could exceed 4×. */
const LEGACY_SCROLL_TRACK_SCALE_CAP = 4;

export function normalizeSynapserScrollExperience(
  partial?: Partial<SynapserScrollExperience> | null,
): SynapserScrollExperience {
  let raw = partial?.trackScale ?? DEFAULT_SYNAPSER_SCROLL_EXPERIENCE.trackScale;
  // Migrate saves that were clamped at the old 400% maximum.
  if (Number.isFinite(raw) && Math.abs(raw - LEGACY_SCROLL_TRACK_SCALE_CAP) < 0.05) {
    raw = SYNAPSER_SCROLL_TRACK_SCALE_MAX;
  }
  return {
    trackScale: Math.max(
      SYNAPSER_SCROLL_TRACK_SCALE_MIN,
      Math.min(SYNAPSER_SCROLL_TRACK_SCALE_MAX, Number.isFinite(raw) ? raw : 10),
    ),
  };
}

export function getSynapserScrollHeightVh(experience: SynapserScrollExperience): number {
  const { trackScale } = normalizeSynapserScrollExperience(experience);
  return Math.round(SYNAPSER_BASE_SCROLL_VH * trackScale);
}
