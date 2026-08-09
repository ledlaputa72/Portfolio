"use client";

import { TipSegmentRow } from "./SynapserSettingControls";
import { useLocale } from "@/i18n/LocaleProvider";
import type {
  SynapserAnchorAlignX,
  SynapserAnchorAlignY,
  SynapserAnchorSettings,
} from "@/lib/synapser-anchor-layout";

type SynapserAnchorPickerProps = {
  value: SynapserAnchorSettings;
  onChange: (next: SynapserAnchorSettings) => void;
  alignXTip: string;
  alignYTip: string;
  labelWidth?: string;
};

export default function SynapserAnchorPicker({
  value,
  onChange,
  alignXTip,
  alignYTip,
  labelWidth = "w-32",
}: SynapserAnchorPickerProps) {
  const { locale } = useLocale();
  return (
    <div className="space-y-2">
      <TipSegmentRow<SynapserAnchorAlignX>
        label={locale === "ko" ? "좌우" : "Horizontal"}
        tip={alignXTip}
        labelWidth={labelWidth}
        value={value.alignX}
        options={[
          { id: "left", label: locale === "ko" ? "좌" : "L" },
          { id: "center", label: locale === "ko" ? "중" : "C" },
          { id: "right", label: locale === "ko" ? "우" : "R" },
        ]}
        onChange={(alignX) => onChange({ ...value, alignX })}
      />
      <TipSegmentRow<SynapserAnchorAlignY>
        label={locale === "ko" ? "상중하" : "Vertical"}
        tip={alignYTip}
        labelWidth={labelWidth}
        value={value.alignY}
        options={[
          { id: "top", label: locale === "ko" ? "상" : "T" },
          { id: "middle", label: locale === "ko" ? "중" : "M" },
          { id: "bottom", label: locale === "ko" ? "하" : "B" },
        ]}
        onChange={(alignY) => onChange({ ...value, alignY })}
      />
    </div>
  );
}
