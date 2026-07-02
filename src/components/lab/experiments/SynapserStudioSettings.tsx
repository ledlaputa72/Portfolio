"use client";

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
  } = useSynapserModel();

  const canRemove = sceneList.length > 1;
  const hasPendingModels = sceneList.some((scene) => scenes[scene.id]?.pendingBuffer != null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[#c9a66b]/30 bg-[#14100d]/95 px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#c9a66b]/80">
            Synapser Studio
          </p>
          <p className="mt-1 text-sm text-[#f0ebe3]/70">프로젝트 환경 설정</p>
          {settingsDirty || hasPendingModels ? (
            <p className="mt-1 text-xs text-amber-400/80">저장하지 않은 변경 사항이 있습니다.</p>
          ) : (
            <p className="mt-1 text-xs text-[#f0ebe3]/35">모든 설정이 저장되었습니다.</p>
          )}
        </div>
        <SettingTip tip={MODEL_SETTING_TIPS.saveProject}>
          <button
            type="button"
            disabled={loading}
            onClick={() => void saveSceneSettings()}
            className="cursor-help rounded-full border border-[#c9a66b]/50 bg-[#c9a66b]/10 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-[#f0ebe3] transition-colors hover:border-[#c9a66b] hover:bg-[#c9a66b]/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            저장
          </button>
        </SettingTip>
      </div>

      <div className="rounded-xl border border-[#2a2520] bg-[#14100d]/70 px-4 py-3">
        <TipField label="Active Scene" tip={MODEL_SETTING_TIPS.activeScene}>
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
                    {scene.label} ({scene.defaultObject}){hasCustom ? " · 커스텀 모델" : ""}
                  </option>
                );
              })}
            </select>
            <button
              type="button"
              onClick={addScene}
              className="shrink-0 rounded-lg border border-[#2a2520] px-3 py-2 text-[11px] uppercase tracking-wider text-[#c9a66b]/90 transition-colors hover:border-[#c9a66b]/50 hover:text-[#f0ebe3]"
            >
              + 씬 추가
            </button>
            <button
              type="button"
              onClick={() => removeScene()}
              disabled={!canRemove}
              className="shrink-0 rounded-lg border border-[#2a2520] px-3 py-2 text-[11px] uppercase tracking-wider text-red-400/70 transition-colors hover:border-red-400/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
            >
              씬 제거
            </button>
          </div>
        </TipField>
        <p className="mt-2 text-[11px] leading-relaxed text-[#f0ebe3]/35">
          선택한 씬의 3D 모델 · 조명 · 배경 · 카메라 · 글리치 설정이 개별 저장됩니다. 씬 추가는 현재 씬
          바로 다음에 삽입됩니다.
        </p>
      </div>

      <SynapserScrollExperienceSettings />
      <SynapserModelSettings compact={compact} hideSceneSelect />
      <SynapserScrollGlitchSettings />
      <SynapserSceneSettingsPanel compact={compact} />
    </div>
  );
}
