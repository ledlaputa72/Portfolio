"use client";

import { useRef } from "react";
import { useSynapserModel } from "./SynapserModelContext";
import { SYNAPSER_MODEL_ACCEPT } from "@/lib/synapser-model-store";

type SynapserModelSettingsProps = {
  compact?: boolean;
};

export default function SynapserModelSettings({ compact = false }: SynapserModelSettingsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    mode,
    meta,
    pendingBuffer,
    scale,
    loading,
    loadFile,
    saveModel,
    resetModel,
    setScale,
  } = useSynapserModel();

  const canSave = mode === "custom" && (pendingBuffer !== null || meta !== null);

  return (
    <div
      className={`rounded-xl border border-[#2a2520] bg-[#14100d]/90 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#c9a66b]/80">
            3D Model
          </p>
          <p className="mt-1 text-sm text-[#f0ebe3]/70">
            {loading
              ? "모델 설정 불러오는 중…"
              : mode === "custom"
                ? meta?.fileName ?? "Custom model"
                : "기본 프로시저럴 씬 (Torus · Archive · Network)"}
          </p>
          {pendingBuffer ? (
            <p className="mt-1 text-xs text-amber-400/80">저장하지 않으면 새로고침 시 사라질 수 있습니다.</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-[#c9a66b]/40 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3] transition-colors hover:border-[#c9a66b]"
          >
            불러오기
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() => saveModel()}
            className="rounded-full border border-[#6b8cce]/40 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3] transition-colors hover:border-[#6b8cce] disabled:cursor-not-allowed disabled:opacity-40"
          >
            저장
          </button>
          <button
            type="button"
            disabled={mode === "default"}
            onClick={() => resetModel()}
            className="rounded-full border border-[#f0ebe3]/15 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3]/60 transition-colors hover:border-[#f0ebe3]/35 disabled:cursor-not-allowed disabled:opacity-40"
          >
            기본값
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={SYNAPSER_MODEL_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) loadFile(file);
          e.target.value = "";
        }}
      />

      {mode === "custom" ? (
        <label className="mt-4 flex items-center gap-3 text-xs text-[#f0ebe3]/55">
          <span className="whitespace-nowrap uppercase tracking-wider">Scale</span>
          <input
            type="range"
            min={0.25}
            max={3}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full max-w-xs accent-[#c9a66b]"
          />
          <span className="font-mono tabular-nums">{scale.toFixed(2)}</span>
        </label>
      ) : null}

      <p className="mt-3 text-[11px] leading-relaxed text-[#f0ebe3]/35">
        GLB / GLTF 파일을 불러오면 스크롤 3D 씬에 적용됩니다. 저장 시 브라우저에 보관되며 전체 페이지 샘플에서도
        동일하게 사용됩니다.
      </p>
    </div>
  );
}
