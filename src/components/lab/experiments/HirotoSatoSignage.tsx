"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Text } from "@react-three/drei";
import type { Group } from "three";
import LabStickyScroll from "./LabStickyScroll";

function MirrorScreen() {
  return (
    <group position={[0, 0, -0.4]}>
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[1.7, 1.7]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <Text position={[0, 0.5, 0]} fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle">
        HIROTOS.COM
      </Text>
      <Text position={[0, 0.05, 0]} fontSize={0.2} color="#9ca3af" anchorX="center" anchorY="middle">
        SHOWREEL
      </Text>
      <Text position={[0, -0.5, 0]} fontSize={0.12} color="#facc15" anchorX="center" anchorY="middle">
        START / OPTION
      </Text>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 0.08, 48]} />
        <meshStandardMaterial
          color="#d1d5db"
          metalness={1}
          roughness={0.05}
          transparent
          opacity={0.18}
        />
      </mesh>
    </group>
  );
}

function TagSign() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.4, 0.5, 0.06]} />
        <meshStandardMaterial color="#facc15" roughness={0.4} metalness={0.1} />
      </mesh>
      <Text position={[0, 0, 0.04]} fontSize={0.13} color="#151515" anchorX="center" anchorY="middle">
        HIROTO SATO
      </Text>
    </group>
  );
}

function SignpostArrow() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.8, 0.45, 0.06]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[1.0, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.3, 0.45, 4]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.4} metalness={0.1} />
      </mesh>
      <Text position={[-0.15, 0, 0.04]} fontSize={0.1} color="#f8fafc" anchorX="center" anchorY="middle">
        PROJECTS ARCHIVE
      </Text>
    </group>
  );
}

function SignageCluster({
  scrollOrbitRef,
}: {
  scrollOrbitRef: React.RefObject<number>;
}) {
  const clusterRef = useRef<Group>(null!);
  const target = useRef({ x: 0, y: 0 });
  const { pointer } = useThree();

  useFrame(() => {
    target.current.x = pointer.y * 0.25;
    target.current.y = pointer.x * 0.35;

    if (clusterRef.current) {
      clusterRef.current.rotation.x +=
        (target.current.x - clusterRef.current.rotation.x) * 0.05;
      const targetY = scrollOrbitRef.current + target.current.y * 0.4;
      clusterRef.current.rotation.y +=
        (targetY - clusterRef.current.rotation.y) * 0.06;
    }
  });

  return (
    <group ref={clusterRef}>
      <mesh position={[0, -1.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 3.2, 12]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
      </mesh>
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6} position={[0, 0.6, 0]}>
        <MirrorScreen />
      </Float>
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.8} position={[-1.6, -0.4, 0.6]}>
        <TagSign />
      </Float>
      <Float speed={1.5} rotationIntensity={0.35} floatIntensity={0.7} position={[1.7, -0.9, 0.3]}>
        <SignpostArrow />
      </Float>
    </group>
  );
}

function Scene({ scrollOrbitRef }: { scrollOrbitRef: React.RefObject<number> }) {
  return (
    <>
      <color attach="background" args={["#eeedea"]} />
      <fog attach="fog" args={["#eeedea", 6, 16]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 4]} intensity={1} color="#fff8f0" />
      <directionalLight position={[-2, 1, 3]} intensity={0.35} color="#dbeafe" />
      <SignageCluster scrollOrbitRef={scrollOrbitRef} />
    </>
  );
}

function CameraRig({ cameraZRef }: { cameraZRef: React.RefObject<number> }) {
  useFrame(({ camera }) => {
    camera.position.z += (cameraZRef.current - camera.position.z) * 0.08;
  });
  return null;
}

export default function HirotoSatoSignage() {
  const progressRef = useRef(0);
  const scrollOrbitRef = useRef(0);
  const cameraZRef = useRef(5.5);
  const [phase, setPhase] = useState("표지판 클러스터");

  const handleProgress = (p: number) => {
    scrollOrbitRef.current = p * Math.PI * 2;
    cameraZRef.current = 5.5 - p * 2.2;
    if (p < 0.33) setPhase("표지판 클러스터");
    else if (p < 0.66) setPhase("미러 쇼릴 줌");
    else setPhase("아카이브 내비게이션");
  };

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      stickyClassName="bg-[#eeedea] text-[#111111]"
      hint="↓ 스크롤 — 화면 고정, 클러스터가 회전·줌됩니다"
    >
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} dpr={[1, 2]}>
        <CameraRig cameraZRef={cameraZRef} />
        <Scene scrollOrbitRef={scrollOrbitRef} />
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-24 px-6">
        <p className="text-[10px] uppercase tracking-widest text-[#111111]/40">Scene Phase</p>
        <p className="text-xl font-bold text-[#111111]">{phase}</p>
      </div>
    </LabStickyScroll>
  );
}
