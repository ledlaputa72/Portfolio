"use client";

import { TipSegmentRow } from "./SynapserSettingControls";
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
  return (
    <div className="space-y-2">
      <TipSegmentRow<SynapserAnchorAlignX>
        label="좌우"
        tip={alignXTip}
        labelWidth={labelWidth}
        value={value.alignX}
        options={[
          { id: "left", label: "좌" },
          { id: "center", label: "중" },
          { id: "right", label: "우" },
        ]}
        onChange={(alignX) => onChange({ ...value, alignX })}
      />
      <TipSegmentRow<SynapserAnchorAlignY>
        label="상중하"
        tip={alignYTip}
        labelWidth={labelWidth}
        value={value.alignY}
        options={[
          { id: "top", label: "상" },
          { id: "middle", label: "중" },
          { id: "bottom", label: "하" },
        ]}
        onChange={(alignY) => onChange({ ...value, alignY })}
      />
    </div>
  );
}
