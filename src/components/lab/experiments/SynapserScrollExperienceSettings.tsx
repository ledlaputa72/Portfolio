"use client";

import { useState } from "react";
import { useSynapserModel } from "./SynapserModelContext";
import { TipRangeRow, TipSection } from "./SynapserSettingControls";
import { MODEL_SETTING_TIPS } from "./synapser-setting-tips";
import {
  getSynapserScrollHeightVh,
  SYNAPSER_SCROLL_TRACK_SCALE_MAX,
  SYNAPSER_SCROLL_TRACK_SCALE_MIN,
} from "@/lib/synapser-scroll-experience";

export default function SynapserScrollExperienceSettings() {
  const [open, setOpen] = useState(true);
  const { scrollExperience, patchScrollExperience } = useSynapserModel();
  const trackVh = getSynapserScrollHeightVh(scrollExperience);
  const pacePercent = Math.round(scrollExperience.trackScale * 100);

  return (
    <div className="rounded-xl border border-[#2a2520] bg-[#14100d]/70 px-4 py-3">
      <TipSection
        title="스크롤 진행"
        tip={MODEL_SETTING_TIPS.scrollPace}
        open={open}
        onToggle={() => setOpen((v) => !v)}
      >
        <TipRangeRow
          label="진행 속도"
          tip={MODEL_SETTING_TIPS.scrollPace}
          labelWidth="w-28"
          value={pacePercent}
          min={Math.round(SYNAPSER_SCROLL_TRACK_SCALE_MIN * 100)}
          max={Math.round(SYNAPSER_SCROLL_TRACK_SCALE_MAX * 100)}
          step={10}
          onChange={(v) => patchScrollExperience({ trackScale: v / 100 })}
        />
        <p className="text-[11px] leading-relaxed text-[#f0ebe3]/35">
          현재 트랙 길이 약 {trackVh}vh · 100% = 기본 속도. 값을 올리면 같은 %까지 더 많이 스크롤해야
          합니다.
        </p>
      </TipSection>
    </div>
  );
}
