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
            <TipField label="At (0–1)" tip={SCENE_SETTING_TIPS.keyframeAt}>
              <NumberInput value={kf.at} min={0} max={1} step={0.01} onChange={(v) => update(index, { at: v })} />
            </TipField>
            <TipField label="Position" tip={SCENE_SETTING_TIPS.keyframePosition}>
              <Vec3Input value={kf.position} onChange={(position) => update(index, { position })} />
            </TipField>
            <TipField label="Look At" tip={SCENE_SETTING_TIPS.keyframeLookAt}>
              <Vec3Input value={kf.lookAt} onChange={(lookAt) => update(index, { lookAt })} />
            </TipField>
            <TipField label="FOV" tip={SCENE_SETTING_TIPS.keyframeFov}>
              <NumberInput value={kf.fov} min={20} max={90} step={1} onChange={(fov) => update(index, { fov })} />
            </TipField>
          </div>
          {keyframes.length > 2 ? (
            <button
              type="button"
              onClick={() => onChange(keyframes.filter((_, i) => i !== index))}
              className="mt-2 text-[10px] text-red-400/70 hover:text-red-400"
            >
              삭제
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
          + 키프레임 추가
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
              tip={SCENE_SETTING_TIPS.lightEnabled}
              checked={light.enabled}
              onChange={(enabled) => updateLight(index, { enabled })}
            />
          </div>
          <div className="space-y-2">
            <TipField label="Type" tip={SCENE_SETTING_TIPS.lightType}>
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
              tip={SCENE_SETTING_TIPS.lightIntensity}
              labelWidth="w-28"
              value={light.intensity}
              min={0}
              max={3}
              step={0.05}
              onChange={(intensity) => updateLight(index, { intensity })}
            />
            <TipField label="Color" tip={SCENE_SETTING_TIPS.lightColor}>
              <ColorField
                value={light.color}
                onChange={(color) => updateLight(index, { color })}
              />
            </TipField>
            <TipField label="Position" tip={SCENE_SETTING_TIPS.lightPosition}>
              <Vec3Input value={light.position} onChange={(position) => updateLight(index, { position })} />
            </TipField>
          </div>
          {lights.length > 1 ? (
            <button
              type="button"
              onClick={() => onChange(lights.filter((_, i) => i !== index))}
              className="mt-2 text-[10px] text-red-400/70 hover:text-red-400"
            >
              삭제
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
          + 조명 추가
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
          <p className="mt-1 text-sm text-[#f0ebe3]/70">{sceneLabel} 씬 조명 · 배경 · 카메라</p>
          {settingsDirty ? (
            <p className="mt-1 text-xs text-amber-400/80">저장하지 않은 변경 사항이 있습니다.</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <SettingTip tip={SCENE_SETTING_TIPS.save}>
            <button
              type="button"
              disabled={loading}
              onClick={saveSceneSettings}
              className="cursor-help rounded-full border border-[#6b8cce]/40 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3] transition-colors hover:border-[#6b8cce] disabled:cursor-not-allowed disabled:opacity-40"
            >
              저장
            </button>
          </SettingTip>
          <SettingTip tip={SCENE_SETTING_TIPS.reset}>
            <button
              type="button"
              onClick={() => resetSceneSettings(selectedScene)}
              className="cursor-help rounded-full border border-[#f0ebe3]/15 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3]/60 transition-colors hover:border-[#f0ebe3]/35"
            >
              기본값
            </button>
          </SettingTip>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <TipSection
          title="조명 (Lighting)"
          tip={SCENE_SETTING_TIPS.sectionLighting}
          open={open.lighting}
          onToggle={() => toggle("lighting")}
        >
          <TipRangeRow
            label="Ambient"
            tip={SCENE_SETTING_TIPS.ambient}
            labelWidth="w-28"
            value={s.lighting.ambientIntensity}
            min={0}
            max={2}
            step={0.05}
            onChange={(ambientIntensity) => patch({ lighting: { ...s.lighting, ambientIntensity } })}
          />
          <TipField label="Ambient Color" tip={SCENE_SETTING_TIPS.ambientColor}>
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
          title="배경 (Background)"
          tip={SCENE_SETTING_TIPS.sectionBackground}
          open={open.background}
          onToggle={() => toggle("background")}
        >
          <TipField label="Canvas Color" tip={SCENE_SETTING_TIPS.canvasColor}>
            <ColorField
              value={s.background.canvasColor}
              onChange={(canvasColor) => patch({ background: { ...s.background, canvasColor } })}
            />
          </TipField>
          <TipCheckboxRow
            label="Fog 활성화"
            tip={SCENE_SETTING_TIPS.fogEnabled}
            checked={s.background.fogEnabled}
            onChange={(fogEnabled) => patch({ background: { ...s.background, fogEnabled } })}
          />
          <TipField label="Fog Color" tip={SCENE_SETTING_TIPS.fogColor}>
            <ColorField
              value={s.background.fogColor}
              onChange={(fogColor) => patch({ background: { ...s.background, fogColor } })}
            />
          </TipField>
          <TipRangeRow
            label="Fog Near"
            tip={SCENE_SETTING_TIPS.fogNear}
            labelWidth="w-28"
            value={s.background.fogNear}
            min={0}
            max={20}
            step={0.5}
            onChange={(fogNear) => patch({ background: { ...s.background, fogNear } })}
          />
          <TipRangeRow
            label="Fog Far"
            tip={SCENE_SETTING_TIPS.fogFar}
            labelWidth="w-28"
            value={s.background.fogFar}
            min={4}
            max={40}
            step={0.5}
            onChange={(fogFar) => patch({ background: { ...s.background, fogFar } })}
          />
          <TipCheckboxRow
            label="바닥 표시"
            tip={SCENE_SETTING_TIPS.floorVisible}
            checked={s.background.floorVisible}
            onChange={(floorVisible) => patch({ background: { ...s.background, floorVisible } })}
          />
          <TipField label="Floor Color" tip={SCENE_SETTING_TIPS.floorColor}>
            <ColorField
              value={s.background.floorColor}
              onChange={(floorColor) => patch({ background: { ...s.background, floorColor } })}
            />
          </TipField>
          <TipRangeRow
            label="Floor Y"
            tip={SCENE_SETTING_TIPS.floorY}
            labelWidth="w-28"
            value={s.background.floorY}
            min={-5}
            max={0}
            step={0.1}
            onChange={(floorY) => patch({ background: { ...s.background, floorY } })}
          />
        </TipSection>

        <TipSection
          title="오브젝트 움직임 (Motion)"
          tip={SCENE_SETTING_TIPS.sectionMotion}
          open={open.motion}
          onToggle={() => toggle("motion")}
        >
          <TipCheckboxRow
            label="Float 활성화"
            tip={SCENE_SETTING_TIPS.floatEnabled}
            checked={s.objectMotion.floatEnabled}
            onChange={(floatEnabled) => patch({ objectMotion: { ...s.objectMotion, floatEnabled } })}
          />
          <TipRangeRow
            label="Float Speed"
            tip={SCENE_SETTING_TIPS.floatSpeed}
            labelWidth="w-28"
            value={s.objectMotion.floatSpeed}
            min={0}
            max={1}
            step={0.01}
            onChange={(floatSpeed) => patch({ objectMotion: { ...s.objectMotion, floatSpeed } })}
          />
          <TipRangeRow
            label="Rotation"
            tip={SCENE_SETTING_TIPS.rotationIntensity}
            labelWidth="w-28"
            value={s.objectMotion.rotationIntensity}
            min={0}
            max={1}
            step={0.01}
            onChange={(rotationIntensity) => patch({ objectMotion: { ...s.objectMotion, rotationIntensity } })}
          />
          <TipRangeRow
            label="Float Amp"
            tip={SCENE_SETTING_TIPS.floatIntensity}
            labelWidth="w-28"
            value={s.objectMotion.floatIntensity}
            min={0}
            max={1}
            step={0.01}
            onChange={(floatIntensity) => patch({ objectMotion: { ...s.objectMotion, floatIntensity } })}
          />
          <TipRangeRow
            label="Auto Rot X"
            tip={SCENE_SETTING_TIPS.autoRotateX}
            labelWidth="w-28"
            value={s.objectMotion.autoRotateX}
            min={0}
            max={1}
            step={0.01}
            onChange={(autoRotateX) => patch({ objectMotion: { ...s.objectMotion, autoRotateX } })}
          />
          <TipRangeRow
            label="Auto Rot Y"
            tip={SCENE_SETTING_TIPS.autoRotateY}
            labelWidth="w-28"
            value={s.objectMotion.autoRotateY}
            min={0}
            max={1}
            step={0.01}
            onChange={(autoRotateY) => patch({ objectMotion: { ...s.objectMotion, autoRotateY } })}
          />
          <TipRangeRow
            label="Auto Rot Z"
            tip={SCENE_SETTING_TIPS.autoRotateZ}
            labelWidth="w-28"
            value={s.objectMotion.autoRotateZ}
            min={0}
            max={1}
            step={0.01}
            onChange={(autoRotateZ) => patch({ objectMotion: { ...s.objectMotion, autoRotateZ } })}
          />
          <TipField label="Group Offset" tip={SCENE_SETTING_TIPS.groupOffset}>
            <Vec3Input
              value={s.objectMotion.groupOffset}
              onChange={(groupOffset) => patch({ objectMotion: { ...s.objectMotion, groupOffset } })}
            />
          </TipField>
          <TipRangeRow
            label="Group Scale"
            tip={SCENE_SETTING_TIPS.groupScale}
            labelWidth="w-28"
            value={s.objectMotion.groupScale}
            min={0.25}
            max={3}
            step={0.05}
            onChange={(groupScale) => patch({ objectMotion: { ...s.objectMotion, groupScale } })}
          />
        </TipSection>

        <TipSection
          title="3D 오브젝트 (Object)"
          tip={SCENE_SETTING_TIPS.sectionObject}
          open={open.objectLayout}
          onToggle={() => toggle("objectLayout")}
        >
          <SynapserAnchorPicker
            value={s.objectMotion.anchor}
            onChange={(anchor) => patch({ objectMotion: { ...s.objectMotion, anchor } })}
            alignXTip={SCENE_SETTING_TIPS.objectAnchor}
            alignYTip={SCENE_SETTING_TIPS.objectAnchor}
          />
        </TipSection>

        <TipSection
          title="스크롤 줌 전환 (Scroll Zoom)"
          tip={SCENE_SETTING_TIPS.sectionScrollZoom}
          open={open.scrollZoom}
          onToggle={() => toggle("scrollZoom")}
        >
          <TipCheckboxRow
            label="시네마틱 줌"
            tip={SCENE_SETTING_TIPS.cinematicEnabled}
            checked={s.cinematicScroll.enabled}
            onChange={(enabled) => patch({ cinematicScroll: { ...s.cinematicScroll, enabled } })}
          />
          <TipRangeRow
            label="원경 거리"
            tip={SCENE_SETTING_TIPS.cinematicDistanceFar}
            labelWidth="w-28"
            value={s.cinematicScroll.distanceFar}
            min={2}
            max={24}
            step={0.5}
            onChange={(distanceFar) => patch({ cinematicScroll: { ...s.cinematicScroll, distanceFar } })}
          />
          <TipRangeRow
            label="근접 거리"
            tip={SCENE_SETTING_TIPS.cinematicDistanceNear}
            labelWidth="w-28"
            value={s.cinematicScroll.distanceNear}
            min={1}
            max={16}
            step={0.25}
            onChange={(distanceNear) => patch({ cinematicScroll: { ...s.cinematicScroll, distanceNear } })}
          />

          <p className="pt-2 font-mono text-[9px] uppercase tracking-[0.25em] text-[#c9a66b]/70">
            스크롤 줌 인
          </p>
          <TipRangeRow
            label="시작 %"
            tip={SCENE_SETTING_TIPS.zoomInStart}
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
            label="끝 %"
            tip={SCENE_SETTING_TIPS.zoomInEnd}
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
          <TipField label="모션" tip={SCENE_SETTING_TIPS.zoomInEasing}>
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
              <option value="linear">직선 (균일)</option>
              <option value="ease-in">완만히 시작 · 빠르게 끝</option>
              <option value="ease-out">빠르게 시작 · 완만히 끝</option>
            </select>
          </TipField>

          <p className="pt-2 font-mono text-[9px] uppercase tracking-[0.25em] text-[#c9a66b]/70">
            스크롤 회전
          </p>
          <TipRangeRow
            label="회전 (바퀴)"
            tip={SCENE_SETTING_TIPS.scrollRotationRevolutions}
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
          <TipField label="모션" tip={SCENE_SETTING_TIPS.scrollRotationEasing}>
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
              <option value="linear">직선 (균일)</option>
              <option value="ease-in">완만히 시작 · 빠르게 끝</option>
              <option value="ease-out">빠르게 시작 · 완만히 끝</option>
            </select>
          </TipField>

          <p className="pt-2 font-mono text-[9px] uppercase tracking-[0.25em] text-[#c9a66b]/70">
            스크롤 줌 아웃
          </p>
          <TipRangeRow
            label="시작 %"
            tip={SCENE_SETTING_TIPS.zoomOutStart}
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
            label="끝 %"
            tip={SCENE_SETTING_TIPS.zoomOutEnd}
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
          <TipField label="모션" tip={SCENE_SETTING_TIPS.zoomOutEasing}>
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
              <option value="linear">직선 (균일)</option>
              <option value="ease-in">완만히 시작 · 빠르게 끝</option>
              <option value="ease-out">빠르게 시작 · 완만히 끝</option>
            </select>
          </TipField>
        </TipSection>

        <TipSection
          title="카메라 (Camera)"
          tip={SCENE_SETTING_TIPS.sectionCamera}
          open={open.camera}
          onToggle={() => toggle("camera")}
        >
          <TipRangeRow
            label="FOV"
            tip={SCENE_SETTING_TIPS.fov}
            labelWidth="w-28"
            value={s.camera.fov}
            min={20}
            max={90}
            step={1}
            onChange={(fov) => patch({ camera: { ...s.camera, fov } })}
          />
          <TipField label="Position" tip={SCENE_SETTING_TIPS.cameraPosition}>
            <Vec3Input
              value={s.camera.position}
              onChange={(position) => patch({ camera: { ...s.camera, position } })}
            />
          </TipField>
          <TipField label="Look At" tip={SCENE_SETTING_TIPS.cameraLookAt}>
            <Vec3Input
              value={s.camera.lookAt}
              onChange={(lookAt) => patch({ camera: { ...s.camera, lookAt } })}
            />
          </TipField>
          <TipRangeRow
            label="Orbit X"
            tip={SCENE_SETTING_TIPS.pointerDriftX}
            labelWidth="w-28"
            value={s.camera.pointerDriftX}
            min={0}
            max={2}
            step={0.05}
            onChange={(pointerDriftX) => patch({ camera: { ...s.camera, pointerDriftX } })}
          />
          <TipRangeRow
            label="Orbit Y"
            tip={SCENE_SETTING_TIPS.pointerDriftY}
            labelWidth="w-28"
            value={s.camera.pointerDriftY}
            min={0}
            max={2}
            step={0.05}
            onChange={(pointerDriftY) => patch({ camera: { ...s.camera, pointerDriftY } })}
          />
          <TipRangeRow
            label="Orbit Damp"
            tip={SCENE_SETTING_TIPS.orbitDamp}
            labelWidth="w-28"
            value={s.camera.orbitDamp}
            min={1}
            max={20}
            step={0.5}
            onChange={(orbitDamp) => patch({ camera: { ...s.camera, orbitDamp } })}
          />
          <TipRangeRow
            label="Orbit Edge"
            tip={SCENE_SETTING_TIPS.orbitEdgePower}
            labelWidth="w-28"
            value={s.camera.orbitEdgePower}
            min={0.4}
            max={1.2}
            step={0.02}
            onChange={(orbitEdgePower) => patch({ camera: { ...s.camera, orbitEdgePower } })}
          />
          <TipRangeRow
            label="Hover Zoom"
            tip={SCENE_SETTING_TIPS.hoverZoomPull}
            labelWidth="w-28"
            value={s.camera.hoverZoomPull}
            min={0}
            max={1}
            step={0.02}
            onChange={(hoverZoomPull) => patch({ camera: { ...s.camera, hoverZoomPull } })}
          />
          <TipRangeRow
            label="Hover FOV"
            tip={SCENE_SETTING_TIPS.hoverZoomFovPull}
            labelWidth="w-28"
            value={s.camera.hoverZoomFovPull}
            min={0}
            max={12}
            step={0.25}
            onChange={(hoverZoomFovPull) => patch({ camera: { ...s.camera, hoverZoomFovPull } })}
          />
          <TipRangeRow
            label="Hover Damp"
            tip={SCENE_SETTING_TIPS.hoverZoomDamp}
            labelWidth="w-28"
            value={s.camera.hoverZoomDamp}
            min={1}
            max={20}
            step={0.5}
            onChange={(hoverZoomDamp) => patch({ camera: { ...s.camera, hoverZoomDamp } })}
          />
          <TipRangeRow
            label="Lerp"
            tip={SCENE_SETTING_TIPS.lerpSpeed}
            labelWidth="w-28"
            value={s.camera.lerpSpeed}
            min={0.01}
            max={0.3}
            step={0.01}
            onChange={(lerpSpeed) => patch({ camera: { ...s.camera, lerpSpeed } })}
          />
          <TipRangeRow
            label="Near"
            tip={SCENE_SETTING_TIPS.near}
            labelWidth="w-28"
            value={s.camera.near}
            min={0.01}
            max={5}
            step={0.01}
            onChange={(near) => patch({ camera: { ...s.camera, near } })}
          />
          <TipRangeRow
            label="Far"
            tip={SCENE_SETTING_TIPS.far}
            labelWidth="w-28"
            value={s.camera.far}
            min={10}
            max={500}
            step={1}
            onChange={(far) => patch({ camera: { ...s.camera, far } })}
          />
        </TipSection>

        <TipSection
          title="타이틀 그룹 (Typography)"
          tip={SCENE_SETTING_TIPS.sectionTypography}
          open={open.typography}
          onToggle={() => toggle("typography")}
        >
          <SynapserAnchorPicker
            value={s.typography}
            onChange={(typography) => patch({ typography })}
            alignXTip={SCENE_SETTING_TIPS.typographyAlignX}
            alignYTip={SCENE_SETTING_TIPS.typographyAlignY}
          />
        </TipSection>

        <TipSection
          title="카메라 애니메이션"
          tip={SCENE_SETTING_TIPS.sectionCameraAnim}
          open={open.cameraAnim}
          onToggle={() => toggle("cameraAnim")}
        >
          <TipCheckboxRow
            label="애니메이션 활성화"
            tip={SCENE_SETTING_TIPS.camAnimEnabled}
            checked={s.cameraAnimation.enabled}
            onChange={(enabled) =>
              patch({ cameraAnimation: { ...s.cameraAnimation, enabled } })
            }
          />
          <TipCheckboxRow
            label="스크롤 진행도 연동"
            tip={SCENE_SETTING_TIPS.camAnimScroll}
            checked={s.cameraAnimation.useScrollProgress}
            onChange={(useScrollProgress) =>
              patch({ cameraAnimation: { ...s.cameraAnimation, useScrollProgress } })
            }
          />
          <TipCheckboxRow
            label="반복 (시간 기반)"
            tip={SCENE_SETTING_TIPS.camAnimLoop}
            checked={s.cameraAnimation.loop}
            onChange={(loop) => patch({ cameraAnimation: { ...s.cameraAnimation, loop } })}
          />
          <TipRangeRow
            label="FPS"
            tip={SCENE_SETTING_TIPS.camAnimFps}
            labelWidth="w-28"
            value={s.cameraAnimation.fps}
            min={12}
            max={60}
            step={1}
            onChange={(fps) => patch({ cameraAnimation: { ...s.cameraAnimation, fps } })}
          />
          <TipField label="Duration (frames)" tip={SCENE_SETTING_TIPS.camAnimDuration}>
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
