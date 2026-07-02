"use client";

import {
  ANCHOR_GRID_COLS,
  ANCHOR_GRID_ROWS,
  anchorGridLabel,
  type SynapserAnchorAlignX,
  type SynapserAnchorAlignY,
  type SynapserAnchorSettings,
} from "@/lib/synapser-anchor-layout";
import { SettingTip } from "./SynapserSettingControls";

type SynapserAnchorGridProps = {
  label: string;
  tip: string;
  value: SynapserAnchorSettings;
  onChange: (next: SynapserAnchorSettings) => void;
};

export default function SynapserAnchorGrid({ label, tip, value, onChange }: SynapserAnchorGridProps) {
  const isSelected = (alignX: SynapserAnchorAlignX, alignY: SynapserAnchorAlignY) =>
    value.alignX === alignX && value.alignY === alignY;

  return (
    <div className="group/tip relative">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider text-[#f0ebe3]/55">
          <SettingTip label={label} tip={tip} />
        </span>
        <span className="font-mono text-[10px] tabular-nums text-[#c9a66b]/80">
          {anchorGridLabel(value)}
        </span>
      </div>

      <div
        className="relative mx-auto aspect-[4/3] w-full max-w-[220px] rounded-lg border border-[#2a2520] bg-[#0a0806]/80"
        role="group"
        aria-label={label}
      >
        <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
          {ANCHOR_GRID_ROWS.map((row) =>
            ANCHOR_GRID_COLS.map((col) => (
              <div
                key={`${row}-${col}`}
                className="border border-[#f0ebe3]/[0.06]"
                aria-hidden
              />
            )),
          )}
        </div>

        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-1">
          {ANCHOR_GRID_ROWS.map((alignY) =>
            ANCHOR_GRID_COLS.map((alignX) => {
              const selected = isSelected(alignX, alignY);
              return (
                <button
                  key={`${alignY}-${alignX}`}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${alignY} ${alignX}`}
                  onClick={() => onChange({ alignX, alignY })}
                  className="relative flex items-center justify-center outline-none"
                >
                  <span
                    className={`h-3.5 w-3.5 rounded-full border-2 transition-all ${
                      selected
                        ? "border-[#f0ebe3] bg-[#c9a66b] shadow-[0_0_12px_rgba(201,166,107,0.55)]"
                        : "border-[#c9a66b]/70 bg-transparent hover:border-[#c9a66b] hover:bg-[#c9a66b]/20"
                    }`}
                  />
                </button>
              );
            }),
          )}
        </div>
      </div>

      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-50 mt-1 hidden w-56 rounded-lg border border-[#3a3530] bg-[#0a0806] px-2.5 py-2 text-[10px] font-normal normal-case leading-relaxed tracking-normal text-[#f0ebe3]/85 shadow-xl group-hover/tip:block"
      >
        {tip}
      </span>
    </div>
  );
}
