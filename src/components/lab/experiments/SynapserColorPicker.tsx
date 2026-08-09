"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import {
  hexToRgb,
  hsvToRgb,
  normalizeHexColor,
  rgbToHex,
  rgbToHsv,
} from "@/lib/synapser-color-utils";

type SynapserColorPickerProps = {
  value: string;
  onChange: (hex: string) => void;
  className?: string;
};

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export default function SynapserColorPicker({ value, onChange, className }: SynapserColorPickerProps) {
  const { locale } = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const safeHex = normalizeHexColor(value) ?? "#000000";
  const baseRgb = hexToRgb(safeHex);
  const baseHsv = rgbToHsv(baseRgb.r, baseRgb.g, baseRgb.b);

  const [hue, setHue] = useState(baseHsv.h);
  const [sat, setSat] = useState(baseHsv.s);
  const [val, setVal] = useState(baseHsv.v);
  const [hexDraft, setHexDraft] = useState(safeHex);
  const [rgbDraft, setRgbDraft] = useState(baseRgb);

  const displayHex = rgbToHex(rgbDraft.r, rgbDraft.g, rgbDraft.b);

  const applyRgb = useCallback(
    (r: number, g: number, b: number) => {
      const hex = rgbToHex(r, g, b);
      const hsv = rgbToHsv(r, g, b);
      setHue(hsv.h);
      setSat(hsv.s);
      setVal(hsv.v);
      setRgbDraft({ r, g, b });
      setHexDraft(hex);
      onChange(hex);
    },
    [onChange],
  );

  const applyHsv = useCallback(
    (h: number, s: number, v: number) => {
      const rgb = hsvToRgb(h, s, v);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      setHue(h);
      setSat(s);
      setVal(v);
      setRgbDraft({ r: rgb.r, g: rgb.g, b: rgb.b });
      setHexDraft(hex);
      onChange(hex);
    },
    [onChange],
  );

  useEffect(() => {
    const hex = normalizeHexColor(value) ?? "#000000";
    const rgb = hexToRgb(hex);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    setHue(hsv.h);
    setSat(hsv.s);
    setVal(hsv.v);
    setRgbDraft(rgb);
    setHexDraft(hex);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const pickSv = (clientX: number, clientY: number) => {
    const rect = svRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
    applyHsv(hue, s, v);
  };

  const pickHue = (clientX: number) => {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) return;
    const h = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 360;
    applyHsv(h, sat, val);
  };

  const bindDrag = (
    move: (event: PointerEvent) => void,
    end?: () => void,
  ) => ({
    onPointerDown: (event: React.PointerEvent) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      move(event.nativeEvent);
    },
    onPointerMove: (event: React.PointerEvent) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
      move(event.nativeEvent);
    },
    onPointerUp: (event: React.PointerEvent) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      end?.();
    },
  });

  const commitHex = (raw: string) => {
    const next = normalizeHexColor(raw);
    if (!next) {
      setHexDraft(safeHex);
      return;
    }
    const rgb = hexToRgb(next);
    applyRgb(rgb.r, rgb.g, rgb.b);
  };

  const pureHue = hsvToRgb(hue, 1, 1);
  const hueColor = rgbToHex(pureHue.r, pureHue.g, pureHue.b);

  return (
    <div ref={rootRef} className={`relative inline-flex ${className ?? ""}`}>
      <button
        type="button"
        aria-label={locale === "ko" ? "색상 선택" : "Select color"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="h-8 w-10 shrink-0 cursor-pointer rounded border border-[#2a2520] bg-[#0f0c0a] p-0.5"
      >
        <span
          className="block h-full w-full rounded-[3px] border border-[#f0ebe3]/10"
          style={{ backgroundColor: safeHex }}
        />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-[70] mt-1.5 w-[220px] rounded-lg border border-[#3a3530] bg-[#14100d] p-3 shadow-xl">
          <div
            ref={svRef}
            className="relative h-28 w-full cursor-crosshair overflow-hidden rounded-md border border-[#2a2520]"
            style={{ backgroundColor: hueColor }}
            {...bindDrag((event) => pickSv(event.clientX, event.clientY))}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            <span
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
              style={{ left: `${sat * 100}%`, top: `${(1 - val) * 100}%` }}
            />
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span
              className="h-6 w-6 shrink-0 rounded-full border border-[#f0ebe3]/15"
              style={{ backgroundColor: displayHex }}
            />
            <div
              ref={hueRef}
              className="relative h-3 flex-1 cursor-pointer rounded-full"
              style={{
                background:
                  "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
              }}
              {...bindDrag((event) => pickHue(event.clientX))}
            >
              <span
                className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                style={{ left: `${(hue / 360) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["R", "G", "B"] as const).map((label) => {
              const key = label.toLowerCase() as "r" | "g" | "b";
              return (
                <label key={label} className="text-center text-[10px] text-[#f0ebe3]/45">
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgbDraft[key]}
                    onChange={(e) => {
                      const parsed = Number(e.target.value);
                      if (!Number.isFinite(parsed)) return;
                      const next = clampChannel(parsed);
                      const rgb = { ...rgbDraft, [key]: next };
                      setRgbDraft(rgb);
                      applyRgb(rgb.r, rgb.g, rgb.b);
                    }}
                    className="w-full rounded border border-[#2a2520] bg-[#f0ebe3] px-1 py-1 text-center font-mono text-xs text-[#14100d]"
                  />
                  <span className="mt-1 block">{label}</span>
                </label>
              );
            })}
          </div>

          <label className="mt-2 block text-[10px] text-[#f0ebe3]/45">
            <div className="flex items-center gap-1 rounded border border-[#2a2520] bg-[#f0ebe3] px-2 py-1">
              <span className="font-mono text-xs text-[#14100d]/50">#</span>
              <input
                type="text"
                value={hexDraft.replace("#", "")}
                onChange={(e) => setHexDraft(`#${e.target.value.replace(/#/g, "")}`)}
                onBlur={() => commitHex(hexDraft)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitHex(hexDraft);
                }}
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent font-mono text-xs text-[#14100d] outline-none"
              />
            </div>
            <span className="mt-1 block text-center">HEX</span>
          </label>
        </div>
      ) : null}
    </div>
  );
}
