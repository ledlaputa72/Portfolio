"use client";

import type { ReactNode } from "react";
import SynapserColorPicker from "./SynapserColorPicker";

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
        <span className="w-10 font-mono text-[10px] tabular-nums">{value.toFixed(2)}</span>
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
