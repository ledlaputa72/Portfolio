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

export function normalizeSynapserScrollExperience(
  partial?: Partial<SynapserScrollExperience> | null,
): SynapserScrollExperience {
  const raw = partial?.trackScale ?? DEFAULT_SYNAPSER_SCROLL_EXPERIENCE.trackScale;
  return {
    trackScale: Math.max(0.25, Math.min(4, Number.isFinite(raw) ? raw : 1)),
  };
}

export function getSynapserScrollHeightVh(experience: SynapserScrollExperience): number {
  const { trackScale } = normalizeSynapserScrollExperience(experience);
  return Math.round(SYNAPSER_BASE_SCROLL_VH * trackScale);
}
