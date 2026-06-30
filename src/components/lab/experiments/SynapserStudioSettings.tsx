"use client";

import { SYNAPSER_SCENES, useSynapserModel } from "./SynapserModelContext";
import SynapserModelSettings from "./SynapserModelSettings";
import SynapserSceneSettingsPanel from "./SynapserSceneSettingsPanel";
import SynapserScrollGlitchSettings from "./SynapserScrollGlitchSettings";
import { TipField } from "./SynapserSettingControls";
import { MODEL_SETTING_TIPS } from "./synapser-setting-tips";

type SynapserStudioSettingsProps = {
  compact?: boolean;
};

export default function SynapserStudioSettings({ compact = false }: SynapserStudioSettingsProps) {
  const { selectedScene, setSelectedScene, scenes } = useSynapserModel();

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#2a2520] bg-[#14100d]/70 px-4 py-3">
        <TipField label="Active Scene" tip={MODEL_SETTING_TIPS.activeScene}>
          <select
            value={selectedScene}
            onChange={(e) => setSelectedScene(e.target.value as typeof selectedScene)}
            className="mt-2 w-full max-w-sm rounded-lg border border-[#2a2520] bg-[#0f0c0a] px-3 py-2 text-sm text-[#f0ebe3] outline-none transition-colors focus:border-[#c9a66b]/50"
          >
            {SYNAPSER_SCENES.map((scene) => {
              const hasCustom = scenes[scene.id].mode === "custom";
              return (
                <option key={scene.id} value={scene.id}>
                  {scene.label} ({scene.defaultObject}){hasCustom ? " · 커스텀 모델" : ""}
                </option>
              );
            })}
          </select>
        </TipField>
        <p className="mt-2 text-[11px] leading-relaxed text-[#f0ebe3]/35">
          선택한 씬에 3D 모델 · 조명 · 배경 · 카메라 설정이 적용됩니다.
        </p>
      </div>

      <SynapserModelSettings compact={compact} hideSceneSelect />
      <SynapserScrollGlitchSettings />
      <SynapserSceneSettingsPanel compact={compact} />
    </div>
  );
}
