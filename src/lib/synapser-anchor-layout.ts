import type { Vec3 } from "./synapser-scene-settings";

export type SynapserAnchorAlignX = "left" | "center" | "right";
export type SynapserAnchorAlignY = "top" | "middle" | "bottom";

export type SynapserAnchorSettings = {
  alignX: SynapserAnchorAlignX;
  alignY: SynapserAnchorAlignY;
};

export const DEFAULT_OBJECT_ANCHOR: SynapserAnchorSettings = {
  alignX: "center",
  alignY: "middle",
};

export const DEFAULT_TYPOGRAPHY_ANCHOR: SynapserAnchorSettings = {
  alignX: "left",
  alignY: "bottom",
};

/** Fraction of half-viewport used to place object anchor from screen center. */
export const OBJECT_ANCHOR_EDGE_MARGIN = 0.38;

/** Inset from viewport edge for DOM typography anchor (0–1). */
export const TYPOGRAPHY_ANCHOR_INSET = 0.12;

export const ANCHOR_GRID_ROWS: SynapserAnchorAlignY[] = ["top", "middle", "bottom"];
export const ANCHOR_GRID_COLS: SynapserAnchorAlignX[] = ["left", "center", "right"];

export function normalizeSynapserAnchor(
  anchor?: Partial<SynapserAnchorSettings> | null,
  fallback: SynapserAnchorSettings = DEFAULT_OBJECT_ANCHOR,
): SynapserAnchorSettings {
  const alignX =
    anchor?.alignX === "left" || anchor?.alignX === "center" || anchor?.alignX === "right"
      ? anchor.alignX
      : fallback.alignX;
  const alignY =
    anchor?.alignY === "top" || anchor?.alignY === "middle" || anchor?.alignY === "bottom"
      ? anchor.alignY
      : fallback.alignY;
  return { alignX, alignY };
}

export function anchorGridLabel(
  anchor: SynapserAnchorSettings,
  locale: "en" | "ko" = "en",
): string {
  const x =
    anchor.alignX === "left"
      ? locale === "ko"
        ? "좌"
        : "L"
      : anchor.alignX === "right"
        ? locale === "ko"
          ? "우"
          : "R"
        : locale === "ko"
          ? "중"
          : "C";
  const y =
    anchor.alignY === "top"
      ? locale === "ko"
        ? "상"
        : "T"
      : anchor.alignY === "bottom"
        ? locale === "ko"
          ? "하"
          : "B"
        : locale === "ko"
          ? "중"
          : "M";
  return `${y}${x}`;
}

/** World-space offset so the object center sits on the chosen screen anchor. */
export function getObjectAnchorWorldOffset(
  anchor: SynapserAnchorSettings,
  cameraDistance: number,
  fovDeg: number,
  aspect: number,
): Vec3 {
  const vFovRad = (fovDeg * Math.PI) / 180;
  const halfH = Math.tan(vFovRad / 2) * Math.max(cameraDistance, 0.1);
  const halfW = halfH * aspect;

  const fx = anchor.alignX === "left" ? -1 : anchor.alignX === "right" ? 1 : 0;
  const fy = anchor.alignY === "top" ? 1 : anchor.alignY === "bottom" ? -1 : 0;

  return [
    fx * halfW * OBJECT_ANCHOR_EDGE_MARGIN,
    fy * halfH * OBJECT_ANCHOR_EDGE_MARGIN,
    0,
  ];
}

export function getSynapserTypographyAnchorStyle(
  anchor: SynapserAnchorSettings,
): { left: string; top: string; right: string; bottom: string; transform: string } {
  const inset = TYPOGRAPHY_ANCHOR_INSET * 100;
  const left =
    anchor.alignX === "left" ? `${inset}%` : anchor.alignX === "right" ? `${100 - inset}%` : "50%";
  const top =
    anchor.alignY === "top" ? `${inset}%` : anchor.alignY === "bottom" ? `${100 - inset}%` : "50%";

  return {
    left,
    top,
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
  };
}

export function getSynapserTypographyTextAlign(anchor: SynapserAnchorSettings): string {
  if (anchor.alignX === "center") return "text-center items-center";
  if (anchor.alignX === "right") return "text-right items-end";
  return "text-left items-start";
}
