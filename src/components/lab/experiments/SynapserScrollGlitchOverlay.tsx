"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { SynapserScrollGlitchSettings } from "@/lib/synapser-scroll-glitch";
import { getSynapserParticleNoiseFromDisplay } from "@/lib/synapser-scroll-glitch";

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uGlitch;
uniform float uGrit;
uniform float uScanline;
uniform float uIrregularity;
uniform float uParticleDensity;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float rectParticle(vec2 uv, vec2 gridScale, float timeSeed, float cutoff, float g) {
  vec2 uvGrid = uv * gridScale;
  vec2 cell = floor(uvGrid);
  vec2 fracUv = fract(uvGrid);
  float h = hash(cell + timeSeed);
  if (h < cutoff - g * 0.02) return 0.0;

  float wide = step(0.62, hash(cell + 4.1));
  float w = mix(0.06 + hash(cell + 1.7) * 0.22, 0.18 + hash(cell + 2.9) * 0.42, wide);
  float hgt = mix(0.015 + hash(cell + 2.3) * 0.05, 0.03 + hash(cell + 3.5) * 0.09, wide);
  return step(fracUv.x, w) * step(fracUv.y, hgt);
}

void main() {
  float g = uGlitch;
  if (g < 0.004) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec2 uv = vUv;
  float tick = floor(uTime * (14.0 + uIrregularity * 22.0));

  float fine = rectParticle(uv, vec2(460.0, 340.0), tick, 0.993 - uParticleDensity * 0.006, g);
  float mid = rectParticle(uv, vec2(210.0, 155.0), tick * 1.37, 0.978 - uParticleDensity * 0.012, g);
  float coarse = rectParticle(uv, vec2(95.0, 72.0), tick * 0.81, 0.935 - uParticleDensity * 0.028, g);
  float particles = max(max(fine, mid), coarse);

  vec2 cell = floor(uv * vec2(460.0, 340.0));
  float tone = 0.68 + hash(cell + tick) * 0.32;
  vec3 color = vec3(tone);

  float chromaHit = step(0.982 - g * 0.01, hash(cell + tick * 2.17));
  color = mix(
    color,
    mix(vec3(0.0, 0.82, 1.0), vec3(1.0, 0.08, 0.5), hash(cell + 11.0)),
    chromaHit * g * 0.55
  );

  float scan = pow(
    abs(sin(uv.y * (760.0 + uIrregularity * 320.0) + uTime * 1.8)),
    1.35
  ) * uScanline * g * 0.05;

  float alpha = particles * g * uGrit * uParticleDensity * 0.95 + scan;
  gl_FragColor = vec4(color + vec3(scan * 0.6), min(alpha, 0.48));
}
`;

function ScreenParticlePlane({
  displayGlitchRef,
  settings,
}: {
  displayGlitchRef: React.RefObject<number>;
  settings: SynapserScrollGlitchSettings;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const { viewport } = useThree();
  const layer = settings.screen;

  const uniforms = useRef({
    uTime: { value: 0 },
    uGlitch: { value: 0 },
    uGrit: { value: layer.gritOpacity },
    uScanline: { value: layer.scanlineOpacity },
    uIrregularity: { value: layer.irregularity },
    uParticleDensity: { value: layer.particleDensity },
  }).current;

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    const display = getSynapserParticleNoiseFromDisplay(displayGlitchRef.current, settings);
    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    materialRef.current.uniforms.uGlitch.value = display;
    materialRef.current.uniforms.uGrit.value = layer.gritOpacity;
    materialRef.current.uniforms.uScanline.value = layer.scanlineOpacity;
    materialRef.current.uniforms.uIrregularity.value = layer.irregularity;
    materialRef.current.uniforms.uParticleDensity.value = layer.particleDensity;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

type SynapserScrollGlitchOverlayProps = {
  displayGlitchRef: React.RefObject<number>;
  particleNoiseUi: number;
  settings: SynapserScrollGlitchSettings;
};

export default function SynapserScrollGlitchOverlay({
  displayGlitchRef,
  particleNoiseUi,
  settings,
}: SynapserScrollGlitchOverlayProps) {
  const layer = settings.screen;
  if (!layer.enabled || particleNoiseUi < 0.006) return null;

  const scanlineAlpha = particleNoiseUi * layer.scanlineOpacity * 0.22;

  return (
    <>
      <Canvas
        className="pointer-events-none absolute inset-0 z-30"
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1, near: 0.1, far: 10 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ScreenParticlePlane displayGlitchRef={displayGlitchRef} settings={settings} />
      </Canvas>

      {particleNoiseUi > 0.012 ? (
        <div
          className="pointer-events-none absolute inset-0 z-[31]"
          style={{
            opacity: scanlineAlpha,
            mixBlendMode: "soft-light",
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              rgba(255,255,255,${0.04 + particleNoiseUi * 0.06}) 1px,
              rgba(255,255,255,${0.04 + particleNoiseUi * 0.06}) 3px
            )`,
          }}
          aria-hidden
        />
      ) : null}
    </>
  );
}

export function synapserGlitchTextStyle(
  flatGlitchUi: number,
  flat: SynapserScrollGlitchSettings["flat"],
) {
  if (!flat.enabled || flatGlitchUi < 0.05) return undefined;
  const glitchPx = Math.round(flatGlitchUi * 6 * flat.rgbShift);
  return {
    textShadow: `${glitchPx * 1.2}px 0 #ff0066, ${-glitchPx}px 0 #00d4ff, 0 ${glitchPx * 0.5}px #0a0a0a`,
    transform:
      flatGlitchUi > 0.3
        ? `translateX(${(flatGlitchUi - 0.3) * 8 * flat.sliceStrength}px)`
        : undefined,
  } as const;
}
