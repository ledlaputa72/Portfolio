"use client";

import { useState, type ReactNode } from "react";
import { SYNAPSER_SCENES, useSynapserModel } from "./SynapserModelContext";
import {
  MAX_SCENE_LIGHTS,
  type SynapserCameraKeyframe,
  type SynapserLightConfig,
  type SynapserSceneSettings,
  type Vec3,
} from "@/lib/synapser-scene-settings";

type SynapserSceneSettingsPanelProps = {
  compact?: boolean;
};

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-[#2a2520] pt-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left text-xs uppercase tracking-wider text-[#f0ebe3]/70"
      >
        {title}
        <span className="text-[#c9a66b]/60">{open ? "−" : "+"}</span>
      </button>
      {open ? <div className="mt-3 space-y-3">{children}</div> : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[11px] text-[#f0ebe3]/50">
      <span className="mb-1 block uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
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

function RangeRow({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <label className="flex items-center gap-2 text-[11px] text-[#f0ebe3]/55">
      <span className="w-28 shrink-0 uppercase tracking-wider">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#c9a66b]"
      />
      <span className="w-10 font-mono text-[10px] tabular-nums">{value.toFixed(2)}</span>
    </label>
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
            <Field label="At (0–1)">
              <NumberInput value={kf.at} min={0} max={1} step={0.01} onChange={(v) => update(index, { at: v })} />
            </Field>
            <Field label="Position">
              <Vec3Input value={kf.position} onChange={(position) => update(index, { position })} />
            </Field>
            <Field label="Look At">
              <Vec3Input value={kf.lookAt} onChange={(lookAt) => update(index, { lookAt })} />
            </Field>
            <Field label="FOV">
              <NumberInput value={kf.fov} min={20} max={90} step={1} onChange={(fov) => update(index, { fov })} />
            </Field>
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
            <label className="flex items-center gap-1.5 text-[10px] text-[#f0ebe3]/50">
              <input
                type="checkbox"
                checked={light.enabled}
                onChange={(e) => updateLight(index, { enabled: e.target.checked })}
              />
              On
            </label>
          </div>
          <div className="space-y-2">
            <Field label="Type">
              <select
                value={light.type}
                onChange={(e) => updateLight(index, { type: e.target.value as SynapserLightConfig["type"] })}
                className="w-full rounded-md border border-[#2a2520] bg-[#0f0c0a] px-2 py-1.5 text-xs text-[#f0ebe3]"
              >
                <option value="directional">Directional</option>
                <option value="point">Point</option>
                <option value="spot">Spot</option>
              </select>
            </Field>
            <RangeRow
              label="Intensity"
              value={light.intensity}
              min={0}
              max={3}
              step={0.05}
              onChange={(intensity) => updateLight(index, { intensity })}
            />
            <Field label="Color">
              <input
                type="color"
                value={light.color}
                onChange={(e) => updateLight(index, { color: e.target.value })}
                className="h-8 w-full cursor-pointer rounded border border-[#2a2520] bg-transparent"
              />
            </Field>
            <Field label="Position">
              <Vec3Input value={light.position} onChange={(position) => updateLight(index, { position })} />
            </Field>
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
    activeSceneSettings: s,
    settingsDirty,
    patchSceneSettings,
    saveSceneSettings,
    resetSceneSettings,
  } = useSynapserModel();

  const [open, setOpen] = useState({
    lighting: !compact,
    background: false,
    motion: false,
    camera: false,
    cameraAnim: false,
  });

  const patch = (next: Partial<SynapserSceneSettings>) => patchSceneSettings(selectedScene, next);
  const sceneLabel = SYNAPSER_SCENES.find((sc) => sc.id === selectedScene)?.label ?? selectedScene;

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
          <button
            type="button"
            onClick={saveSceneSettings}
            className="rounded-full border border-[#6b8cce]/40 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3] transition-colors hover:border-[#6b8cce]"
          >
            저장
          </button>
          <button
            type="button"
            onClick={() => resetSceneSettings(selectedScene)}
            className="rounded-full border border-[#f0ebe3]/15 px-4 py-2 text-xs uppercase tracking-wider text-[#f0ebe3]/60 transition-colors hover:border-[#f0ebe3]/35"
          >
            기본값
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <Section title="조명 (Lighting)" open={open.lighting} onToggle={() => toggle("lighting")}>
          <RangeRow
            label="Ambient"
            value={s.lighting.ambientIntensity}
            min={0}
            max={2}
            step={0.05}
            onChange={(ambientIntensity) => patch({ lighting: { ...s.lighting, ambientIntensity } })}
          />
          <Field label="Ambient Color">
            <input
              type="color"
              value={s.lighting.ambientColor}
              onChange={(e) => patch({ lighting: { ...s.lighting, ambientColor: e.target.value } })}
              className="h-8 w-full cursor-pointer rounded border border-[#2a2520] bg-transparent"
            />
          </Field>
          <LightEditor
            lights={s.lighting.lights}
            onChange={(lights) => patch({ lighting: { ...s.lighting, lights } })}
          />
        </Section>

        <Section title="배경 (Background)" open={open.background} onToggle={() => toggle("background")}>
          <Field label="Canvas Color">
            <input
              type="color"
              value={s.background.canvasColor}
              onChange={(e) => patch({ background: { ...s.background, canvasColor: e.target.value } })}
              className="h-8 w-full cursor-pointer rounded border border-[#2a2520] bg-transparent"
            />
          </Field>
          <label className="flex items-center gap-2 text-[11px] text-[#f0ebe3]/55">
            <input
              type="checkbox"
              checked={s.background.fogEnabled}
              onChange={(e) => patch({ background: { ...s.background, fogEnabled: e.target.checked } })}
            />
            Fog 활성화
          </label>
          <Field label="Fog Color">
            <input
              type="color"
              value={s.background.fogColor}
              onChange={(e) => patch({ background: { ...s.background, fogColor: e.target.value } })}
              className="h-8 w-full cursor-pointer rounded border border-[#2a2520] bg-transparent"
            />
          </Field>
          <RangeRow
            label="Fog Near"
            value={s.background.fogNear}
            min={0}
            max={20}
            step={0.5}
            onChange={(fogNear) => patch({ background: { ...s.background, fogNear } })}
          />
          <RangeRow
            label="Fog Far"
            value={s.background.fogFar}
            min={4}
            max={40}
            step={0.5}
            onChange={(fogFar) => patch({ background: { ...s.background, fogFar } })}
          />
          <label className="flex items-center gap-2 text-[11px] text-[#f0ebe3]/55">
            <input
              type="checkbox"
              checked={s.background.floorVisible}
              onChange={(e) => patch({ background: { ...s.background, floorVisible: e.target.checked } })}
            />
            바닥 표시
          </label>
          <Field label="Floor Color">
            <input
              type="color"
              value={s.background.floorColor}
              onChange={(e) => patch({ background: { ...s.background, floorColor: e.target.value } })}
              className="h-8 w-full cursor-pointer rounded border border-[#2a2520] bg-transparent"
            />
          </Field>
          <RangeRow
            label="Floor Y"
            value={s.background.floorY}
            min={-5}
            max={0}
            step={0.1}
            onChange={(floorY) => patch({ background: { ...s.background, floorY } })}
          />
        </Section>

        <Section title="오브젝트 움직임 (Motion)" open={open.motion} onToggle={() => toggle("motion")}>
          <label className="flex items-center gap-2 text-[11px] text-[#f0ebe3]/55">
            <input
              type="checkbox"
              checked={s.objectMotion.floatEnabled}
              onChange={(e) => patch({ objectMotion: { ...s.objectMotion, floatEnabled: e.target.checked } })}
            />
            Float 활성화
          </label>
          <RangeRow
            label="Float Speed"
            value={s.objectMotion.floatSpeed}
            min={0}
            max={5}
            step={0.1}
            onChange={(floatSpeed) => patch({ objectMotion: { ...s.objectMotion, floatSpeed } })}
          />
          <RangeRow
            label="Rotation"
            value={s.objectMotion.rotationIntensity}
            min={0}
            max={2}
            step={0.05}
            onChange={(rotationIntensity) => patch({ objectMotion: { ...s.objectMotion, rotationIntensity } })}
          />
          <RangeRow
            label="Float Amp"
            value={s.objectMotion.floatIntensity}
            min={0}
            max={2}
            step={0.05}
            onChange={(floatIntensity) => patch({ objectMotion: { ...s.objectMotion, floatIntensity } })}
          />
          <RangeRow
            label="Auto Rot X"
            value={s.objectMotion.autoRotateX}
            min={-0.05}
            max={0.05}
            step={0.001}
            onChange={(autoRotateX) => patch({ objectMotion: { ...s.objectMotion, autoRotateX } })}
          />
          <RangeRow
            label="Auto Rot Y"
            value={s.objectMotion.autoRotateY}
            min={-0.05}
            max={0.05}
            step={0.001}
            onChange={(autoRotateY) => patch({ objectMotion: { ...s.objectMotion, autoRotateY } })}
          />
          <RangeRow
            label="Auto Rot Z"
            value={s.objectMotion.autoRotateZ}
            min={-0.05}
            max={0.05}
            step={0.001}
            onChange={(autoRotateZ) => patch({ objectMotion: { ...s.objectMotion, autoRotateZ } })}
          />
          <Field label="Group Offset">
            <Vec3Input
              value={s.objectMotion.groupOffset}
              onChange={(groupOffset) => patch({ objectMotion: { ...s.objectMotion, groupOffset } })}
            />
          </Field>
          <RangeRow
            label="Group Scale"
            value={s.objectMotion.groupScale}
            min={0.25}
            max={3}
            step={0.05}
            onChange={(groupScale) => patch({ objectMotion: { ...s.objectMotion, groupScale } })}
          />
        </Section>

        <Section title="카메라 (Camera)" open={open.camera} onToggle={() => toggle("camera")}>
          <RangeRow
            label="FOV"
            value={s.camera.fov}
            min={20}
            max={90}
            step={1}
            onChange={(fov) => patch({ camera: { ...s.camera, fov } })}
          />
          <Field label="Position">
            <Vec3Input
              value={s.camera.position}
              onChange={(position) => patch({ camera: { ...s.camera, position } })}
            />
          </Field>
          <Field label="Look At">
            <Vec3Input
              value={s.camera.lookAt}
              onChange={(lookAt) => patch({ camera: { ...s.camera, lookAt } })}
            />
          </Field>
          <RangeRow
            label="Drift X"
            value={s.camera.pointerDriftX}
            min={0}
            max={2}
            step={0.05}
            onChange={(pointerDriftX) => patch({ camera: { ...s.camera, pointerDriftX } })}
          />
          <RangeRow
            label="Drift Y"
            value={s.camera.pointerDriftY}
            min={0}
            max={2}
            step={0.05}
            onChange={(pointerDriftY) => patch({ camera: { ...s.camera, pointerDriftY } })}
          />
          <RangeRow
            label="Lerp"
            value={s.camera.lerpSpeed}
            min={0.01}
            max={0.3}
            step={0.01}
            onChange={(lerpSpeed) => patch({ camera: { ...s.camera, lerpSpeed } })}
          />
          <RangeRow
            label="Near"
            value={s.camera.near}
            min={0.01}
            max={5}
            step={0.01}
            onChange={(near) => patch({ camera: { ...s.camera, near } })}
          />
          <RangeRow
            label="Far"
            value={s.camera.far}
            min={10}
            max={500}
            step={1}
            onChange={(far) => patch({ camera: { ...s.camera, far } })}
          />
        </Section>

        <Section title="카메라 애니메이션" open={open.cameraAnim} onToggle={() => toggle("cameraAnim")}>
          <label className="flex items-center gap-2 text-[11px] text-[#f0ebe3]/55">
            <input
              type="checkbox"
              checked={s.cameraAnimation.enabled}
              onChange={(e) =>
                patch({ cameraAnimation: { ...s.cameraAnimation, enabled: e.target.checked } })
              }
            />
            애니메이션 활성화
          </label>
          <label className="flex items-center gap-2 text-[11px] text-[#f0ebe3]/55">
            <input
              type="checkbox"
              checked={s.cameraAnimation.useScrollProgress}
              onChange={(e) =>
                patch({ cameraAnimation: { ...s.cameraAnimation, useScrollProgress: e.target.checked } })
              }
            />
            스크롤 진행도 연동
          </label>
          <label className="flex items-center gap-2 text-[11px] text-[#f0ebe3]/55">
            <input
              type="checkbox"
              checked={s.cameraAnimation.loop}
              onChange={(e) => patch({ cameraAnimation: { ...s.cameraAnimation, loop: e.target.checked } })}
            />
            반복 (시간 기반)
          </label>
          <RangeRow
            label="FPS"
            value={s.cameraAnimation.fps}
            min={12}
            max={60}
            step={1}
            onChange={(fps) => patch({ cameraAnimation: { ...s.cameraAnimation, fps } })}
          />
          <Field label="Duration (frames)">
            <NumberInput
              value={s.cameraAnimation.durationFrames}
              min={12}
              max={600}
              step={1}
              onChange={(durationFrames) =>
                patch({ cameraAnimation: { ...s.cameraAnimation, durationFrames } })
              }
            />
          </Field>
          <KeyframeEditor
            keyframes={s.cameraAnimation.keyframes}
            onChange={(keyframes) => patch({ cameraAnimation: { ...s.cameraAnimation, keyframes } })}
          />
        </Section>
      </div>
    </div>
  );
}
