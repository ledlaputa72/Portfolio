"use client";

import { useEffect, useState } from "react";
import { useSynapserModel } from "./SynapserModelContext";
import SynapserColorPicker from "./SynapserColorPicker";
import SynapserAnchorPicker from "./SynapserAnchorPicker";
import {
  SettingTip,
  TipCheckboxRow,
  TipField,
  TipRangeRow,
  TipSection,
} from "./SynapserSettingControls";
import { SCENE_SETTING_TIPS } from "./synapser-setting-tips";
import { useLocale } from "@/i18n/LocaleProvider";
import {
  MAX_SCENE_LIGHTS,
  type SynapserCameraKeyframe,
  type SynapserLightConfig,
  type SynapserSceneSettings,
  type CinematicEasing,
  type Vec3,
} from "@/lib/synapser-scene-settings";

type SynapserSceneSettingsPanelProps = {
  compact?: boolean;
};

function ColorField({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  return <SynapserColorPicker value={value} onChange={onChange} />;
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 0.01,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-md border border-[#2a2520] bg-[#0f0c0a] px-2 py-1.5 text-xs text-[#f0ebe3]"
    />
  );
}

function Vec3Input({ value, onChange }: { value: Vec3; onChange: (v: Vec3) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {(["X", "Y", "Z"] as const).map((axis, i) => (
        <label key={axis} className="text-[10px] text-[#f0ebe3]/40">
          {axis}
          <input
            type="number"
            step={0.1}
            value={value[i]}
            onChange={(e) => {
              const next = [...value] as Vec3;
              next[i] = Number(e.target.value);
              onChange(next);
            }}
            className="mt-0.5 w-full rounded-md border border-[#2a2520] bg-[#0f0c0a] px-2 py-1 text-xs text-[#f0ebe3]"
          />
        </label>
      ))}
    </div>
  );
}

function KeyframeEditor({
  keyframes,
  onChange,
}: {
  keyframes: SynapserCameraKeyframe[];
  onChange: (keyframes: SynapserCameraKeyframe[]) => void;
}) {
  const { locale } = useLocale();
  const update = (index: number, patch: Partial<SynapserCameraKeyframe>) => {
    const next = keyframes.map((kf, i) => (i === index ? { ...kf, ...patch } : kf));
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {keyframes.map((kf, index) => (
        <div key={index} className="rounded-lg border border-[#2a2520] bg-[#0f0c0a]/60 p-3">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-[#c9a66b]/70">
            Keyframe {index + 1}
          </p>
          <div className="space-y-2">
            <TipField label="At (0–1)" tip={SCENE_SETTING_TIPS.keyframeAt[locale]}>
              <NumberInput value={kf.at} min={0} max={1} step={0.01} onChange={(v) => update(index, { at: v })} />
            </TipField>
            <TipField label="Position" tip={SCENE_SETTING_TIPS.keyframePosition[locale]}>
              <Vec3Input value={kf.position} onChange={(position) => update(index, { position })} />
            </TipField>
            <TipField label="Look At" tip={SCENE_SETTING_TIPS.keyframeLookAt[locale]}>
              <Vec3Input value={kf.lookAt} onChange={(lookAt) => update(index, { lookAt })} />
            </TipField>
            <TipField label="FOV" tip={SCENE_SETTING_TIPS.keyframeFov[locale]}>
              <NumberInput value={kf.fov} min={20} max={90} step={1} onChange={(fov) => update(index, { fov })} />
            </TipField>
          </div>
          {keyframes.length > 2 ? (
            <button
              type="button"
              onClick={() => onChange(keyframes.filter((_, i) => i !== index))}
              className="mt-2 text-[10px] text-red-400/70 hover:text-red-400"
            >
              {locale === "ko" ? "삭제" : "Delete"}
            </button>
          ) : null}
        </div>
      ))}
      {keyframes.length < 5 ? (
        <button
          type="button"
          onClick={() =>
            onChange([
              ...keyframes,
              {
                at: 1,
                position: [...keyframes[keyframes.length - 1].position] as Vec3,
                lookAt: [...keyframes[keyframes.length - 1].lookAt] as Vec3,
                fov: keyframes[keyframes.length - 1].fov,
              },
            ])
          }
          className="text-[10px] uppercase tracking-wider text-[#6b8cce]/80 hover:text-[#6b8cce]"
        >
          {locale === "ko" ? "+ 키프레임 추가" : "+ Add keyframe"}
        </button>
      ) : null}
    </div>
  );
}

function LightEditor({
  lights,
  onChange,
}: {
  lights: SynapserLightConfig[];
  onChange: (lights: SynapserLightConfig[]) => void;
}) {
  const { locale } = useLocale();
  const updateLight = (index: number, patch: Partial<SynapserLightConfig>) => {
    onChange(lights.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const addLight = () => {
    if (lights.length >= MAX_SCENE_LIGHTS) return;
    onChange([
      ...lights,
      {
        enabled: true,
        type: "point",
        intensity: 0.5,
        color: "#ffffff",
        position: [0, 2, 2],
      },
    ]);
  };

  return (
    <div className="space-y-3">
      {lights.map((light, index) => (
        <div key={index} className="rounded-lg border border-[#2a2520] bg-[#0f0c0a]/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider text-[#c9a66b]/70">Light {index + 1}</p>
            <TipCheckboxRow
              label="On"
              tip={SCENE_SETTING_TIPS.lightEnabled[locale]}
              checked={light.enabled}
              onChange={(enabled) => updateLight(index, { enabled })}
            />
          </div>
          <div className="space-y-2">
            <TipField label="Type" tip={SCENE_SETTING_TIPS.lightType[locale]}>
              <select
                value={light.type}
                onChange={(e) => updateLight(index, { type: e.target.value as SynapserLightConfig["type"] })}
                className="w-full rounded-md border border-[#2a2520] bg-[#0f0c0a] px-2 py-1.5 text-xs text-[#f0ebe3]"
              >
                <option value="directional">Directional</option>
                <option value="point">Point</option>
                <option value="spot">Spot</option>
              </select>
            </TipField>
            <TipRangeRow
              label="Intensity"
              tip={SCENE_SETTING_TIPS.lightIntensity[locale]}
              labelWidth="w-28"
              value={light.intensity}
              min={0}
              max={3}
              step={0.05}
              onChange={(intensity) => updateLight(index, { intensity })}
            />
            <TipField label="Color" tip={SCENE_SETTING_TIPS.lightColor[locale]}>
              <ColorField
                value={light.color}
                onChange={(color) => updateLight(index, { color })}
              />
            </TipField>
            <TipField label="Position" tip={SCENE_SETTING_TIPS.lightPosition[locale]}>
              <Vec3Input value={light.position} onChange={(position) => updateLight(index, { position })} />
            </TipField>
          </div>
          {lights.length > 1 ? (
            <button
              type="button"
              onClick={() => onChange(lights.filter((_, i) => i !== index))}
              className="mt-2 text-[10px] text-red-400/70 hover:text-red-400"
            >
              {locale === "ko" ? "삭제" : "Delete"}
            </button>
          ) : null}
        </div>
      ))}
      {lights.length < MAX_SCENE_LIGHTS ? (
        <button
          type="button"
          onClick={addLight}
          className="text-[10px] uppercase tracking-wider text-[#6b8cce]/80 hover:text-[#6b8cce]"
        >
          {locale === "ko" ? "+ 조명 추가" : "+ Add light"}
        </button>
      ) : null}
    </div>
  );
}

export default function SynapserSceneSettingsPanel({ compact = false }: SynapserSceneSettingsPanelProps) {
  const {
    selectedScene,
    sceneList,
    activeSceneSettings: s,
    settingsDirty,
    loading,
    patchSceneSettings,
    saveSceneSettings,
    resetSceneSettings,
  } = useSynapserModel();
  const { locale } = useLocale();

  const [open, setOpen] = useState({
    lighting: !compact,
    background: false,
    motion: false,
    objectLayout: !compact,
    scrollZoom: false,
    camera: false,
    cameraAnim: false,
    typography: !compact,
  });

  const patch = (next: Partial<SynapserSceneSettings>) => patchSceneSettings(selectedScene, next);
  const sceneLabel = sceneList.find((sc) => sc.id === selectedScene)?.label ?? selectedScene;

  const toggle = (key: keyof typeof open) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div
      className={`rounded-xl border border-[#2a2520] bg-[#14100d]/90 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#6b8cce]/80">
            Scene Settings
          </p>
          <p className="mt-1 text-sm text-[#f0ebe3]/70">
            {sceneLabel}
            {locale === "ko" ? " 씬 조명 · 배경 · 카메라" : " scene · lighting · background · camera"}
          </p>
          {settingsDirty ? (
            <p className="mt-1 text-xs text-amber-400/80">
              {locale === "ko" ? "저장하지 않은 변경 사항이 있습니다." : "You have unsaved changes."}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <SettingTip tip={SCENE_SETTING_TIPS.save[locale]}>
            <button
              type="button"
              disabled={loading}
              onClick={saveSceneSettings}
              className="cursor-help rounded-full border border-[#6b8cce]/40 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3] transition-colors hover:border-[#6b8cce] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {locale === "ko" ? "저장" : "Save"}
            </button>
          </SettingTip>
          <SettingTip tip={SCENE_SETTING_TIPS.reset[locale]}>
            <button
              type="button"
              onClick={() => resetSceneSettings(selectedScene)}
              className="cursor-help rounded-full border border-[#f0ebe3]/15 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3]/60 transition-colors hover:border-[#f0ebe3]/35"
            >
              {locale === "ko" ? "기본값" : "Default"}
            </button>
          </SettingTip>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <TipSection
          title={locale === "ko" ? "조명 (Lighting)" : "Lighting"}
          tip={SCENE_SETTING_TIPS.sectionLighting[locale]}
          open={open.lighting}
          onToggle={() => toggle("lighting")}
        >
          <TipRangeRow
            label="Ambient"
            tip={SCENE_SETTING_TIPS.ambient[locale]}
            labelWidth="w-28"
            value={s.lighting.ambientIntensity}
            min={0}
            max={2}
            step={0.05}
            onChange={(ambientIntensity) => patch({ lighting: { ...s.lighting, ambientIntensity } })}
          />
          <TipField label="Ambient Color" tip={SCENE_SETTING_TIPS.ambientColor[locale]}>
            <ColorField
              value={s.lighting.ambientColor}
              onChange={(ambientColor) => patch({ lighting: { ...s.lighting, ambientColor } })}
            />
          </TipField>
          <LightEditor
            lights={s.lighting.lights}
            onChange={(lights) => patch({ lighting: { ...s.lighting, lights } })}
          />
        </TipSection>

        <TipSection
          title={locale === "ko" ? "배경 (Background)" : "Background"}
          tip={SCENE_SETTING_TIPS.sectionBackground[locale]}
          open={open.background}
          onToggle={() => toggle("background")}
        >
          <TipField label="Canvas Color" tip={SCENE_SETTING_TIPS.canvasColor[locale]}>
            <ColorField
              value={s.background.canvasColor}
              onChange={(canvasColor) => patch({ background: { ...s.background, canvasColor } })}
            />
          </TipField>
          <TipCheckboxRow
            label={locale === "ko" ? "Fog 활성화" : "Enable fog"}
            tip={SCENE_SETTING_TIPS.fogEnabled[locale]}
            checked={s.background.fogEnabled}
            onChange={(fogEnabled) => patch({ background: { ...s.background, fogEnabled } })}
          />
          <TipField label="Fog Color" tip={SCENE_SETTING_TIPS.fogColor[locale]}>
            <ColorField
              value={s.background.fogColor}
              onChange={(fogColor) => patch({ background: { ...s.background, fogColor } })}
            />
          </TipField>
          <TipRangeRow
            label="Fog Near"
            tip={SCENE_SETTING_TIPS.fogNear[locale]}
            labelWidth="w-28"
            value={s.background.fogNear}
            min={0}
            max={20}
            step={0.5}
            onChange={(fogNear) => patch({ background: { ...s.background, fogNear } })}
          />
          <TipRangeRow
            label="Fog Far"
            tip={SCENE_SETTING_TIPS.fogFar[locale]}
            labelWidth="w-28"
            value={s.background.fogFar}
            min={4}
            max={40}
            step={0.5}
            onChange={(fogFar) => patch({ background: { ...s.background, fogFar } })}
          />
          <TipCheckboxRow
            label={locale === "ko" ? "바닥 표시" : "Show floor"}
            tip={SCENE_SETTING_TIPS.floorVisible[locale]}
            checked={s.background.floorVisible}
            onChange={(floorVisible) => patch({ background: { ...s.background, floorVisible } })}
          />
          <TipField label="Floor Color" tip={SCENE_SETTING_TIPS.floorColor[locale]}>
            <ColorField
              value={s.background.floorColor}
              onChange={(floorColor) => patch({ background: { ...s.background, floorColor } })}
            />
          </TipField>
          <TipRangeRow
            label="Floor Y"
            tip={SCENE_SETTING_TIPS.floorY[locale]}
            labelWidth="w-28"
            value={s.background.floorY}
            min={-5}
            max={0}
            step={0.1}
            onChange={(floorY) => patch({ background: { ...s.background, floorY } })}
          />
        </TipSection>

        <TipSection
          title={locale === "ko" ? "오브젝트 움직임 (Motion)" : "Motion"}
          tip={SCENE_SETTING_TIPS.sectionMotion[locale]}
          open={open.motion}
          onToggle={() => toggle("motion")}
        >
          <TipCheckboxRow
            label={locale === "ko" ? "Float 활성화" : "Enable Float"}
            tip={SCENE_SETTING_TIPS.floatEnabled[locale]}
            checked={s.objectMotion.floatEnabled}
            onChange={(floatEnabled) => patch({ objectMotion: { ...s.objectMotion, floatEnabled } })}
          />
          <TipRangeRow
            label="Float Speed"
            tip={SCENE_SETTING_TIPS.floatSpeed[locale]}
            labelWidth="w-28"
            value={s.objectMotion.floatSpeed}
            min={0}
            max={1}
            step={0.01}
            onChange={(floatSpeed) => patch({ objectMotion: { ...s.objectMotion, floatSpeed } })}
          />
          <TipRangeRow
            label="Rotation"
            tip={SCENE_SETTING_TIPS.rotationIntensity[locale]}
            labelWidth="w-28"
            value={s.objectMotion.rotationIntensity}
            min={0}
            max={1}
            step={0.01}
            onChange={(rotationIntensity) => patch({ objectMotion: { ...s.objectMotion, rotationIntensity } })}
          />
          <TipRangeRow
            label="Float Amp"
            tip={SCENE_SETTING_TIPS.floatIntensity[locale]}
            labelWidth="w-28"
            value={s.objectMotion.floatIntensity}
            min={0}
            max={1}
            step={0.01}
            onChange={(floatIntensity) => patch({ objectMotion: { ...s.objectMotion, floatIntensity } })}
          />
          <TipRangeRow
            label="Auto Rot X"
            tip={SCENE_SETTING_TIPS.autoRotateX[locale]}
            labelWidth="w-28"
            value={s.objectMotion.autoRotateX}
            min={0}
            max={1}
            step={0.01}
            onChange={(autoRotateX) => patch({ objectMotion: { ...s.objectMotion, autoRotateX } })}
          />
          <TipRangeRow
            label="Auto Rot Y"
            tip={SCENE_SETTING_TIPS.autoRotateY[locale]}
            labelWidth="w-28"
            value={s.objectMotion.autoRotateY}
            min={0}
            max={1}
            step={0.01}
            onChange={(autoRotateY) => patch({ objectMotion: { ...s.objectMotion, autoRotateY } })}
          />
          <TipRangeRow
            label="Auto Rot Z"
            tip={SCENE_SETTING_TIPS.autoRotateZ[locale]}
            labelWidth="w-28"
            value={s.objectMotion.autoRotateZ}
            min={0}
            max={1}
            step={0.01}
            onChange={(autoRotateZ) => patch({ objectMotion: { ...s.objectMotion, autoRotateZ } })}
          />
          <TipRangeRow
            label="Pointer Tilt X"
            tip={SCENE_SETTING_TIPS.pointerTiltX[locale]}
            labelWidth="w-28"
            value={s.objectMotion.pointerTiltX}
            min={0}
            max={0.1}
            step={0.001}
            onChange={(pointerTiltX) => patch({ objectMotion: { ...s.objectMotion, pointerTiltX } })}
          />
          <TipRangeRow
            label="Pointer Tilt Y"
            tip={SCENE_SETTING_TIPS.pointerTiltY[locale]}
            labelWidth="w-28"
            value={s.objectMotion.pointerTiltY}
            min={0}
            max={0.1}
            step={0.001}
            onChange={(pointerTiltY) => patch({ objectMotion: { ...s.objectMotion, pointerTiltY } })}
          />
          <TipRangeRow
            label="Hover Zoom"
            tip={SCENE_SETTING_TIPS.hoverZoomPull[locale]}
            labelWidth="w-28"
            value={s.camera.hoverZoomPull}
            min={-1}
            max={1}
            step={0.02}
            onChange={(hoverZoomPull) => patch({ camera: { ...s.camera, hoverZoomPull } })}
          />
          <TipRangeRow
            label="Hover FOV"
            tip={SCENE_SETTING_TIPS.hoverZoomFovPull[locale]}
            labelWidth="w-28"
            value={s.camera.hoverZoomFovPull}
            min={0}
            max={12}
            step={0.25}
            onChange={(hoverZoomFovPull) => patch({ camera: { ...s.camera, hoverZoomFovPull } })}
          />
          <TipRangeRow
            label="Hover Damp"
            tip={SCENE_SETTING_TIPS.hoverZoomDamp[locale]}
            labelWidth="w-28"
            value={s.camera.hoverZoomDamp}
            min={1}
            max={20}
            step={0.5}
            onChange={(hoverZoomDamp) => patch({ camera: { ...s.camera, hoverZoomDamp } })}
          />
          <TipField label="Group Offset" tip={SCENE_SETTING_TIPS.groupOffset[locale]}>
            <Vec3Input
              value={s.objectMotion.groupOffset}
              onChange={(groupOffset) => patch({ objectMotion: { ...s.objectMotion, groupOffset } })}
            />
          </TipField>
          <TipRangeRow
            label="Group Scale"
            tip={SCENE_SETTING_TIPS.groupScale[locale]}
            labelWidth="w-28"
            value={s.objectMotion.groupScale}
            min={0.25}
            max={3}
            step={0.05}
            onChange={(groupScale) => patch({ objectMotion: { ...s.objectMotion, groupScale } })}
          />
        </TipSection>

        <TipSection
          title={locale === "ko" ? "3D 오브젝트 (Object)" : "3D Object"}
          tip={SCENE_SETTING_TIPS.sectionObject[locale]}
          open={open.objectLayout}
          onToggle={() => toggle("objectLayout")}
        >
          <SynapserAnchorPicker
            value={s.objectMotion.anchor}
            onChange={(anchor) => patch({ objectMotion: { ...s.objectMotion, anchor } })}
            alignXTip={SCENE_SETTING_TIPS.objectAnchor[locale]}
            alignYTip={SCENE_SETTING_TIPS.objectAnchor[locale]}
          />
        </TipSection>

        <TipSection
          title={locale === "ko" ? "스크롤 줌 전환 (Scroll Zoom)" : "Scroll Zoom"}
          tip={SCENE_SETTING_TIPS.sectionScrollZoom[locale]}
          open={open.scrollZoom}
          onToggle={() => toggle("scrollZoom")}
        >
          <TipCheckboxRow
            label={locale === "ko" ? "시네마틱 줌" : "Cinematic zoom"}
            tip={SCENE_SETTING_TIPS.cinematicEnabled[locale]}
            checked={s.cinematicScroll.enabled}
            onChange={(enabled) => patch({ cinematicScroll: { ...s.cinematicScroll, enabled } })}
          />
          <TipRangeRow
            label={locale === "ko" ? "원경 거리" : "Far distance"}
            tip={SCENE_SETTING_TIPS.cinematicDistanceFar[locale]}
            labelWidth="w-28"
            value={s.cinematicScroll.distanceFar}
            min={2}
            max={24}
            step={0.5}
            onChange={(distanceFar) => patch({ cinematicScroll: { ...s.cinematicScroll, distanceFar } })}
          />
          <TipRangeRow
            label={locale === "ko" ? "근접 거리" : "Near distance"}
            tip={SCENE_SETTING_TIPS.cinematicDistanceNear[locale]}
            labelWidth="w-28"
            value={s.cinematicScroll.distanceNear}
            min={1}
            max={16}
            step={0.25}
            onChange={(distanceNear) => patch({ cinematicScroll: { ...s.cinematicScroll, distanceNear } })}
          />

          <p className="pt-2 font-mono text-[9px] uppercase tracking-[0.25em] text-[#c9a66b]/70">
            {locale === "ko" ? "스크롤 줌 인" : "Scroll zoom in"}
          </p>
          <TipRangeRow
            label={locale === "ko" ? "시작 %" : "Start %"}
            tip={SCENE_SETTING_TIPS.zoomInStart[locale]}
            labelWidth="w-28"
            value={Math.round(s.cinematicScroll.autoZoomIn.start * 100)}
            min={0}
            max={50}
            step={1}
            onChange={(v) =>
              patch({
                cinematicScroll: {
                  ...s.cinematicScroll,
                  autoZoomIn: { ...s.cinematicScroll.autoZoomIn, start: v / 100 },
                },
              })
            }
          />
          <TipRangeRow
            label={locale === "ko" ? "끝 %" : "End %"}
            tip={SCENE_SETTING_TIPS.zoomInEnd[locale]}
            labelWidth="w-28"
            value={Math.round(s.cinematicScroll.autoZoomIn.end * 100)}
            min={5}
            max={60}
            step={1}
            onChange={(v) =>
              patch({
                cinematicScroll: {
                  ...s.cinematicScroll,
                  autoZoomIn: { ...s.cinematicScroll.autoZoomIn, end: v / 100 },
                },
              })
            }
          />
          <TipField label={locale === "ko" ? "모션" : "Motion"} tip={SCENE_SETTING_TIPS.zoomInEasing[locale]}>
            <select
              value={s.cinematicScroll.autoZoomIn.easing}
              onChange={(e) =>
                patch({
                  cinematicScroll: {
                    ...s.cinematicScroll,
                    autoZoomIn: {
                      ...s.cinematicScroll.autoZoomIn,
                      easing: e.target.value as CinematicEasing,
                    },
                  },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#2a2520] bg-[#0f0c0a] px-3 py-2 text-sm text-[#f0ebe3] outline-none transition-colors focus:border-[#c9a66b]/50"
            >
              <option value="linear">{locale === "ko" ? "직선 (균일)" : "Linear (uniform)"}</option>
              <option value="ease-in">{locale === "ko" ? "완만히 시작 · 빠르게 끝" : "Ease in (slow start · fast end)"}</option>
              <option value="ease-out">{locale === "ko" ? "빠르게 시작 · 완만히 끝" : "Ease out (fast start · slow end)"}</option>
            </select>
          </TipField>

          <p className="pt-2 font-mono text-[9px] uppercase tracking-[0.25em] text-[#c9a66b]/70">
            {locale === "ko" ? "스크롤 회전" : "Scroll rotation"}
          </p>
          <TipRangeRow
            label={locale === "ko" ? "회전 (바퀴)" : "Rotation (turns)"}
            tip={SCENE_SETTING_TIPS.scrollRotationRevolutions[locale]}
            labelWidth="w-28"
            value={s.cinematicScroll.scrollRotation.revolutions}
            min={0}
            max={8}
            step={0.25}
            onChange={(revolutions) =>
              patch({
                cinematicScroll: {
                  ...s.cinematicScroll,
                  scrollRotation: { ...s.cinematicScroll.scrollRotation, revolutions },
                },
              })
            }
          />
          <TipField label={locale === "ko" ? "모션" : "Motion"} tip={SCENE_SETTING_TIPS.scrollRotationEasing[locale]}>
            <select
              value={s.cinematicScroll.scrollRotation.easing}
              onChange={(e) =>
                patch({
                  cinematicScroll: {
                    ...s.cinematicScroll,
                    scrollRotation: {
                      ...s.cinematicScroll.scrollRotation,
                      easing: e.target.value as CinematicEasing,
                    },
                  },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#2a2520] bg-[#0f0c0a] px-3 py-2 text-sm text-[#f0ebe3] outline-none transition-colors focus:border-[#c9a66b]/50"
            >
              <option value="linear">{locale === "ko" ? "직선 (균일)" : "Linear (uniform)"}</option>
              <option value="ease-in">{locale === "ko" ? "완만히 시작 · 빠르게 끝" : "Ease in (slow start · fast end)"}</option>
              <option value="ease-out">{locale === "ko" ? "빠르게 시작 · 완만히 끝" : "Ease out (fast start · slow end)"}</option>
            </select>
          </TipField>

          <p className="pt-2 font-mono text-[9px] uppercase tracking-[0.25em] text-[#c9a66b]/70">
            {locale === "ko" ? "스크롤 줌 아웃" : "Scroll zoom out"}
          </p>
          <TipRangeRow
            label={locale === "ko" ? "시작 %" : "Start %"}
            tip={SCENE_SETTING_TIPS.zoomOutStart[locale]}
            labelWidth="w-28"
            value={Math.round(s.cinematicScroll.autoZoomOut.start * 100)}
            min={40}
            max={95}
            step={1}
            onChange={(v) =>
              patch({
                cinematicScroll: {
                  ...s.cinematicScroll,
                  autoZoomOut: { ...s.cinematicScroll.autoZoomOut, start: v / 100 },
                },
              })
            }
          />
          <TipRangeRow
            label={locale === "ko" ? "끝 %" : "End %"}
            tip={SCENE_SETTING_TIPS.zoomOutEnd[locale]}
            labelWidth="w-28"
            value={Math.round(s.cinematicScroll.autoZoomOut.end * 100)}
            min={80}
            max={100}
            step={1}
            onChange={(v) =>
              patch({
                cinematicScroll: {
                  ...s.cinematicScroll,
                  autoZoomOut: { ...s.cinematicScroll.autoZoomOut, end: v / 100 },
                },
              })
            }
          />
          <TipField label={locale === "ko" ? "모션" : "Motion"} tip={SCENE_SETTING_TIPS.zoomOutEasing[locale]}>
            <select
              value={s.cinematicScroll.autoZoomOut.easing}
              onChange={(e) =>
                patch({
                  cinematicScroll: {
                    ...s.cinematicScroll,
                    autoZoomOut: {
                      ...s.cinematicScroll.autoZoomOut,
                      easing: e.target.value as CinematicEasing,
                    },
                  },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#2a2520] bg-[#0f0c0a] px-3 py-2 text-sm text-[#f0ebe3] outline-none transition-colors focus:border-[#c9a66b]/50"
            >
              <option value="linear">{locale === "ko" ? "직선 (균일)" : "Linear (uniform)"}</option>
              <option value="ease-in">{locale === "ko" ? "완만히 시작 · 빠르게 끝" : "Ease in (slow start · fast end)"}</option>
              <option value="ease-out">{locale === "ko" ? "빠르게 시작 · 완만히 끝" : "Ease out (fast start · slow end)"}</option>
            </select>
          </TipField>
        </TipSection>

        <TipSection
          title={locale === "ko" ? "카메라 (Camera)" : "Camera"}
          tip={SCENE_SETTING_TIPS.sectionCamera[locale]}
          open={open.camera}
          onToggle={() => toggle("camera")}
        >
          <TipRangeRow
            label="FOV"
            tip={SCENE_SETTING_TIPS.fov[locale]}
            labelWidth="w-28"
            value={s.camera.fov}
            min={20}
            max={90}
            step={1}
            onChange={(fov) => patch({ camera: { ...s.camera, fov } })}
          />
          <TipField label="Position" tip={SCENE_SETTING_TIPS.cameraPosition[locale]}>
            <Vec3Input
              value={s.camera.position}
              onChange={(position) => patch({ camera: { ...s.camera, position } })}
            />
          </TipField>
          <TipField label="Look At" tip={SCENE_SETTING_TIPS.cameraLookAt[locale]}>
            <Vec3Input
              value={s.camera.lookAt}
              onChange={(lookAt) => patch({ camera: { ...s.camera, lookAt } })}
            />
          </TipField>
          <TipRangeRow
            label="Orbit X"
            tip={SCENE_SETTING_TIPS.pointerDriftX[locale]}
            labelWidth="w-28"
            value={s.camera.pointerDriftX}
            min={0}
            max={2}
            step={0.05}
            onChange={(pointerDriftX) => patch({ camera: { ...s.camera, pointerDriftX } })}
          />
          <TipRangeRow
            label="Orbit Y"
            tip={SCENE_SETTING_TIPS.pointerDriftY[locale]}
            labelWidth="w-28"
            value={s.camera.pointerDriftY}
            min={0}
            max={2}
            step={0.05}
            onChange={(pointerDriftY) => patch({ camera: { ...s.camera, pointerDriftY } })}
          />
          <TipRangeRow
            label="Orbit Damp"
            tip={SCENE_SETTING_TIPS.orbitDamp[locale]}
            labelWidth="w-28"
            value={s.camera.orbitDamp}
            min={1}
            max={20}
            step={0.5}
            onChange={(orbitDamp) => patch({ camera: { ...s.camera, orbitDamp } })}
          />
          <TipRangeRow
            label="Orbit Edge"
            tip={SCENE_SETTING_TIPS.orbitEdgePower[locale]}
            labelWidth="w-28"
            value={s.camera.orbitEdgePower}
            min={0.4}
            max={1.2}
            step={0.02}
            onChange={(orbitEdgePower) => patch({ camera: { ...s.camera, orbitEdgePower } })}
          />
          <TipRangeRow
            label="Near"
            tip={SCENE_SETTING_TIPS.near[locale]}
            labelWidth="w-28"
            value={s.camera.near}
            min={0.01}
            max={5}
            step={0.01}
            onChange={(near) => patch({ camera: { ...s.camera, near } })}
          />
          <TipRangeRow
            label="Far"
            tip={SCENE_SETTING_TIPS.far[locale]}
            labelWidth="w-28"
            value={s.camera.far}
            min={10}
            max={500}
            step={1}
            onChange={(far) => patch({ camera: { ...s.camera, far } })}
          />
        </TipSection>

        <TipSection
          title={locale === "ko" ? "타이틀 그룹 (Typography)" : "Typography"}
          tip={SCENE_SETTING_TIPS.sectionTypography[locale]}
          open={open.typography}
          onToggle={() => toggle("typography")}
        >
          <SynapserAnchorPicker
            value={s.typography}
            onChange={(typography) => patch({ typography })}
            alignXTip={SCENE_SETTING_TIPS.typographyAlignX[locale]}
            alignYTip={SCENE_SETTING_TIPS.typographyAlignY[locale]}
          />
        </TipSection>

        <TipSection
          title={locale === "ko" ? "카메라 애니메이션" : "Camera Animation"}
          tip={SCENE_SETTING_TIPS.sectionCameraAnim[locale]}
          open={open.cameraAnim}
          onToggle={() => toggle("cameraAnim")}
        >
          <TipCheckboxRow
            label={locale === "ko" ? "애니메이션 활성화" : "Enable animation"}
            tip={SCENE_SETTING_TIPS.camAnimEnabled[locale]}
            checked={s.cameraAnimation.enabled}
            onChange={(enabled) =>
              patch({ cameraAnimation: { ...s.cameraAnimation, enabled } })
            }
          />
          <TipCheckboxRow
            label={locale === "ko" ? "스크롤 진행도 연동" : "Link to scroll progress"}
            tip={SCENE_SETTING_TIPS.camAnimScroll[locale]}
            checked={s.cameraAnimation.useScrollProgress}
            onChange={(useScrollProgress) =>
              patch({ cameraAnimation: { ...s.cameraAnimation, useScrollProgress } })
            }
          />
          <TipCheckboxRow
            label={locale === "ko" ? "반복 (시간 기반)" : "Loop (time-based)"}
            tip={SCENE_SETTING_TIPS.camAnimLoop[locale]}
            checked={s.cameraAnimation.loop}
            onChange={(loop) => patch({ cameraAnimation: { ...s.cameraAnimation, loop } })}
          />
          <TipRangeRow
            label="FPS"
            tip={SCENE_SETTING_TIPS.camAnimFps[locale]}
            labelWidth="w-28"
            value={s.cameraAnimation.fps}
            min={12}
            max={60}
            step={1}
            onChange={(fps) => patch({ cameraAnimation: { ...s.cameraAnimation, fps } })}
          />
          <TipField label="Duration (frames)" tip={SCENE_SETTING_TIPS.camAnimDuration[locale]}>
            <NumberInput
              value={s.cameraAnimation.durationFrames}
              min={12}
              max={600}
              step={1}
              onChange={(durationFrames) =>
                patch({ cameraAnimation: { ...s.cameraAnimation, durationFrames } })
              }
            />
          </TipField>
          <KeyframeEditor
            keyframes={s.cameraAnimation.keyframes}
            onChange={(keyframes) => patch({ cameraAnimation: { ...s.cameraAnimation, keyframes } })}
          />
        </TipSection>
      </div>
    </div>
  );
}
