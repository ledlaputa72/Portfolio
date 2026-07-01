"use client";

import { useRef } from "react";
import { useSynapserModel } from "./SynapserModelContext";
import { SettingTip, TipField, TipRangeRow } from "./SynapserSettingControls";
import { MODEL_SETTING_TIPS } from "./synapser-setting-tips";
import { SYNAPSER_MODEL_ACCEPT } from "@/lib/synapser-model-store";

type SynapserModelSettingsProps = {
  compact?: boolean;
  hideSceneSelect?: boolean;
};

export default function SynapserModelSettings({
  compact = false,
  hideSceneSelect = false,
}: SynapserModelSettingsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    selectedScene,
    setSelectedScene,
    activeScene,
    sceneList,
    scenes,
    loading,
    loadFile,
    saveModel,
    resetModel,
    setScale,
  } = useSynapserModel();

  const { mode, meta, pendingBuffer, scale } = activeScene;
  const canSave = mode === "custom" && (pendingBuffer !== null || meta !== null);
  const sceneInfo = sceneList.find((s) => s.id === selectedScene) ?? sceneList[0];
  const customCount = sceneList.filter((s) => scenes[s.id]?.mode === "custom").length;

  return (
    <div
      className={`rounded-xl border border-[#2a2520] bg-[#14100d]/90 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#c9a66b]/80">
            3D Model
          </p>

          {!hideSceneSelect ? (
          <TipField label="씬 선택" tip={MODEL_SETTING_TIPS.sceneSelect}>
          <select
            value={selectedScene}
            onChange={(e) => setSelectedScene(e.target.value as typeof selectedScene)}
            className="mt-1.5 w-full max-w-xs rounded-lg border border-[#2a2520] bg-[#0f0c0a] px-3 py-2 text-sm text-[#f0ebe3] outline-none transition-colors focus:border-[#c9a66b]/50"
          >
            {sceneList.map((scene) => {
              const hasCustom = scenes[scene.id].mode === "custom";
              return (
                <option key={scene.id} value={scene.id}>
                  {scene.label} ({scene.defaultObject}){hasCustom ? " · 커스텀" : ""}
                </option>
              );
            })}
          </select>
          </TipField>
          ) : null}

          <p className="mt-2 text-sm text-[#f0ebe3]/70">
            {loading
              ? "모델 설정 불러오는 중…"
              : mode === "custom"
                ? `${sceneInfo.label}: ${meta?.fileName ?? "Custom model"}`
                : `${sceneInfo.label}: 기본 ${sceneInfo.defaultObject}`}
          </p>
          {pendingBuffer ? (
            <p className="mt-1 text-xs text-amber-400/80">저장하지 않으면 새로고침 시 사라질 수 있습니다.</p>
          ) : null}
          {customCount > 0 ? (
            <p className="mt-1 text-[11px] text-[#f0ebe3]/35">
              커스텀 모델 {customCount}/{sceneList.length}개 씬에 적용됨
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <SettingTip tip={MODEL_SETTING_TIPS.load}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="cursor-help rounded-full border border-[#c9a66b]/40 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3] transition-colors hover:border-[#c9a66b]"
            >
              불러오기
            </button>
          </SettingTip>
          <SettingTip tip={MODEL_SETTING_TIPS.save}>
            <button
              type="button"
              disabled={!canSave}
              onClick={() => saveModel()}
              className="cursor-help rounded-full border border-[#6b8cce]/40 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3] transition-colors hover:border-[#6b8cce] disabled:cursor-not-allowed disabled:opacity-40"
            >
              저장
            </button>
          </SettingTip>
          <SettingTip tip={MODEL_SETTING_TIPS.reset}>
            <button
              type="button"
              disabled={mode === "default"}
              onClick={() => resetModel()}
              className="cursor-help rounded-full border border-[#f0ebe3]/15 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3]/60 transition-colors hover:border-[#f0ebe3]/35 disabled:cursor-not-allowed disabled:opacity-40"
            >
              기본값
            </button>
          </SettingTip>
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
        <TipRangeRow
          label="Scale"
          tip={MODEL_SETTING_TIPS.scale}
          labelWidth="w-20"
          value={scale}
          min={0.25}
          max={3}
          step={0.05}
          onChange={setScale}
        />
      ) : null}

      <p className="mt-3 text-[11px] leading-relaxed text-[#f0ebe3]/35">
        씬을 선택한 뒤 GLB / GLTF를 불러오면 해당 장면의 3D 오브젝트만 교체됩니다. 저장 시 브라우저에 씬별로
        보관되며 전체 페이지 샘플에서도 동일하게 사용됩니다.
      </p>
    </div>
  );
}
