import type { SynapserSceneId } from "@/lib/synapser-scene-settings";

export type SynapserObjectHoverState = {
  /** Smoothed 0–1 hover amount for camera zoom and glitch. */
  blend: number;
  /** Scene whose object is currently hovered, if any. */
  sceneId: SynapserSceneId | null;
};