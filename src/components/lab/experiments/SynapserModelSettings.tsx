"use client";

import { useRef } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
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
  const { locale } = useLocale();
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
          <TipField label={locale === "ko" ? "씬 선택" : "Select scene"} tip={MODEL_SETTING_TIPS.sceneSelect[locale]}>
          <select
            value={selectedScene}
            onChange={(e) => setSelectedScene(e.target.value as typeof selectedScene)}
            className="mt-1.5 w-full max-w-xs rounded-lg border border-[#2a2520] bg-[#0f0c0a] px-3 py-2 text-sm text-[#f0ebe3] outline-none transition-colors focus:border-[#c9a66b]/50"
          >
            {sceneList.map((scene) => {
              const hasCustom = scenes[scene.id].mode === "custom";
              return (
                <option key={scene.id} value={scene.id}>
                  {scene.label} ({scene.defaultObject}){hasCustom ? (locale === "ko" ? " · 커스텀" : " · custom") : ""}
                </option>
              );
            })}
          </select>
          </TipField>
          ) : null}

          <p className="mt-2 text-sm text-[#f0ebe3]/70">
            {loading
              ? locale === "ko"
                ? "모델 설정 불러오는 중…"
                : "Loading model settings…"
              : mode === "custom"
                ? `${sceneInfo.label}: ${meta?.fileName ?? "Custom model"}`
                : `${sceneInfo.label}: ` +
                  (locale === "ko"
                    ? `기본 ${sceneInfo.defaultObject}`
                    : `default ${sceneInfo.defaultObject}`)}
          </p>
          {pendingBuffer ? (
            <p className="mt-1 text-xs text-amber-400/80">
              {locale === "ko"
                ? "저장하지 않으면 새로고침 시 사라질 수 있습니다."
                : "Unsaved changes may be lost on refresh."}
            </p>
          ) : null}
          {customCount > 0 ? (
            <p className="mt-1 text-[11px] text-[#f0ebe3]/35">
              {locale === "ko"
                ? `커스텀 모델 ${customCount}/${sceneList.length}개 씬에 적용됨`
                : `custom model applied to ${customCount}/${sceneList.length} scenes`}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <SettingTip tip={MODEL_SETTING_TIPS.load[locale]}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="cursor-help rounded-full border border-[#c9a66b]/40 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3] transition-colors hover:border-[#c9a66b]"
            >
              {locale === "ko" ? "불러오기" : "Load"}
            </button>
          </SettingTip>
          <SettingTip tip={MODEL_SETTING_TIPS.save[locale]}>
            <button
              type="button"
              disabled={!canSave}
              onClick={() => saveModel()}
              className="cursor-help rounded-full border border-[#6b8cce]/40 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3] transition-colors hover:border-[#6b8cce] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {locale === "ko" ? "저장" : "Save"}
            </button>
          </SettingTip>
          <SettingTip tip={MODEL_SETTING_TIPS.reset[locale]}>
            <button
              type="button"
              disabled={mode === "default"}
              onClick={() => resetModel()}
              className="cursor-help rounded-full border border-[#f0ebe3]/15 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3]/60 transition-colors hover:border-[#f0ebe3]/35 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {locale === "ko" ? "기본값" : "Default"}
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
          tip={MODEL_SETTING_TIPS.scale[locale]}
          labelWidth="w-20"
          value={scale}
          min={0.25}
          max={3}
          step={0.05}
          onChange={setScale}
        />
      ) : null}

      <p className="mt-3 text-[11px] leading-relaxed text-[#f0ebe3]/35">
        {locale === "ko"
          ? "씬을 선택한 뒤 GLB / GLTF를 불러오면 해당 장면의 3D 오브젝트만 교체됩니다. 저장 시 브라우저에 씬별로 보관되며 전체 페이지 샘플에서도 동일하게 사용됩니다."
          : "Select a scene, then load a GLB / GLTF to replace only that scene's 3D object. Saved models are stored per scene in the browser and reused across the full-page sample."}
      </p>
    </div>
  );
}
