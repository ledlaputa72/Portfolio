"use client";

import { useState } from "react";
import { useSynapserModel } from "./SynapserModelContext";
import {
  SettingTip,
  TipCheckboxRow,
  TipColorField,
  TipField,
  TipRangeRow,
  TipSection,
} from "./SynapserSettingControls";
import {
  SYNAPSER_GLITCH_PRESET_OPTIONS,
  applySynapserGlitchPreset,
  type SynapserGlitchLayerSettings,
  type SynapserGlitchObjectLayer,
  type SynapserGlitchPresetId,
  type SynapserScrollGlitchSettings,
} from "@/lib/synapser-scroll-glitch";

const TIPS = {
  preset: "미리 조정된 글리치 조합입니다. 슬라이더를 바꾸면 Custom으로 전환됩니다.",
  enabled: "스크롤·씬 전환 글리치 시스템 전체를 켜거나 끕니다.",
  masterIntensity: "버스트의 전체 세기입니다. 아래 3개 영역 강도에 공통으로 곱해집니다.",
  decay: "글리치 버스트가 사라지는 속도입니다. 낮을수록 빨리 줄어듭니다.",
  scrollSensitivity: "스크롤 속도에 따른 버스트 반응입니다.",
  burstOnSceneChange: "씬(Manifesto/Archive/Journey) 전환 시 버스트를 발생시킵니다.",
  burstAtSceneStart: "각 씬 구간 시작 구간에서 추가 버스트를 넣습니다.",
  sceneStartWindow: "씬 구간 시작 버스트가 유지되는 스크롤 진행 비율입니다.",
  layerEnabled: "이 영역의 글리치를 개별적으로 켜거나 끕니다.",
  layerIntensity: "이 영역에만 적용되는 글리치 강도입니다.",
  rgbShift: "시안·마젠타 RGB 채널 분리(색수차) 강도입니다.",
  sliceStrength: "가로 슬라이스가 밀리는 displacement 강도입니다.",
  scanlineOpacity: "스캔라인·CRT 줄무늬 정도입니다.",
  gritOpacity: "작은 사각 파티클·그레인 노이즈의 양입니다. 글리치가 강할수록 더 많이 보입니다.",
  particleDensity: "전체 화면에 뿌려지는 작은 사각 파티클(정적 노이즈) 밀도입니다. 글리치 강도에 비례해 나타납니다.",
  irregularity: "슬라이스 간격·시드의 불규칙성입니다. 높을수록 파편처럼 보입니다.",
  displace: "3D 메시 표면이 법선 방향으로 튀어나오는 변위량입니다.",
  idleMin: "스크롤 없이 대기할 때 글리치 강도의 하한(설정값 대비 비율)입니다. 기본 30%.",
  idleMax: "대기 중 글리치 강도의 상한(설정값 대비 비율)입니다. 기본 60%. 하한~상한 사이로 맥동합니다.",
  idlePulseSpeed: "대기 글리치가 하한과 상한 사이를 오가는 속도입니다.",
  hoverMultiplier: "오브젝트에 마우스를 올렸을 때 설정 글리치 강도에 곱해지는 배율입니다. 기본 150%.",
  colorAccent: "노이즈 위에 섞이는 메인 액센트 색상입니다.",
  colorFringeA: "슬라이스·프린지에 쓰이는 마젠타 계열 색상입니다.",
  colorFringeB: "RGB 프린지 반대쪽 시안 계열 색상입니다.",
  colorBar: "가로 바 글리치 하이라이트 색상입니다.",
  colorSpeckle: "스펙클·점박이 하이라이트 색상입니다.",
  colorTint: "프로시저럴 노이즈(0)와 액센트 팔레트(1) 사이 블렌드입니다.",
  objectSection: "토러스·GLB 등 3D 메시 실루엣·외곽을 따라 셰이더 글리치가 적용됩니다.",
  flatSection: "MANIFESTO 타이포, Scene Progress·HUD 등 화면 평면 UI 요소에 적용됩니다.",
  screenSection: "3D·UI 위에 깔리는 전체 화면 은은한 노이즈·그릿 레이어입니다.",
  save: "글리치·씬 설정을 브라우저에 저장합니다. 샘플 페이지에도 적용됩니다.",
  reset: "글리치 설정을 Cinematic 프리셋 기본값으로 되돌립니다.",
} as const;

const PRESET_TIPS: Record<Exclude<SynapserGlitchPresetId, "custom">, string> = {
  cinematic: "오브젝트 메시 중심 균형 글리치. 화면은 은은, 타이포는 선명한 RGB 시프트.",
  rupture: "씬 전환 파열감 강조. 오브젝트·평면 UI 모두 격한 불규칙 슬라이스.",
  pulse: "스크롤 속도 맥동형. 빠르게 스크롤할수록 버스트가 자주 올라갑니다.",
  whisper: "가장 절제된 표현. 오브젝트 외곽과 텍스트에만 살짝 스칩니다.",
};

function LayerControls({
  title,
  sectionTip,
  layer,
  onPatch,
  extra,
}: {
  title: string;
  sectionTip: string;
  layer: SynapserGlitchLayerSettings | SynapserGlitchObjectLayer;
  onPatch: (patch: Partial<SynapserGlitchLayerSettings & Partial<SynapserGlitchObjectLayer>>) => void;
  extra?: React.ReactNode;
}) {
  const [open, setOpen] = useState(title === "3D 오브젝트");

  return (
    <TipSection title={title} tip={sectionTip} open={open} onToggle={() => setOpen((v) => !v)}>
      <TipCheckboxRow
        label="영역 활성화"
        tip={TIPS.layerEnabled}
        checked={layer.enabled}
        onChange={(enabled) => onPatch({ enabled })}
      />
      <TipRangeRow
        label="Intensity"
        tip={TIPS.layerIntensity}
        value={layer.intensity}
        min={0}
        max={2}
        step={0.05}
        onChange={(intensity) => onPatch({ intensity })}
      />
      <TipRangeRow
        label="RGB Shift"
        tip={TIPS.rgbShift}
        value={layer.rgbShift}
        min={0}
        max={2}
        step={0.05}
        onChange={(rgbShift) => onPatch({ rgbShift })}
      />
      <TipRangeRow
        label="Slice"
        tip={TIPS.sliceStrength}
        value={layer.sliceStrength}
        min={0}
        max={2}
        step={0.05}
        onChange={(sliceStrength) => onPatch({ sliceStrength })}
      />
      <TipRangeRow
        label="Scanline"
        tip={TIPS.scanlineOpacity}
        value={layer.scanlineOpacity}
        min={0}
        max={1}
        step={0.05}
        onChange={(scanlineOpacity) => onPatch({ scanlineOpacity })}
      />
      <TipRangeRow
        label="Grit"
        tip={TIPS.gritOpacity}
        value={layer.gritOpacity}
        min={0}
        max={1.5}
        step={0.05}
        onChange={(gritOpacity) => onPatch({ gritOpacity })}
      />
      <TipRangeRow
        label="Irregular"
        tip={TIPS.irregularity}
        value={layer.irregularity}
        min={0}
        max={1}
        step={0.05}
        onChange={(irregularity) => onPatch({ irregularity })}
      />
      {extra}
    </TipSection>
  );
}

export default function SynapserScrollGlitchSettings() {
  const {
    scrollGlitch,
    settingsDirty,
    patchScrollGlitch,
    saveSceneSettings,
    resetScrollGlitch,
  } = useSynapserModel();
  const [open, setOpen] = useState(true);

  const patch = (next: Partial<SynapserScrollGlitchSettings>) =>
    patchScrollGlitch({ ...next, preset: "custom" });

  return (
    <div className="rounded-xl border border-[#2a2520] bg-[#14100d]/90 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#ff0066]/80">
            Scroll Glitch
          </p>
          <p className="mt-1 text-sm text-[#f0ebe3]/70">3D · 평면 UI · 전체 화면 분리 설정</p>
          {settingsDirty ? (
            <p className="mt-1 text-xs text-amber-400/80">저장하지 않은 변경 사항이 있습니다.</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <SettingTip tip={TIPS.save}>
            <button
              type="button"
              onClick={saveSceneSettings}
              className="cursor-help rounded-full border border-[#ff0066]/40 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3] transition-colors hover:border-[#ff0066]"
            >
              저장
            </button>
          </SettingTip>
          <SettingTip tip={TIPS.reset}>
            <button
              type="button"
              onClick={resetScrollGlitch}
              className="cursor-help rounded-full border border-[#f0ebe3]/15 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3]/60 transition-colors hover:border-[#f0ebe3]/35"
            >
              기본값
            </button>
          </SettingTip>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-4 flex w-full items-center justify-between border-t border-[#2a2520] pt-3 text-left text-xs uppercase tracking-wider text-[#f0ebe3]/70"
      >
        글리치 설정
        <span className="text-[#c9a66b]/60">{open ? "−" : "+"}</span>
      </button>

      {open ? (
        <div className="mt-3 space-y-3">
          <TipField label="Preset" tip={TIPS.preset}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SYNAPSER_GLITCH_PRESET_OPTIONS.map((preset) => (
                <SettingTip key={preset.id} tip={PRESET_TIPS[preset.id]} className="block w-full">
                  <button
                    type="button"
                    onClick={() => patchScrollGlitch(applySynapserGlitchPreset(preset.id))}
                    className={`w-full cursor-help rounded-lg border px-2 py-2 text-left transition-colors ${
                      scrollGlitch.preset === preset.id
                        ? "border-[#ff0066]/60 bg-[#ff0066]/10"
                        : "border-[#2a2520] bg-[#0f0c0a] hover:border-[#f0ebe3]/25"
                    }`}
                  >
                    <span className="block text-[11px] font-medium text-[#f0ebe3]">{preset.label}</span>
                    <span className="mt-0.5 block text-[10px] leading-snug text-[#f0ebe3]/40">
                      {preset.description}
                    </span>
                  </button>
                </SettingTip>
              ))}
            </div>
            {scrollGlitch.preset === "custom" ? (
              <p className="mt-1.5 text-[10px] text-[#c9a66b]/70">Custom — 수동 조정 중</p>
            ) : null}
          </TipField>

          <TipCheckboxRow
            label="스크롤 글리치 활성화"
            tip={TIPS.enabled}
            checked={scrollGlitch.enabled}
            onChange={(enabled) => patchScrollGlitch({ enabled })}
          />
          <TipRangeRow
            label="Master"
            tip={TIPS.masterIntensity}
            value={scrollGlitch.masterIntensity}
            min={0}
            max={1.5}
            step={0.05}
            onChange={(masterIntensity) => patch({ masterIntensity })}
          />
          <TipRangeRow
            label="Decay"
            tip={TIPS.decay}
            value={scrollGlitch.decayRate}
            min={0.8}
            max={0.98}
            step={0.01}
            onChange={(decayRate) => patch({ decayRate })}
          />
          <TipRangeRow
            label="Scroll Sens."
            tip={TIPS.scrollSensitivity}
            value={scrollGlitch.scrollSensitivity}
            min={0}
            max={3}
            step={0.1}
            onChange={(scrollSensitivity) => patch({ scrollSensitivity })}
          />
          <TipCheckboxRow
            label="씬 전환 시 버스트"
            tip={TIPS.burstOnSceneChange}
            checked={scrollGlitch.burstOnSceneChange}
            onChange={(burstOnSceneChange) => patch({ burstOnSceneChange })}
          />
          <TipCheckboxRow
            label="씬 구간 시작 버스트"
            tip={TIPS.burstAtSceneStart}
            checked={scrollGlitch.burstAtSceneStart}
            onChange={(burstAtSceneStart) => patch({ burstAtSceneStart })}
          />
          <TipRangeRow
            label="Start Window"
            tip={TIPS.sceneStartWindow}
            value={scrollGlitch.sceneStartWindow}
            min={0.02}
            max={0.25}
            step={0.01}
            onChange={(sceneStartWindow) => patch({ sceneStartWindow })}
          />

          <LayerControls
            title="3D 오브젝트"
            sectionTip={TIPS.objectSection}
            layer={scrollGlitch.object}
            onPatch={(next) => patch({ object: { ...scrollGlitch.object, ...next } })}
            extra={
              <>
                <TipRangeRow
                  label="Displace"
                  tip={TIPS.displace}
                  value={scrollGlitch.object.displace}
                  min={0.5}
                  max={4.5}
                  step={0.1}
                  onChange={(displace) => patch({ object: { ...scrollGlitch.object, displace } })}
                />
                <TipRangeRow
                  label="Idle Min"
                  tip={TIPS.idleMin}
                  value={scrollGlitch.object.idleMin}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(idleMin) =>
                    patch({
                      object: {
                        ...scrollGlitch.object,
                        idleMin: Math.min(idleMin, scrollGlitch.object.idleMax),
                      },
                    })
                  }
                />
                <TipRangeRow
                  label="Idle Max"
                  tip={TIPS.idleMax}
                  value={scrollGlitch.object.idleMax}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(idleMax) =>
                    patch({
                      object: {
                        ...scrollGlitch.object,
                        idleMax: Math.max(idleMax, scrollGlitch.object.idleMin),
                      },
                    })
                  }
                />
                <TipRangeRow
                  label="Idle Pulse"
                  tip={TIPS.idlePulseSpeed}
                  value={scrollGlitch.object.idlePulseSpeed}
                  min={0.1}
                  max={3}
                  step={0.05}
                  onChange={(idlePulseSpeed) =>
                    patch({ object: { ...scrollGlitch.object, idlePulseSpeed } })
                  }
                />
                <TipRangeRow
                  label="Hover ×"
                  tip={TIPS.hoverMultiplier}
                  value={scrollGlitch.object.hoverMultiplier}
                  min={1}
                  max={3}
                  step={0.05}
                  onChange={(hoverMultiplier) =>
                    patch({ object: { ...scrollGlitch.object, hoverMultiplier } })
                  }
                />
                <TipRangeRow
                  label="Color Tint"
                  tip={TIPS.colorTint}
                  value={scrollGlitch.object.colorTint}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(colorTint) => patch({ object: { ...scrollGlitch.object, colorTint } })}
                />
                <div className="flex flex-wrap items-end gap-3">
                  <TipColorField
                    inline
                    label="Accent"
                    tip={TIPS.colorAccent}
                    value={scrollGlitch.object.colorAccent}
                    onChange={(colorAccent) =>
                      patch({ object: { ...scrollGlitch.object, colorAccent } })
                    }
                  />
                  <TipColorField
                    inline
                    label="Fringe A"
                    tip={TIPS.colorFringeA}
                    value={scrollGlitch.object.colorFringeA}
                    onChange={(colorFringeA) =>
                      patch({ object: { ...scrollGlitch.object, colorFringeA } })
                    }
                  />
                  <TipColorField
                    inline
                    label="Fringe B"
                    tip={TIPS.colorFringeB}
                    value={scrollGlitch.object.colorFringeB}
                    onChange={(colorFringeB) =>
                      patch({ object: { ...scrollGlitch.object, colorFringeB } })
                    }
                  />
                  <TipColorField
                    inline
                    label="Bar"
                    tip={TIPS.colorBar}
                    value={scrollGlitch.object.colorBar}
                    onChange={(colorBar) => patch({ object: { ...scrollGlitch.object, colorBar } })}
                  />
                  <TipColorField
                    inline
                    label="Speckle"
                    tip={TIPS.colorSpeckle}
                    value={scrollGlitch.object.colorSpeckle}
                    onChange={(colorSpeckle) =>
                      patch({ object: { ...scrollGlitch.object, colorSpeckle } })
                    }
                  />
                </div>
              </>
            }
          />

          <LayerControls
            title="평면 UI · 텍스트"
            sectionTip={TIPS.flatSection}
            layer={scrollGlitch.flat}
            onPatch={(next) => patch({ flat: { ...scrollGlitch.flat, ...next } })}
          />

          <LayerControls
            title="전체 화면"
            sectionTip={TIPS.screenSection}
            layer={scrollGlitch.screen}
            onPatch={(next) => patch({ screen: { ...scrollGlitch.screen, ...next } })}
            extra={
              <TipRangeRow
                label="Particles"
                tip={TIPS.particleDensity}
                value={scrollGlitch.screen.particleDensity}
                min={0}
                max={1.5}
                step={0.05}
                onChange={(particleDensity) =>
                  patch({ screen: { ...scrollGlitch.screen, particleDensity } })
                }
              />
            }
          />
        </div>
      ) : null}
    </div>
  );
}
