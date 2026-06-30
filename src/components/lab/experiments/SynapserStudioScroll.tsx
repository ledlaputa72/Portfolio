"use client";

import { useMemo, useRef, useState, Suspense, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, useGLTF } from "@react-three/drei";
import type { Group, PerspectiveCamera } from "three";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";
import { useSynapserModel } from "./SynapserModelContext";
import {
  cinematicZoomT,
  getActiveSceneIndex,
  getCinematicCamera,
  getCinematicSceneVisibilities,
  getSceneLocalProgress,
  getSceneVisibilities,
  sampleCameraKeyframes,
  type SynapserSceneId,
  type SynapserSceneSettings,
} from "@/lib/synapser-scene-settings";

const SCENES = [
  {
    id: "manifesto" as const,
    label: "MANIFESTO",
    kicker: "Lisbon Digital Atelier",
    body: "Craft meets cinematic scroll.",
  },
  {
    id: "archive" as const,
    label: "ARCHIVE",
    kicker: "Selected Works",
    body: "Projects drift into focus.",
  },
  {
    id: "journey" as const,
    label: "JOURNEY",
    kicker: "Synapser Network",
    body: "Nodes connect — ideas flow.",
  },
];

const SCENE_IDS: SynapserSceneId[] = ["manifesto", "archive", "journey"];

const NODE_POSITIONS: [number, number, number][] = [
  [0, 0, 0],
  [1.2, 0.6, -0.4],
  [-1.1, 0.3, 0.5],
  [0.5, -0.8, 0.8],
  [-0.6, -0.5, -0.7],
  [1.4, -0.3, 0.2],
  [-1.3, 0.9, -0.2],
];

const NODE_LINKS: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 5],
  [2, 4],
  [3, 4],
  [1, 6],
  [2, 6],
  [5, 6],
];

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const num = Number.parseInt(value, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

function blendHex(colors: { hex: string; weight: number }[]) {
  let r = 0;
  let g = 0;
  let b = 0;
  let total = 0;
  for (const { hex, weight } of colors) {
    if (weight <= 0) continue;
    const c = hexToRgb(hex);
    r += c.r * weight;
    g += c.g * weight;
    b += c.b * weight;
    total += weight;
  }
  if (total <= 0) return "#0f0c0a";
  const toHex = (v: number) =>
    Math.round((v / total) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function weightedAverage(values: { value: number; weight: number }[]) {
  let sum = 0;
  let total = 0;
  for (const { value, weight } of values) {
    if (weight <= 0) continue;
    sum += value * weight;
    total += weight;
  }
  return total > 0 ? sum / total : values[0]?.value ?? 0;
}

function ManifestoObject({ visible }: { visible: number }) {
  return (
    <mesh scale={visible}>
      <torusKnotGeometry args={[0.9, 0.28, 128, 24]} />
      <meshStandardMaterial
        color="#c9a66b"
        metalness={0.55}
        roughness={0.35}
        transparent
        opacity={0.85 + visible * 0.15}
      />
    </mesh>
  );
}

function ArchiveGrid({ visible }: { visible: number }) {
  const boxes = Array.from({ length: 9 }, (_, i) => {
    const x = (i % 3) - 1;
    const y = Math.floor(i / 3) - 1;
    return { x: x * 1.1, y: y * 0.9, z: -0.5 + (i % 2) * 0.3 };
  });

  return (
    <group scale={visible}>
      {boxes.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} rotation={[0.2, i * 0.3, 0]}>
          <boxGeometry args={[0.65, 0.85, 0.12]} />
          <meshStandardMaterial
            color="#8a9bb5"
            metalness={0.2}
            roughness={0.6}
            transparent
            opacity={0.7 + (i % 3) * 0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

function SynapseNetwork({ visible }: { visible: number }) {
  const linePoints = NODE_LINKS.map(([a, b]) => [
    new THREE.Vector3(...NODE_POSITIONS[a]),
    new THREE.Vector3(...NODE_POSITIONS[b]),
  ]);

  return (
    <group scale={visible}>
      {NODE_POSITIONS.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.12 + (i === 0 ? 0.06 : 0), 16, 16]} />
          <meshStandardMaterial
            color={i === 0 ? "#e8dfd2" : "#6b8cce"}
            emissive={i === 0 ? "#3d2e1f" : "#1a2a4a"}
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
      {linePoints.map((pts, i) => (
        <Line key={i} points={pts} color="#6b8cce" lineWidth={1} transparent opacity={0.6} />
      ))}
    </group>
  );
}

function CustomImportedModel({ url, scale }: { url: string; scale: number }) {
  const { scene } = useGLTF(url);
  const object = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const fit = 2.2 / maxDim;
    clone.position.set(-center.x * fit, -center.y * fit, -center.z * fit);
    clone.scale.setScalar(fit * scale);
    return clone;
  }, [scene, scale]);

  return <primitive object={object} />;
}

function SceneLights({
  sceneId,
  lighting,
  progressRef,
}: {
  sceneId: SynapserSceneId;
  lighting: SynapserSceneSettings["lighting"];
  progressRef: React.RefObject<number>;
}) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const lightRefs = useRef<(THREE.Light | null)[]>([]);

  useFrame(() => {
    const visibility = getSceneVisibilities(progressRef.current)[sceneId];
    if (ambientRef.current) {
      ambientRef.current.intensity = lighting.ambientIntensity * visibility;
      ambientRef.current.visible = visibility > 0.001;
    }
    lighting.lights.forEach((light, index) => {
      const obj = lightRefs.current[index];
      if (!obj) return;
      obj.visible = light.enabled && visibility > 0.001;
      obj.intensity = light.intensity * visibility;
    });
  });

  return (
    <group>
      <ambientLight ref={ambientRef} intensity={0} color={lighting.ambientColor} />
      {lighting.lights.map((light, index) => {
        const ref = (node: THREE.Light | null) => {
          lightRefs.current[index] = node;
        };
        if (light.type === "directional") {
          return (
            <directionalLight
              key={index}
              ref={ref}
              position={light.position}
              intensity={0}
              color={light.color}
            />
          );
        }
        if (light.type === "spot") {
          return (
            <spotLight
              key={index}
              ref={ref}
              position={light.position}
              intensity={0}
              color={light.color}
              angle={0.45}
              penumbra={0.4}
            />
          );
        }
        return (
          <pointLight
            key={index}
            ref={ref}
            position={light.position}
            intensity={0}
            color={light.color}
          />
        );
      })}
    </group>
  );
}

function AnimatedSceneContent({
  sceneId,
  children,
}: {
  sceneId: SynapserSceneId;
  children: ReactNode;
}) {
  const { sceneSettings } = useSynapserModel();
  const motion = sceneSettings[sceneId].objectMotion;
  const groupRef = useRef<Group>(null);
  const floatGroupRef = useRef<Group>(null);
  const { pointer } = useThree();
  const floatPhase = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    const g = groupRef.current;
    const f = floatGroupRef.current;
    if (!g) return;

    g.rotation.x += motion.autoRotateX;
    g.rotation.y += motion.autoRotateY;
    g.rotation.z += motion.autoRotateZ;
    g.rotation.x += pointer.y * motion.pointerTiltX;
    g.rotation.y += pointer.x * motion.pointerTiltY;

    if (motion.floatEnabled && f) {
      floatPhase.current += delta * motion.floatSpeed;
      f.position.y = Math.sin(floatPhase.current) * motion.floatIntensity * 0.35;
      f.rotation.x = Math.sin(floatPhase.current * 0.7) * motion.rotationIntensity * 0.15;
      f.rotation.z = Math.cos(floatPhase.current * 0.5) * motion.rotationIntensity * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={motion.groupOffset} scale={motion.groupScale}>
      {motion.floatEnabled ? <group ref={floatGroupRef}>{children}</group> : children}
    </group>
  );
}

function SceneObject({
  sceneId,
  procedural,
}: {
  sceneId: SynapserSceneId;
  procedural: ReactNode;
}) {
  const { scenes } = useSynapserModel();
  const scene = scenes[sceneId];

  return (
    <AnimatedSceneContent sceneId={sceneId}>
      {scene.mode === "custom" && scene.modelUrl ? (
        <Suspense fallback={null}>
          <CustomImportedModel key={scene.modelUrl} url={scene.modelUrl} scale={scene.scale} />
        </Suspense>
      ) : (
        procedural
      )}
    </AnimatedSceneContent>
  );
}

function EnvironmentController({ progressRef }: { progressRef: React.RefObject<number> }) {
  const { sceneSettings } = useSynapserModel();
  const { scene, gl } = useThree();
  const fogRef = useRef<THREE.Fog | null>(null);

  useFrame(() => {
    const vis = getCinematicSceneVisibilities(progressRef.current);
    const canvasColor = blendHex(
      SCENE_IDS.map((id) => ({ hex: sceneSettings[id].background.canvasColor, weight: vis[id] })),
    );
    const fogColor = blendHex(
      SCENE_IDS.map((id) => ({ hex: sceneSettings[id].background.fogColor, weight: vis[id] })),
    );
    const fogNear = weightedAverage(
      SCENE_IDS.map((id) => ({ value: sceneSettings[id].background.fogNear, weight: vis[id] })),
    );
    const fogFar = weightedAverage(
      SCENE_IDS.map((id) => ({ value: sceneSettings[id].background.fogFar, weight: vis[id] })),
    );
    const fogEnabled = SCENE_IDS.some((id) => sceneSettings[id].background.fogEnabled && vis[id] > 0.05);

    gl.setClearColor(canvasColor);
    if (fogEnabled) {
      if (!fogRef.current) fogRef.current = new THREE.Fog(fogColor, fogNear, fogFar);
      fogRef.current.color.set(fogColor);
      fogRef.current.near = fogNear;
      fogRef.current.far = fogFar;
      scene.fog = fogRef.current;
    } else {
      scene.fog = null;
    }
  });

  return null;
}

function ScrollWorld({ progressRef }: { progressRef: React.RefObject<number> }) {
  const { sceneSettings } = useSynapserModel();
  const manifestoGroupRef = useRef<Group>(null!);
  const archiveGroupRef = useRef<Group>(null!);
  const networkGroupRef = useRef<Group>(null!);
  const groupRefs: Record<SynapserSceneId, React.RefObject<Group>> = {
    manifesto: manifestoGroupRef,
    archive: archiveGroupRef,
    journey: networkGroupRef,
  };
  const timeRefs = useRef<Record<SynapserSceneId, number>>({
    manifesto: 0,
    archive: 0,
    journey: 0,
  });
  const { pointer, camera } = useThree();
  const lookAtTarget = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const p = progressRef.current;
    const vis = getCinematicSceneVisibilities(p);

    let posX = 0;
    let posY = 0;
    let posZ = 0;
    let lookX = 0;
    let lookY = 0;
    let lookZ = 0;
    let fov = 45;
    let near = 0.1;
    let far = 100;
    let total = 0;

    SCENE_IDS.forEach((id, index) => {
      const weight = vis[id];
      const settings = sceneSettings[id];
      const localP = getSceneLocalProgress(p, index);

      groupRefs[id].current.scale.setScalar(weight);

      if (weight <= 0.001) return;

      timeRefs.current[id] += delta;

      let sample;
      if (settings.cinematicScroll.enabled) {
        const zoomT = cinematicZoomT(localP, settings.cinematicScroll);
        sample = getCinematicCamera(settings, zoomT, pointer.x, pointer.y);
      } else if (settings.cameraAnimation.enabled) {
        let t = localP;
        if (!settings.cameraAnimation.useScrollProgress) {
          const duration = settings.cameraAnimation.durationFrames / settings.cameraAnimation.fps;
          const elapsed = timeRefs.current[id];
          t = settings.cameraAnimation.loop
            ? (elapsed % duration) / duration
            : Math.min(1, elapsed / duration);
        }
        sample = sampleCameraKeyframes(settings.cameraAnimation.keyframes, t);
      } else {
        sample = {
          position: settings.camera.position,
          lookAt: settings.camera.lookAt,
          fov: settings.camera.fov,
        };
      }

      posX += sample.position[0] * weight;
      posY += sample.position[1] * weight;
      posZ += sample.position[2] * weight;
      lookX += sample.lookAt[0] * weight;
      lookY += sample.lookAt[1] * weight;
      lookZ += sample.lookAt[2] * weight;
      fov += sample.fov * weight;
      near += settings.camera.near * weight;
      far += settings.camera.far * weight;
      total += weight;
    });

    if (total > 0) {
      posX /= total;
      posY /= total;
      posZ /= total;
      lookX /= total;
      lookY /= total;
      lookZ /= total;
      fov /= total;
      near /= total;
      far /= total;
    }

    camera.position.set(posX, posY, posZ);

    lookAtTarget.current.set(lookX, lookY, lookZ);
    camera.lookAt(lookAtTarget.current);

    const persp = camera as PerspectiveCamera;
    persp.fov = fov;
    persp.near = near;
    persp.far = far;
    persp.updateProjectionMatrix();
  });

  return (
    <>
      <EnvironmentController progressRef={progressRef} />

      <group ref={manifestoGroupRef}>
        <SceneLights
          sceneId="manifesto"
          lighting={sceneSettings.manifesto.lighting}
          progressRef={progressRef}
        />
        <SceneObject sceneId="manifesto" procedural={<ManifestoObject visible={1} />} />
        {sceneSettings.manifesto.background.floorVisible ? (
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, sceneSettings.manifesto.background.floorY, 0]}
            receiveShadow
          >
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color={sceneSettings.manifesto.background.floorColor} roughness={0.9} />
          </mesh>
        ) : null}
      </group>

      <group ref={archiveGroupRef}>
        <SceneLights
          sceneId="archive"
          lighting={sceneSettings.archive.lighting}
          progressRef={progressRef}
        />
        <SceneObject sceneId="archive" procedural={<ArchiveGrid visible={1} />} />
        {sceneSettings.archive.background.floorVisible ? (
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, sceneSettings.archive.background.floorY, 0]}
            receiveShadow
          >
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color={sceneSettings.archive.background.floorColor} roughness={0.9} />
          </mesh>
        ) : null}
      </group>

      <group ref={networkGroupRef}>
        <SceneLights
          sceneId="journey"
          lighting={sceneSettings.journey.lighting}
          progressRef={progressRef}
        />
        <SceneObject sceneId="journey" procedural={<SynapseNetwork visible={1} />} />
        {sceneSettings.journey.background.floorVisible ? (
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, sceneSettings.journey.background.floorY, 0]}
            receiveShadow
          >
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color={sceneSettings.journey.background.floorColor} roughness={0.9} />
          </mesh>
        ) : null}
      </group>
    </>
  );
}

function SceneTypography({
  sceneIndex,
  opacity,
}: {
  sceneIndex: number;
  opacity: number;
}) {
  const scene = SCENES[sceneIndex] ?? SCENES[0];
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-28 z-10 px-8 sm:px-14"
      style={{ opacity }}
    >
      <p className="text-[10px] uppercase tracking-[0.4em] text-[#c9a66b]/80">
        {scene.kicker}
      </p>
      <h3 className="mt-2 text-4xl font-bold tracking-tight text-[#f0ebe3] sm:text-6xl">
        {scene.label}
      </h3>
      <p className="mt-3 max-w-md text-sm text-[#f0ebe3]/55">{scene.body}</p>
    </div>
  );
}

export default function SynapserStudioScroll() {
  const { sceneSettings } = useSynapserModel();
  const progressRef = useRef(0);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneLocalPercent, setSceneLocalPercent] = useState(0);
  const [typoOpacity, setTypoOpacity] = useState(1);
  const initial = sceneSettings.manifesto.cinematicScroll;

  const handleProgress = (p: number) => {
    const idx = getActiveSceneIndex(p);
    setSceneIndex(idx);
    const local = getSceneLocalProgress(p, idx);
    setSceneLocalPercent(Math.round(local * 100));
    const fadeEdge = local < 0.08 ? local / 0.08 : local > 0.92 ? (1 - local) / 0.08 : 1;
    setTypoOpacity(fadeEdge);
  };

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={400}
      stickyClassName="bg-[#0f0c0a] text-[#f0ebe3]"
      hint="↓ 스크롤 — 원거리에서 줌인 · 유지 · 줌아웃 후 씬 전환"
      progressLabel="Scene Progress"
      showProgress={false}
    >
      <Canvas
        camera={{
          position: [0, 1.4, initial.distanceFar],
          fov: sceneSettings.manifesto.camera.fov,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
      >
        <ScrollWorld progressRef={progressRef} />
      </Canvas>

      <SceneTypography sceneIndex={sceneIndex} opacity={typoOpacity} />

      <div className="pointer-events-none absolute left-6 top-14 z-10 font-mono text-[10px] text-[#f0ebe3]/35">
        SCENE {sceneIndex + 1} / {SCENES.length}
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6 z-20 text-right">
        <p className="text-[10px] uppercase tracking-widest text-[#f0ebe3]/50">Scene Progress</p>
        <p className="text-3xl font-bold tabular-nums text-[#f0ebe3]">{sceneLocalPercent}%</p>
      </div>
    </LabStickyScroll>
  );
}
