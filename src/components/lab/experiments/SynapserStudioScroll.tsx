"use client";

import {
  useCallback,
  createRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, useGLTF } from "@react-three/drei";
import type { Group, PerspectiveCamera } from "three";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";
import { applySynapserPointerOrbit } from "./synapser-camera-pointer";
import type { SynapserObjectHoverState } from "./synapser-object-hover";
import {
  SYNAPSER_AUTO_ROTATE_MAX_RAD_PER_SEC,
  SYNAPSER_FLOAT_MAX_AMP,
  SYNAPSER_FLOAT_MAX_HZ,
  SYNAPSER_FLOAT_MAX_WOBBLE,
} from "@/lib/synapser-object-motion";
import SynapserMeshGlitchBinder from "./SynapserObjectGlitch";
import { useSynapserModel } from "./SynapserModelContext";
import SynapserScrollGlitchOverlay, {
  synapserGlitchTextStyle,
} from "./SynapserScrollGlitchOverlay";
import { applySynapserScrollGlitch, DEFAULT_SYNAPSER_SCROLL_GLITCH, getSynapserFlatGlitchDisplayFromLevel, getSynapserFlatGlitchTransitionMs, getSynapserGlitchDisplay, getSynapserParticleNoiseFromDisplay } from "@/lib/synapser-scroll-glitch";
import type { SynapserScrollGlitchSettings } from "@/lib/synapser-scroll-glitch";
import type { SynapserSceneDefinition, SynapserProceduralType } from "@/lib/synapser-project-state";
import {
  getActiveSceneIndex,
  getCinematicCamera,
  getCinematicSceneVisibilities,
  getSceneLocalProgress,
  getSynapserTypographyLayoutClasses,
  normalizeSynapserTypography,
  sampleCameraKeyframes,
  sceneDefaults,
  type SynapserSceneId,
  type SynapserSceneSettings,
  type SynapserTypographySettings,
} from "@/lib/synapser-scene-settings";
import { getObjectAnchorWorldOffset } from "@/lib/synapser-anchor-layout";
import {
  getCinematicZoomRuntime,
  resetCinematicZoomRuntime,
  resolveEffectiveGlobalProgress,
  stepCinematicZoom,
  type CinematicZoomRuntime,
} from "@/lib/synapser-cinematic-zoom";

/** Floor plane spans far enough that cinematic camera angles never clip edges. */
const FLOOR_PLANE_SIZE = 20 * 100;

function SceneProcedural({ type }: { type: SynapserProceduralType }) {
  switch (type) {
    case "grid":
      return <ArchiveGrid visible={1} />;
    case "network":
      return <SynapseNetwork visible={1} />;
    case "torus":
    default:
      return <ManifestoObject visible={1} />;
  }
}

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
  sceneOrder,
}: {
  sceneId: SynapserSceneId;
  lighting: SynapserSceneSettings["lighting"];
  progressRef: React.RefObject<number>;
  sceneOrder: SynapserSceneId[];
}) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const lightRefs = useRef<(THREE.Light | null)[]>([]);

  useFrame(() => {
    const visibility = getCinematicSceneVisibilities(progressRef.current, sceneOrder)[sceneId] ?? 0;
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
  const motion = sceneSettings[sceneId]?.objectMotion ?? sceneDefaults().objectMotion;
  const groupRef = useRef<Group>(null);
  const floatGroupRef = useRef<Group>(null);
  const { pointer } = useThree();
  const floatPhase = useRef(Math.random() * Math.PI * 2);
  const lookAtCenter = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    const g = groupRef.current;
    const f = floatGroupRef.current;
    if (!g) return;

    const persp = state.camera as PerspectiveCamera;
    const dist = state.camera.position.distanceTo(lookAtCenter.current);
    const anchorOff = getObjectAnchorWorldOffset(
      motion.anchor,
      dist,
      persp.fov,
      persp.aspect,
    );
    g.position.set(
      motion.groupOffset[0] + anchorOff[0],
      motion.groupOffset[1] + anchorOff[1],
      motion.groupOffset[2] + anchorOff[2],
    );

    const autoRad = SYNAPSER_AUTO_ROTATE_MAX_RAD_PER_SEC * delta;
    g.rotation.x += motion.autoRotateX * autoRad;
    g.rotation.y += motion.autoRotateY * autoRad;
    g.rotation.z += motion.autoRotateZ * autoRad;
    g.rotation.x += pointer.y * motion.pointerTiltX;
    g.rotation.y += pointer.x * motion.pointerTiltY;

    if (motion.floatEnabled && f && motion.floatSpeed > 0 && motion.floatIntensity > 0) {
      floatPhase.current += delta * motion.floatSpeed * SYNAPSER_FLOAT_MAX_HZ * Math.PI * 2;
      f.position.y = Math.sin(floatPhase.current) * motion.floatIntensity * SYNAPSER_FLOAT_MAX_AMP;
      if (motion.rotationIntensity > 0) {
        f.rotation.x =
          Math.sin(floatPhase.current * 0.7) * motion.rotationIntensity * SYNAPSER_FLOAT_MAX_WOBBLE;
        f.rotation.z =
          Math.cos(floatPhase.current * 0.5) * motion.rotationIntensity * SYNAPSER_FLOAT_MAX_WOBBLE;
      } else {
        f.rotation.x = 0;
        f.rotation.z = 0;
      }
    } else if (f) {
      f.position.y = 0;
      f.rotation.x = 0;
      f.rotation.z = 0;
    }
  });

  return (
    <group ref={groupRef} scale={motion.groupScale}>
      {motion.floatEnabled ? <group ref={floatGroupRef}>{children}</group> : children}
    </group>
  );
}

function SceneObject({
  sceneId,
  procedural,
  displayGlitchRef,
  progressRef,
  scrollGlitch,
  objectHoverRef,
}: {
  sceneId: SynapserSceneId;
  procedural: ReactNode;
  displayGlitchRef: React.RefObject<number>;
  progressRef: React.RefObject<number>;
  scrollGlitch: SynapserScrollGlitchSettings;
  objectHoverRef: React.RefObject<SynapserObjectHoverState>;
}) {
  const { scenes } = useSynapserModel();
  const scene = scenes[sceneId];

  return (
    <AnimatedSceneContent sceneId={sceneId}>
      <SynapserMeshGlitchBinder
        displayGlitchRef={displayGlitchRef}
        progressRef={progressRef}
        sceneId={sceneId}
        settings={scrollGlitch}
        objectHoverRef={objectHoverRef}
      >
        {scene.mode === "custom" && scene.modelUrl ? (
          <Suspense fallback={null}>
            <CustomImportedModel key={scene.modelUrl} url={scene.modelUrl} scale={scene.scale} />
          </Suspense>
        ) : (
          procedural
        )}
      </SynapserMeshGlitchBinder>
    </AnimatedSceneContent>
  );
}

function EnvironmentController({
  progressRef,
  sceneOrder,
  sceneSettings,
}: {
  progressRef: React.RefObject<number>;
  sceneOrder: SynapserSceneId[];
  sceneSettings: Record<SynapserSceneId, SynapserSceneSettings>;
}) {
  const { scene, gl } = useThree();
  const fogRef = useRef<THREE.Fog | null>(null);

  useFrame(() => {
    const vis = getCinematicSceneVisibilities(progressRef.current, sceneOrder);
    const canvasColor = blendHex(
      sceneOrder.map((id) => ({
        hex: sceneSettings[id]?.background.canvasColor ?? "#0f0c0a",
        weight: vis[id] ?? 0,
      })),
    );
    const fogColor = blendHex(
      sceneOrder.map((id) => ({
        hex: sceneSettings[id]?.background.fogColor ?? "#0f0c0a",
        weight: vis[id] ?? 0,
      })),
    );
    const fogNear = Math.max(
      0.1,
      weightedAverage(
        sceneOrder.map((id) => ({ value: sceneSettings[id]?.background.fogNear ?? 4, weight: vis[id] ?? 0 })),
      ),
    );
    const fogFar = Math.max(
      fogNear + 0.5,
      weightedAverage(
        sceneOrder.map((id) => ({ value: sceneSettings[id]?.background.fogFar ?? 14, weight: vis[id] ?? 0 })),
      ),
    );
    const fogEnabled = sceneOrder.some(
      (id) => sceneSettings[id]?.background.fogEnabled && (vis[id] ?? 0) > 0.05,
    );

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

function ScrollWorld({
  progressRef,
  displayGlitchRef,
  cinematicZoomRuntimesRef,
  displayLocalProgressRef,
  effectiveProgressRef,
}: {
  progressRef: React.RefObject<number>;
  displayGlitchRef: React.RefObject<number>;
  cinematicZoomRuntimesRef: React.RefObject<Record<SynapserSceneId, CinematicZoomRuntime>>;
  displayLocalProgressRef: React.RefObject<number>;
  effectiveProgressRef: React.RefObject<number>;
}) {
  const { sceneList, sceneOrder, sceneSettings, scrollGlitchMap } = useSynapserModel();
  const groupRefs = useRef<Record<SynapserSceneId, React.RefObject<Group | null>>>({});
  const timeRefs = useRef<Record<SynapserSceneId, number>>({});
  const { pointer, camera } = useThree();
  const lookAtTarget = useRef(new THREE.Vector3());
  const objectHoverRef = useRef<SynapserObjectHoverState>({ blend: 0, sceneId: null });
  const raycaster = useRef(new THREE.Raycaster());
  const hoverMeshes = useRef<THREE.Object3D[]>([]);
  const meshScanFrame = useRef(0);
  const smoothedPointer = useRef({ x: 0, y: 0 });

  const sceneCount = sceneOrder.length;

  const getGroupRef = (id: SynapserSceneId) => {
    if (!groupRefs.current[id]) {
      groupRefs.current[id] = createRef<Group>();
    }
    return groupRefs.current[id];
  };

  useFrame((state, delta) => {
    const rawP = progressRef.current;
    const deltaMs = delta * 1000;

    sceneOrder.forEach((id, index) => {
      const settings = sceneSettings[id];
      if (!settings?.cinematicScroll.enabled) return;
      const rawLocalP = getSceneLocalProgress(rawP, index, sceneCount);
      const weight = getCinematicSceneVisibilities(rawP, sceneOrder)[id] ?? 0;
      const runtime = getCinematicZoomRuntime(cinematicZoomRuntimesRef.current!, id);
      if (weight <= 0.001) {
        if (runtime.phase !== "before-in") resetCinematicZoomRuntime(cinematicZoomRuntimesRef.current!, id);
        return;
      }
      stepCinematicZoom(runtime, rawLocalP, settings.cinematicScroll, deltaMs);
    });

    const effectiveP = resolveEffectiveGlobalProgress(
      rawP,
      sceneOrder,
      sceneCount,
      sceneSettings,
      cinematicZoomRuntimesRef.current!,
      getActiveSceneIndex,
    );
    const vis = getCinematicSceneVisibilities(effectiveP, sceneOrder);
    const activeIdx = getActiveSceneIndex(effectiveP, sceneCount);
    const activeId = sceneOrder[activeIdx];
    if (activeId) {
      const activeRuntime = cinematicZoomRuntimesRef.current?.[activeId];
      displayLocalProgressRef.current = activeRuntime?.displayLocalP ?? getSceneLocalProgress(effectiveP, activeIdx, sceneCount);
    }
    effectiveProgressRef.current = effectiveP;

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
    let orbitYaw = 0;
    let orbitPitch = 0;
    let hoverZoomPull = 0;
    let hoverZoomFovPull = 0;
    let hoverZoomDamp = 0;
    let orbitDamp = 0;
    let orbitEdgePower = 0;

    sceneOrder.forEach((id, index) => {
      const weight = vis[id] ?? 0;
      const settings = sceneSettings[id];
      if (!settings) return;
      const localP = getSceneLocalProgress(effectiveP, index, sceneCount);
      const groupRef = getGroupRef(id);
      if (groupRef.current) groupRef.current.scale.setScalar(weight);

      if (weight <= 0.001) return;

      if (timeRefs.current[id] === undefined) timeRefs.current[id] = 0;
      timeRefs.current[id] += delta;
      orbitYaw += settings.camera.pointerDriftX * weight;
      orbitPitch += settings.camera.pointerDriftY * weight;
      hoverZoomPull += settings.camera.hoverZoomPull * weight;
      hoverZoomFovPull += settings.camera.hoverZoomFovPull * weight;
      hoverZoomDamp += settings.camera.hoverZoomDamp * weight;
      orbitDamp += settings.camera.orbitDamp * weight;
      orbitEdgePower += settings.camera.orbitEdgePower * weight;

      let sample;
      if (settings.cinematicScroll.enabled) {
        const runtime = getCinematicZoomRuntime(cinematicZoomRuntimesRef.current!, id);
        const zoomT = runtime.zoomT;
        sample = getCinematicCamera(settings, zoomT);
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
      orbitYaw /= total;
      orbitPitch /= total;
      hoverZoomPull /= total;
      hoverZoomFovPull /= total;
      hoverZoomDamp /= total;
      orbitDamp /= total;
      orbitEdgePower /= total;
    } else {
      const fallbackId = sceneOrder[0];
      const cam = fallbackId ? sceneSettings[fallbackId]?.camera : undefined;
      if (cam) {
        orbitYaw = cam.pointerDriftX;
        orbitPitch = cam.pointerDriftY;
        hoverZoomPull = cam.hoverZoomPull;
        hoverZoomFovPull = cam.hoverZoomFovPull;
        hoverZoomDamp = cam.hoverZoomDamp;
        orbitDamp = cam.orbitDamp;
        orbitEdgePower = cam.orbitEdgePower;
      }
    }

    smoothedPointer.current.x = THREE.MathUtils.damp(
      smoothedPointer.current.x,
      pointer.x,
      orbitDamp,
      delta,
    );
    smoothedPointer.current.y = THREE.MathUtils.damp(
      smoothedPointer.current.y,
      pointer.y,
      orbitDamp,
      delta,
    );

    const orbited = applySynapserPointerOrbit(
      posX,
      posY,
      posZ,
      lookX,
      lookY,
      lookZ,
      smoothedPointer.current.x,
      smoothedPointer.current.y,
      orbitYaw,
      orbitPitch,
      orbitEdgePower,
    );
    posX = orbited.x;
    posY = orbited.y;
    posZ = orbited.z;

    if (meshScanFrame.current++ % 20 === 0) {
      const nextMeshes: THREE.Object3D[] = [];
      sceneOrder.forEach((id) => {
        if ((vis[id] ?? 0) < 0.05) return;
        const groupRef = getGroupRef(id);
        if (!groupRef.current) return;
        groupRef.current.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh)) return;
          if (obj.userData.synapserGlitchShell || obj.userData.synapserFloor) return;
          nextMeshes.push(obj);
        });
      });
      hoverMeshes.current = nextMeshes;
    }

    let hoveredScene: SynapserSceneId | null = null;
    if (hoverMeshes.current.length > 0) {
      raycaster.current.setFromCamera(pointer, camera);
      const hits = raycaster.current.intersectObjects(hoverMeshes.current, false);
      if (hits.length > 0) {
        let node: THREE.Object3D | null = hits[0].object;
        while (node) {
          if (typeof node.userData.synapserSceneId === "string") {
            hoveredScene = node.userData.synapserSceneId;
            break;
          }
          node = node.parent;
        }
      }
    }

    const hoverTarget = hoveredScene ? 1 : 0;
    const nextBlend = THREE.MathUtils.damp(
      objectHoverRef.current.blend,
      hoverTarget,
      hoverZoomDamp,
      delta,
    );
    objectHoverRef.current.blend = nextBlend;
    objectHoverRef.current.sceneId =
      nextBlend > 0.02 && hoveredScene ? hoveredScene : null;

    const zoom = nextBlend * hoverZoomPull;
    posX += (lookX - posX) * zoom;
    posY += (lookY - posY) * zoom;
    posZ += (lookZ - posZ) * zoom;
    fov -= nextBlend * hoverZoomFovPull;

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
      <EnvironmentController
        progressRef={effectiveProgressRef}
        sceneOrder={sceneOrder}
        sceneSettings={sceneSettings}
      />

      {sceneList.map((def) => {
        const settings = sceneSettings[def.id];
        if (!settings) return null;
        return (
          <group
            key={def.id}
            ref={getGroupRef(def.id)}
            userData={{ synapserSceneId: def.id }}
          >
            <SceneLights
              sceneId={def.id}
              lighting={settings.lighting}
              progressRef={effectiveProgressRef}
              sceneOrder={sceneOrder}
            />
            <SceneObject
              sceneId={def.id}
              procedural={<SceneProcedural type={def.procedural} />}
              displayGlitchRef={displayGlitchRef}
              progressRef={effectiveProgressRef}
              scrollGlitch={scrollGlitchMap[def.id] ?? scrollGlitchMap[sceneOrder[0]]}
              objectHoverRef={objectHoverRef}
            />
            {settings.background.floorVisible ? (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, settings.background.floorY, 0]}
                receiveShadow
                userData={{ synapserFloor: true }}
              >
                <planeGeometry args={[FLOOR_PLANE_SIZE, FLOOR_PLANE_SIZE]} />
                <meshStandardMaterial color={settings.background.floorColor} roughness={0.9} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </>
  );
}

function SceneTypography({
  scene,
  opacity,
  flatGlitchUi,
  flat,
  typography,
}: {
  scene: SynapserSceneDefinition;
  opacity: number;
  flatGlitchUi: number;
  flat: SynapserScrollGlitchSettings["flat"];
  typography: SynapserTypographySettings;
}) {
  const layout = getSynapserTypographyLayoutClasses(typography);
  const transitionMs = getSynapserFlatGlitchTransitionMs(flat);
  const glitchStyle = synapserGlitchTextStyle(flatGlitchUi, flat);
  const kickerStyle =
    flat.enabled && flatGlitchUi > 0.2
      ? {
          textShadow: `${Math.round(flatGlitchUi * 6 * flat.rgbShift)}px 0 rgba(255,0,120,0.7), ${-Math.round(flatGlitchUi * 6 * flat.rgbShift)}px 0 rgba(0,220,255,0.6)`,
        }
      : undefined;
  const motionStyle = {
    transitionDuration: `${transitionMs}ms`,
    transitionProperty: "color, text-shadow, transform, opacity",
  } as const;

  return (
    <div
      className={layout.container}
      style={{
        opacity,
        ...layout.anchorStyle,
        transitionProperty: "color, text-shadow, transform, opacity, left, top",
      }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.4em] text-[#c9a66b]/80"
        style={{ ...kickerStyle, ...motionStyle }}
      >
        {scene.kicker}
      </p>
      <h3
        className="mt-2 text-4xl font-bold tracking-tight text-[#f0ebe3] sm:text-6xl"
        style={{ ...glitchStyle, ...motionStyle }}
      >
        {scene.label}
      </h3>
      <p className={`mt-3 text-sm text-[#f0ebe3]/55 ${layout.body}`} style={motionStyle}>
        {scene.body}
      </p>
    </div>
  );
}

export default function SynapserStudioScroll() {
  const { sceneSettings, sceneList, sceneOrder, scrollGlitchMap } = useSynapserModel();
  const progressRef = useRef(0);
  const effectiveProgressRef = useRef(0);
  const displayLocalProgressRef = useRef(0);
  const cinematicZoomRuntimesRef = useRef<Record<SynapserSceneId, CinematicZoomRuntime>>({});
  const glitchRef = useRef(0);
  const displayGlitchRef = useRef(0);
  const prevSceneRef = useRef(0);
  const prevProgressRef = useRef(0);
  const sceneIndexRef = useRef(0);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [sceneLocalPercent, setSceneLocalPercent] = useState(0);
  const [typoOpacity, setTypoOpacity] = useState(1);
  const [glitchUi, setGlitchUi] = useState(0);
  const [flatGlitchUi, setFlatGlitchUi] = useState(0);
  const [particleNoiseUi, setParticleNoiseUi] = useState(0);
  const sceneCount = sceneOrder.length;
  const firstSceneId = sceneOrder[0];
  const initial = firstSceneId ? sceneSettings[firstSceneId]?.cinematicScroll : sceneDefaults().cinematicScroll;
  const activeSceneId = sceneOrder[sceneIndex] ?? firstSceneId ?? "";
  const activeSceneDef = sceneList.find((s) => s.id === activeSceneId) ?? sceneList[0];
  const activeScrollGlitch =
    (activeSceneId ? scrollGlitchMap[activeSceneId] : undefined) ??
    (firstSceneId ? scrollGlitchMap[firstSceneId] : undefined);
  const activeTypography = normalizeSynapserTypography(
    activeSceneId ? sceneSettings[activeSceneId]?.typography : undefined,
  );

  useEffect(() => {
    let frame = 0;
    const setIfChanged = (setter: Dispatch<SetStateAction<number>>, next: number) => {
      setter((prev) => (Math.abs(prev - next) < 0.002 ? prev : next));
    };
    const tick = () => {
      const effectiveP = effectiveProgressRef.current;
      const idx = getActiveSceneIndex(effectiveP, sceneCount);
      sceneIndexRef.current = idx;
      setSceneIndex((prev) => (prev === idx ? prev : idx));

      const nextPercent = Math.round(displayLocalProgressRef.current * 100);
      setSceneLocalPercent((prev) => (prev === nextPercent ? prev : nextPercent));

      const local = displayLocalProgressRef.current;
      const fadeEdge = local < 0.08 ? local / 0.08 : local > 0.92 ? (1 - local) / 0.08 : 1;
      setTypoOpacity((prev) => (Math.abs(prev - fadeEdge) < 0.001 ? prev : fadeEdge));

      const sceneId = sceneOrder[idx] ?? sceneOrder[0];
      const scrollGlitch =
        (sceneId ? scrollGlitchMap[sceneId] : undefined) ??
        (sceneOrder[0] ? scrollGlitchMap[sceneOrder[0]] : undefined);
      if (!scrollGlitch) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (scrollGlitch.enabled) {
        glitchRef.current *= scrollGlitch.decayRate;
        if (glitchRef.current < 0.01) glitchRef.current = 0;
      } else {
        glitchRef.current = 0;
      }
      const target = getSynapserGlitchDisplay(glitchRef, scrollGlitch);
      const lerp = scrollGlitch.displayLerp;
      displayGlitchRef.current += (target - displayGlitchRef.current) * lerp;
      const display = displayGlitchRef.current;
      setIfChanged(setGlitchUi, display);
      setIfChanged(
        setFlatGlitchUi,
        getSynapserFlatGlitchDisplayFromLevel(display, scrollGlitch),
      );
      setIfChanged(
        setParticleNoiseUi,
        getSynapserParticleNoiseFromDisplay(display, scrollGlitch),
      );
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [scrollGlitchMap, sceneOrder, sceneCount]);

  const handleProgress = useCallback(
    (p: number) => {
      progressRef.current = p;
      effectiveProgressRef.current = p;

      const idx = getActiveSceneIndex(p, sceneCount);
      const sceneId = sceneOrder[idx] ?? sceneOrder[0];
      const scrollGlitch =
        (sceneId ? scrollGlitchMap[sceneId] : undefined) ??
        (sceneOrder[0] ? scrollGlitchMap[sceneOrder[0]] : undefined);

      const nextIdx =
        scrollGlitch != null
          ? applySynapserScrollGlitch({
              progress: p,
              prevSceneIndex: prevSceneRef.current,
              prevProgress: prevProgressRef.current,
              glitchRef,
              settings: scrollGlitch,
              sceneCount,
            })
          : idx;
      prevSceneRef.current = nextIdx;
      prevProgressRef.current = p;

      const scrollIdx = getActiveSceneIndex(effectiveProgressRef.current, sceneCount);
      sceneIndexRef.current = scrollIdx;
    },
    [scrollGlitchMap, sceneOrder, sceneCount],
  );

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={400}
      stickyClassName="bg-[#0f0c0a] text-[#f0ebe3]"
      hint="↓ 스크롤 — 진입 시 자동 줌인 · 유지 · 80% 이후 자동 줌아웃·씬 전환"
      progressLabel="Scene Progress"
      showProgress={false}
    >
      <div className="relative h-full w-full">
      <Canvas
        camera={{
          position: [0, 1.4, initial?.distanceFar ?? 8],
          fov: (firstSceneId ? sceneSettings[firstSceneId]?.camera.fov : undefined) ?? 45,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
      >
        <ScrollWorld
          progressRef={progressRef}
          displayGlitchRef={displayGlitchRef}
          cinematicZoomRuntimesRef={cinematicZoomRuntimesRef}
          displayLocalProgressRef={displayLocalProgressRef}
          effectiveProgressRef={effectiveProgressRef}
        />
      </Canvas>

      {activeScrollGlitch ? (
        <SynapserScrollGlitchOverlay
          displayGlitchRef={displayGlitchRef}
          particleNoiseUi={particleNoiseUi}
          settings={activeScrollGlitch}
        />
      ) : null}

      {activeSceneDef ? (
        <SceneTypography
          scene={activeSceneDef}
          opacity={typoOpacity}
          flatGlitchUi={flatGlitchUi}
          flat={activeScrollGlitch?.flat ?? DEFAULT_SYNAPSER_SCROLL_GLITCH.flat}
          typography={activeTypography}
        />
      ) : null}

      {glitchUi > 0.55 ? (
        <div
          className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,${glitchUi * 0.08}) 2px,
              rgba(0,0,0,${glitchUi * 0.08}) 4px
            )`,
          }}
          aria-hidden
        />
      ) : null}

      <div className="pointer-events-none absolute left-6 top-14 z-10 font-mono text-[10px] text-[#f0ebe3]/35">
        SCENE {sceneIndex + 1} / {sceneCount}
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6 z-20 text-right">
        <p className="text-[10px] uppercase tracking-widest text-[#f0ebe3]/50">Scene Progress</p>
        <p
          className="text-3xl font-bold tabular-nums text-[#f0ebe3] transition-colors duration-75"
          style={{ color: glitchUi > 0.4 ? "#ff0066" : "#f0ebe3" }}
        >
          {sceneLocalPercent}%
        </p>
        {activeScrollGlitch?.flat.enabled ? (
          <p className="mt-2 text-[10px] uppercase tracking-widest text-[#f0ebe3]/35">Flat glitch</p>
        ) : null}
        {activeScrollGlitch?.flat.enabled ? (
          <p className="font-mono text-lg font-bold tabular-nums text-[#00d4ff]/80">
            {Math.round(flatGlitchUi * 100)}%
          </p>
        ) : null}
      </div>
      </div>
    </LabStickyScroll>
  );
}
