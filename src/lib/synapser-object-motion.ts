/** Full vertical bob cycles per second when floatSpeed = 1. */
export const SYNAPSER_FLOAT_MAX_HZ = 0.32;
/** Max vertical bob amplitude (world units) when floatIntensity = 1. */
export const SYNAPSER_FLOAT_MAX_AMP = 0.42;
/** Max wobble angle (radians) when rotationIntensity = 1. */
export const SYNAPSER_FLOAT_MAX_WOBBLE = 0.2;
/** Radians per second when autoRotate = 1 (one revolution per second). */
export const SYNAPSER_AUTO_ROTATE_MAX_RAD_PER_SEC = Math.PI * 2;

export function clampMotion01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Rescale legacy motion values (pre-0–1) into 0–1 range. */
export function migrateObjectMotionValue(key: string, value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value >= 0 && value <= 1) return value;
  if (key === "floatSpeed") return clampMotion01(value / 5);
  if (key === "rotationIntensity" || key === "floatIntensity") return clampMotion01(value / 2);
  if (key.startsWith("autoRotate")) return clampMotion01(Math.abs(value) / 0.05);
  return clampMotion01(value);
}
