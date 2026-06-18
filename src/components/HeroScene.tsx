"use client";

import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";

export default function HeroScene() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 3]} intensity={1.2} />
      <Float speed={1.5} rotationIntensity={1} floatIntensity={1.5}>
        <mesh>
          <icosahedronGeometry args={[1.4, 1]} />
          <MeshDistortMaterial
            color="#3b82f6"
            distort={0.35}
            speed={2}
            roughness={0.2}
            metalness={0.6}
          />
        </mesh>
      </Float>
    </Canvas>
  );
}
