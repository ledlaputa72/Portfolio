"use client";

"use client";

import { useRef } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { useSynapserModel } from "./SynapserModelContext";
import SynapserModelSettings from "./SynapserModelSettings";
import SynapserScrollExperienceSettings from "./SynapserScrollExperienceSettings";
import SynapserSceneSettingsPanel from "./SynapserSceneSettingsPanel";
import SynapserScrollGlitchSettings from "./SynapserScrollGlitchSettings";
import { SettingTip, TipField } from "./SynapserSettingControls";
import { MODEL_SETTING_TIPS } from "./synapser-setting-tips";

type SynapserStudioSettingsProps = {
  compact?: boolean;
};

export default function SynapserStudioSettings({ compact = false }: SynapserStudioSettingsProps) {
  const { locale } = useLocale();
  const {
    selectedScene,
    setSelectedScene,
    sceneList,
    scenes,
    addScene,
    removeScene,
    settingsDirty,
    loading,
    saveSceneSettings,
    exportProjectSettings,
    importProjectSettings,
  } = useSynapserModel();

  const importFileRef = useRef<HTMLInputElement>(null);

  const canRemove = sceneList.length > 1;
  const hasPendingModels = sceneList.some((scene) => scenes[scene.id]?.pendingBuffer != null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[#c9a66b]/30 bg-[#14100d]/95 px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#c9a66b]/80">
            Synapser Studio
          </p>
          <p className="mt-1 text-sm text-[#f0ebe3]/70">
            {locale === "ko" ? "프로젝트 환경 설정" : "Project settings"}
          </p>
          {settingsDirty || hasPendingModels ? (
            <p className="mt-1 text-xs text-amber-400/80">
              {locale === "ko" ? "저장하지 않은 변경 사항이 있습니다." : "You have unsaved changes."}
            </p>
          ) : (
            <p className="mt-1 text-xs text-[#f0ebe3]/35">
              {locale === "ko" ? "모든 설정이 저장되었습니다." : "All settings saved."}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <SettingTip
            tip={
              locale === "ko"
                ? "설정을 JSON 파일로 내보냅니다. 씬 구성·글리치·카메라 값이 모두 포함됩니다. (3D 모델 제외)"
                : "Export settings as a JSON file. Scene config, glitch, and camera values are all included. (3D models excluded)"
            }
          >
            <button
              type="button"
              onClick={exportProjectSettings}
              className="cursor-help rounded-full border border-[#f0ebe3]/20 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3]/70 transition-colors hover:border-[#f0ebe3]/40 hover:text-[#f0ebe3]"
            >
              {locale === "ko" ? "내보내기" : "Export"}
            </button>
          </SettingTip>
          <SettingTip
            tip={
              locale === "ko"
                ? "이전에 내보낸 Synapser 설정 JSON 파일을 불러옵니다. 현재 설정이 교체됩니다."
                : "Load a previously exported Synapser settings JSON file. Current settings will be replaced."
            }
          >
            <button
              type="button"
              onClick={() => importFileRef.current?.click()}
              className="cursor-help rounded-full border border-[#f0ebe3]/20 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3]/70 transition-colors hover:border-[#f0ebe3]/40 hover:text-[#f0ebe3]"
            >
              {locale === "ko" ? "가져오기" : "Import"}
            </button>
          </SettingTip>
          <input
            ref={importFileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importProjectSettings(file);
              e.target.value = "";
            }}
          />
          <SettingTip tip={MODEL_SETTING_TIPS.saveProject[locale]}>
            <button
              type="button"
              disabled={loading}
              onClick={() => void saveSceneSettings()}
              className="cursor-help rounded-full border border-[#c9a66b]/50 bg-[#c9a66b]/10 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-[#f0ebe3] transition-colors hover:border-[#c9a66b] hover:bg-[#c9a66b]/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {locale === "ko" ? "저장" : "Save"}
            </button>
          </SettingTip>
        </div>
      </div>

      <div className="rounded-xl border border-[#2a2520] bg-[#14100d]/70 px-4 py-3">
        <TipField label="Active Scene" tip={MODEL_SETTING_TIPS.activeScene[locale]}>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              value={selectedScene}
              onChange={(e) => setSelectedScene(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-[#2a2520] bg-[#0f0c0a] px-3 py-2 text-sm text-[#f0ebe3] outline-none transition-colors focus:border-[#c9a66b]/50"
            >
              {sceneList.map((scene) => {
                const hasCustom = scenes[scene.id]?.mode === "custom";
                return (
                  <option key={scene.id} value={scene.id}>
                    {scene.label} ({scene.defaultObject}){hasCustom ? (locale === "ko" ? " · 커스텀 모델" : " · custom model") : ""}
                  </option>
                );
              })}
            </select>
            <button
              type="button"
              onClick={addScene}
              className="shrink-0 rounded-lg border border-[#2a2520] px-3 py-2 text-[11px] uppercase tracking-wider text-[#c9a66b]/90 transition-colors hover:border-[#c9a66b]/50 hover:text-[#f0ebe3]"
            >
              {locale === "ko" ? "+ 씬 추가" : "+ Add scene"}
            </button>
            <button
              type="button"
              onClick={() => removeScene()}
              disabled={!canRemove}
              className="shrink-0 rounded-lg border border-[#2a2520] px-3 py-2 text-[11px] uppercase tracking-wider text-red-400/70 transition-colors hover:border-red-400/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {locale === "ko" ? "씬 제거" : "Remove scene"}
            </button>
          </div>
        </TipField>
        <p className="mt-2 text-[11px] leading-relaxed text-[#f0ebe3]/35">
          {locale === "ko"
            ? "선택한 씬의 3D 모델 · 조명 · 배경 · 카메라 · 글리치 설정이 개별 저장됩니다. 씬 추가는 현재 씬 바로 다음에 삽입됩니다."
            : "The selected scene's 3D model · lighting · background · camera · glitch settings are saved individually. A new scene is inserted right after the current scene."}
        </p>
      </div>

      <SynapserScrollExperienceSettings />
      <SynapserModelSettings compact={compact} hideSceneSelect />
      <SynapserScrollGlitchSettings />
      <SynapserSceneSettingsPanel compact={compact} />
    </div>
  );
}
