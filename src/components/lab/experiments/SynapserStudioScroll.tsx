"use client";

import { useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Line, useGLTF } from "@react-three/drei";
import type { Group } from "three";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";
import { useSynapserModel } from "./SynapserModelContext";

const SCENES = [
  {
    id: "manifesto",
    label: "MANIFESTO",
    kicker: "Lisbon Digital Atelier",
    body: "Craft meets cinematic scroll.",
  },
  {
    id: "archive",
    label: "ARCHIVE",
    kicker: "Selected Works",
    body: "Projects drift into focus.",
  },
  {
    id: "journey",
    label: "JOURNEY",
    kicker: "Synapser Network",
    body: "Nodes connect — ideas flow.",
  },
] as const;

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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function ManifestoObject({ visible }: { visible: number }) {
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.5}>
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
    </Float>
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
        <Line
          key={i}
          points={pts}
          color="#6b8cce"
          lineWidth={1}
          transparent
          opacity={0.6}
        />
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

  return (
    <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.4}>
      <primitive object={object} />
    </Float>
  );
}

function ScrollWorld({ progressRef }: { progressRef: React.RefObject<number> }) {
  const { mode, modelUrl, scale } = useSynapserModel();
  const rootRef = useRef<Group>(null!);
  const manifestoGroupRef = useRef<Group>(null!);
  const archiveGroupRef = useRef<Group>(null!);
  const networkGroupRef = useRef<Group>(null!);
  const customGroupRef = useRef<Group>(null!);
  const { pointer, camera } = useThree();

  useFrame(() => {
    const p = progressRef.current;

    const manifestoVis = Math.max(0, 1 - p * 3);
    let archiveVis = 0;
    if (p >= 1 / 3 && p <= 2 / 3) {
      const local = (p - 1 / 3) / (1 / 3);
      archiveVis =
        local < 0.12 ? local / 0.12 : local > 0.88 ? (1 - local) / 0.12 : 1;
    }
    const networkVis = p < 2 / 3 ? 0 : Math.min(1, (p - 2 / 3) * 3);

    manifestoGroupRef.current.scale.setScalar(manifestoVis);
    archiveGroupRef.current.scale.setScalar(archiveVis);
    networkGroupRef.current.scale.setScalar(networkVis);

    const customVis = Math.max(manifestoVis, archiveVis, networkVis);
    if (customGroupRef.current) {
      customGroupRef.current.scale.setScalar(customVis);
    }

    const camX =
      p < 0.5
        ? lerp(0, 2.2, p / 0.5)
        : lerp(2.2, -1.2, (p - 0.5) / 0.5);
    const camY =
      p < 0.5
        ? lerp(1.4, 2.1, p / 0.5)
        : lerp(2.1, 1.0, (p - 0.5) / 0.5);
    const camZ =
      p < 0.5
        ? lerp(5.5, 4.2, p / 0.5)
        : lerp(4.2, 7.5, (p - 0.5) / 0.5);

    camera.position.x += (camX + pointer.x * 0.45 - camera.position.x) * 0.06;
    camera.position.y += (camY + pointer.y * 0.25 - camera.position.y) * 0.06;
    camera.position.z += (camZ - camera.position.z) * 0.06;
    camera.lookAt(0, 0, 0);

    if (rootRef.current) {
      rootRef.current.rotation.y += pointer.x * 0.002;
      rootRef.current.rotation.x += pointer.y * 0.001;
    }
  });

  return (
    <group ref={rootRef}>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} color="#f5e6d3" />
      <pointLight position={[-3, 2, 2]} intensity={0.5} color="#6b8cce" />

      <group ref={manifestoGroupRef} visible={mode === "default"}>
        <ManifestoObject visible={1} />
      </group>
      <group ref={archiveGroupRef} position={[0, -0.2, 0]} visible={mode === "default"}>
        <ArchiveGrid visible={1} />
      </group>
      <group ref={networkGroupRef} visible={mode === "default"}>
        <SynapseNetwork visible={1} />
      </group>

      {mode === "custom" && modelUrl ? (
        <group ref={customGroupRef}>
          <Suspense fallback={null}>
            <CustomImportedModel key={modelUrl} url={modelUrl} scale={scale} />
          </Suspense>
        </group>
      ) : null}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1410" roughness={0.9} />
      </mesh>
    </group>
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
  const progressRef = useRef(0);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [typoOpacity, setTypoOpacity] = useState(1);

  const handleProgress = (p: number) => {
    const idx = Math.min(2, Math.floor(p * 3));
    setSceneIndex(idx);
    const local = (p * 3) % 1;
    const fadeEdge = local < 0.08 ? local / 0.08 : local > 0.92 ? (1 - local) / 0.08 : 1;
    setTypoOpacity(fadeEdge);
  };

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={400}
      stickyClassName="bg-[#0f0c0a] text-[#f0ebe3]"
      hint="↓ 스크롤 — 화면 고정, 3D 장면이 전환됩니다 · 마우스로 drift"
      progressLabel="Scene Progress"
    >
      <Canvas camera={{ position: [0, 1.4, 5.5], fov: 45 }} dpr={[1, 2]}>
        <fog attach="fog" args={["#0f0c0a", 4, 14]} />
        <ScrollWorld progressRef={progressRef} />
      </Canvas>

      <SceneTypography sceneIndex={sceneIndex} opacity={typoOpacity} />

      <div className="pointer-events-none absolute left-6 top-14 z-10 font-mono text-[10px] text-[#f0ebe3]/35">
        SCENE {sceneIndex + 1} / {SCENES.length}
      </div>
    </LabStickyScroll>
  );
}
