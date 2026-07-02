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
  trackScale: 1,
};

export const SYNAPSER_SCROLL_TRACK_SCALE_MIN = 0.25;
export const SYNAPSER_SCROLL_TRACK_SCALE_MAX = 10;

export function normalizeSynapserScrollExperience(
  partial?: Partial<SynapserScrollExperience> | null,
): SynapserScrollExperience {
  const raw = partial?.trackScale ?? DEFAULT_SYNAPSER_SCROLL_EXPERIENCE.trackScale;
  return {
    trackScale: Math.max(
      SYNAPSER_SCROLL_TRACK_SCALE_MIN,
      Math.min(SYNAPSER_SCROLL_TRACK_SCALE_MAX, Number.isFinite(raw) ? raw : 1),
    ),
  };
}

export function getSynapserScrollHeightVh(experience: SynapserScrollExperience): number {
  const { trackScale } = normalizeSynapserScrollExperience(experience);
  return Math.round(SYNAPSER_BASE_SCROLL_VH * trackScale);
}
