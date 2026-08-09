"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import SynapserColorPicker from "./SynapserColorPicker";

function decimalPlacesFromStep(step: number): number {
  if (!Number.isFinite(step) || step <= 0) return 2;
  const s = String(step);
  if (s.includes("e") || s.includes("E")) {
    const decimals = Math.ceil(-Math.log10(step));
    return Math.max(0, decimals);
  }
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}

function snapToStep(value: number, min: number, max: number, step: number): number {
  const clamped = Math.max(min, Math.min(max, value));
  if (!Number.isFinite(step) || step <= 0) return clamped;
  const snapped = Math.round(clamped / step) * step;
  const decimals = decimalPlacesFromStep(step);
  return Number(snapped.toFixed(decimals));
}

export function EditableRangeValue({
  value,
  min,
  max,
  step,
  onChange,
  className,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  const { locale } = useLocale();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const decimals = decimalPlacesFromStep(step);
  const display = value.toFixed(decimals);

  const commit = () => {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed)) {
      setEditing(false);
      return;
    }
    onChange(snapToStep(parsed, min, max, step));
    setEditing(false);
  };

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={draft}
        min={min}
        max={max}
        step={step}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            setEditing(false);
          }
        }}
        onClick={(e) => e.stopPropagation()}
        className={`w-14 shrink-0 rounded border border-[#c9a66b]/50 bg-[#0f0c0a] px-1 py-0.5 text-right font-mono text-[10px] tabular-nums text-[#f0ebe3] outline-none ${className ?? ""}`}
        aria-label={locale === "ko" ? "값 입력" : "Enter value"}
      />
    );
  }

  return (
    <button
      type="button"
      title={locale === "ko" ? "클릭하여 값 입력" : "Click to enter value"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDraft(display);
        setEditing(true);
      }}
      className={`w-14 shrink-0 cursor-text rounded px-0.5 text-right font-mono text-[10px] tabular-nums text-[#f0ebe3]/80 transition-colors hover:bg-[#2a2520]/60 hover:text-[#f0ebe3] ${className ?? ""}`}
    >
      {display}
    </button>
  );
}

export function SettingTip({
  label,
  tip,
  className,
  children,
}: {
  label?: string;
  tip: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span className={`group/tip relative inline-flex max-w-full ${className ?? ""}`}>
      {children ?? (
        <span className="cursor-help border-b border-dotted border-[#f0ebe3]/20">{label}</span>
      )}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-50 mt-1.5 hidden w-56 rounded-lg border border-[#3a3530] bg-[#0a0806] px-2.5 py-2 text-[10px] font-normal normal-case leading-relaxed tracking-normal text-[#f0ebe3]/85 shadow-xl group-hover/tip:block"
      >
        {tip}
      </span>
    </span>
  );
}

export function TipRangeRow({
  label,
  tip,
  value,
  onChange,
  min,
  max,
  step,
  labelWidth = "w-32",
}: {
  label: string;
  tip: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  labelWidth?: string;
}) {
  return (
    <div className="group/tip relative">
      <label className="flex cursor-help items-center gap-2 text-[11px] text-[#f0ebe3]/55">
        <span className={`${labelWidth} shrink-0 uppercase tracking-wider`}>{label}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-[#c9a66b]"
        />
        <EditableRangeValue value={value} min={min} max={max} step={step} onChange={onChange} />
      </label>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-50 mt-1 hidden w-56 rounded-lg border border-[#3a3530] bg-[#0a0806] px-2.5 py-2 text-[10px] font-normal normal-case leading-relaxed tracking-normal text-[#f0ebe3]/85 shadow-xl group-hover/tip:block"
      >
        {tip}
      </span>
    </div>
  );
}

export function TipCheckboxRow({
  label,
  tip,
  checked,
  onChange,
}: {
  label: string;
  tip: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="group/tip relative">
      <label className="flex cursor-help items-center gap-2 text-[11px] text-[#f0ebe3]/55">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span>{label}</span>
      </label>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-full z-50 mt-1 hidden w-56 rounded-lg border border-[#3a3530] bg-[#0a0806] px-2.5 py-2 text-[10px] font-normal normal-case leading-relaxed tracking-normal text-[#f0ebe3]/85 shadow-xl group-hover/tip:block"
      >
        {tip}
      </span>
    </div>
  );
}

export function TipField({
  label,
  tip,
  children,
}: {
  label: string;
  tip: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group/tip relative block text-[11px] text-[#f0ebe3]/50">
      <span className="mb-1 block uppercase tracking-wider">
        <SettingTip label={label} tip={tip} />
      </span>
      {children}
    </div>
  );
}

export function TipColorField({
  label,
  tip,
  value,
  onChange,
  inline = false,
}: {
  label: string;
  tip: string;
  value: string;
  onChange: (hex: string) => void;
  inline?: boolean;
}) {
  if (inline) {
    return (
      <div className="group/tip relative shrink-0 text-[10px] text-[#f0ebe3]/50">
        <span className="mb-1 block text-center uppercase tracking-wider">
          <SettingTip label={label} tip={tip} />
        </span>
        <div className="flex justify-center">
          <SynapserColorPicker value={value} onChange={onChange} />
        </div>
      </div>
    );
  }

  return (
    <TipField label={label} tip={tip}>
      <SynapserColorPicker value={value} onChange={onChange} />
    </TipField>
  );
}

export function TipSegmentRow<T extends string>({
  label,
  tip,
  value,
  options,
  onChange,
  labelWidth = "w-32",
}: {
  label: string;
  tip: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
  labelWidth?: string;
}) {
  return (
    <div className="group/tip relative">
      <div className="flex cursor-help items-center gap-2 text-[11px] text-[#f0ebe3]/55">
        <span className={`${labelWidth} shrink-0 uppercase tracking-wider`}>{label}</span>
        <div className="flex flex-wrap gap-1">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-md border px-2 py-1 text-[10px] uppercase tracking-wider transition-colors ${
                value === option.id
                  ? "border-[#c9a66b] bg-[#c9a66b]/15 text-[#f0ebe3]"
                  : "border-[#2a2520] text-[#f0ebe3]/45 hover:border-[#3a3530] hover:text-[#f0ebe3]/70"
              }`}
            >
              {option.label}
            </button>
          ))}
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

export function TipSection({
  title,
  tip,
  open,
  onToggle,
  children,
}: {
  title: string;
  tip?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-[#2a2520] pt-3">
      <div className="group/tip relative">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full cursor-help items-center justify-between text-left text-xs uppercase tracking-wider text-[#f0ebe3]/70"
        >
          {title}
          <span className="text-[#c9a66b]/60">{open ? "−" : "+"}</span>
        </button>
        {tip ? (
          <span
            role="tooltip"
            className="pointer-events-none absolute left-0 top-full z-50 mt-1 hidden w-56 rounded-lg border border-[#3a3530] bg-[#0a0806] px-2.5 py-2 text-[10px] font-normal normal-case leading-relaxed tracking-normal text-[#f0ebe3]/85 shadow-xl group-hover/tip:block"
          >
            {tip}
          </span>
        ) : null}
      </div>
      {open ? <div className="mt-3 space-y-3">{children}</div> : null}
    </div>
  );
}
