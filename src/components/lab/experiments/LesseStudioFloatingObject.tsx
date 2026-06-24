"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group } from "three";

function FloatingForm({ pointerRef }: { pointerRef: React.RefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const { x, y } = pointerRef.current;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.x = y * 0.18 + Math.sin(t * 0.35) * 0.04;
    groupRef.current.rotation.y = x * 0.22 + Math.cos(t * 0.28) * 0.05;
    groupRef.current.position.x = x * 0.12;
    groupRef.current.position.y = y * 0.08;
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.35}>
        <mesh>
          <torusKnotGeometry args={[0.72, 0.22, 128, 24]} />
          <meshStandardMaterial
            color="#c8c4bc"
            metalness={0.08}
            roughness={0.62}
          />
        </mesh>
      </Float>
      <mesh rotation={[0.6, 0.4, 0]} position={[0.55, -0.35, -0.2]}>
        <boxGeometry args={[0.45, 0.45, 0.12]} />
        <meshStandardMaterial color="#ddd9d2" metalness={0.05} roughness={0.7} />
      </mesh>
      <mesh rotation={[-0.3, -0.5, 0.2]} position={[-0.5, 0.4, 0.15]}>
        <cylinderGeometry args={[0.18, 0.22, 0.08, 32]} />
        <meshStandardMaterial color="#b8b4ac" metalness={0.1} roughness={0.58} />
      </mesh>
    </group>
  );
}

type LesseStudioFloatingObjectProps = {
  className?: string;
  opacity?: number;
};

export default function LesseStudioFloatingObject({
  className = "",
  opacity = 1,
}: LesseStudioFloatingObjectProps) {
  const pointerRef = useRef({ x: 0, y: 0 });

  return (
    <div
      className={`${className}`}
      style={{ opacity }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        pointerRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      }}
      onPointerLeave={() => {
        pointerRef.current.x = 0;
        pointerRef.current.y = 0;
      }}
    >
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0, 3.8], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.85} color="#faf9f6" />
        <directionalLight position={[3, 4, 5]} intensity={0.9} color="#ffffff" />
        <directionalLight position={[-4, 2, 2]} intensity={0.25} color="#e8e6e1" />
        <FloatingForm pointerRef={pointerRef} />
      </Canvas>
    </div>
  );
}
