"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uGlitch;
uniform float uSection;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec3 sampleScene(vec2 uv, float section) {
  vec3 paper = vec3(0.93, 0.91, 0.87);
  float grit = noise(uv * 420.0) * 0.06 + hash(uv * 1800.0) * 0.04;
  paper -= grit;

  float margin = smoothstep(0.08, 0.12, uv.x) * (1.0 - smoothstep(0.88, 0.92, uv.x));
  float bandY = 0.72 - section * 0.04;
  float headline = smoothstep(bandY, bandY + 0.02, uv.y)
    * (1.0 - smoothstep(bandY + 0.14, bandY + 0.16, uv.y));
  float bar = smoothstep(0.18, 0.2, uv.x) * (1.0 - smoothstep(0.62, 0.64, uv.x));
  paper = mix(paper, vec3(0.07), headline * bar * margin);

  float thumb = smoothstep(0.18, 0.22, uv.x) * (1.0 - smoothstep(0.48, 0.52, uv.x))
    * smoothstep(0.22, 0.26, uv.y) * (1.0 - smoothstep(0.58, 0.62, uv.y));
  float tone = 0.55 + section * 0.08;
  paper = mix(paper, vec3(tone * 0.4, tone * 0.35, tone * 0.5), thumb * 0.35);

  float scan = sin(uv.y * 900.0) * 0.015;
  paper -= scan;

  return paper;
}

void main() {
  vec2 uv = vUv;
  float g = uGlitch;

  if (g > 0.05) {
    float slice = floor(uv.y * (24.0 + g * 40.0));
    float sliceHash = hash(vec2(slice, floor(uTime * (40.0 + g * 80.0))));
    uv.x += (sliceHash - 0.5) * g * 0.12;
    if (sliceHash > 0.92) {
      uv.y += (hash(vec2(slice, uTime)) - 0.5) * g * 0.04;
    }
  }

  float shift = g * 0.018 + sin(uTime * 60.0) * g * 0.004;
  vec3 cr = sampleScene(uv + vec2(shift, 0.0), uSection);
  vec3 cg = sampleScene(uv, uSection);
  vec3 cb = sampleScene(uv - vec2(shift * 1.4, shift * 0.3), uSection);
  vec3 color = vec3(cr.r, cg.g, cb.b);

  float burst = step(0.97, hash(floor(uv * vec2(120.0, 80.0)) + floor(uTime * 20.0)));
  color = mix(color, vec3(1.0), burst * g * 0.35);

  float vignette = smoothstep(1.2, 0.2, length(uv - 0.5) * 1.4);
  color *= 0.88 + vignette * 0.12;

  gl_FragColor = vec4(color, 1.0);
}
`;

const SECTIONS = [
  {
    category: "Content & Marketing",
    project: "Living Creative Docuseries",
    tag: "Film & Documentary",
  },
  {
    category: "Web & Digital",
    project: "Greenboard",
    tag: "Brand & Identity",
  },
  {
    category: "Brand & Identity",
    project: "United Talent Agency",
    tag: "Content & Marketing",
  },
  {
    category: "Film & Documentary",
    project: "Planet Paradise",
    tag: "View full project",
  },
] as const;

function GlitchPlane({
  progressRef,
  glitchRef,
  sectionRef,
}: {
  progressRef: React.RefObject<number>;
  glitchRef: React.RefObject<number>;
  sectionRef: React.RefObject<number>;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const { viewport } = useThree();

  const uniforms = useRef({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uGlitch: { value: 0 },
    uSection: { value: 0 },
  }).current;

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    glitchRef.current *= 0.9;
    if (glitchRef.current < 0.01) glitchRef.current = 0;

    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    materialRef.current.uniforms.uProgress.value = progressRef.current;
    materialRef.current.uniforms.uGlitch.value = glitchRef.current;
    materialRef.current.uniforms.uSection.value = sectionRef.current;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function GlitchAndGritBurst() {
  const { locale } = useLocale();
  const progressRef = useRef(0);
  const glitchRef = useRef(0);
  const sectionRef = useRef(0);
  const prevSectionRef = useRef(0);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [glitchUi, setGlitchUi] = useState(0);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      setGlitchUi(glitchRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleProgress = (p: number) => {
    progressRef.current = p;

    const idx = Math.min(3, Math.floor(p * 4));
    const local = (p * 4) % 1;

    if (idx !== prevSectionRef.current) {
      glitchRef.current = 1;
      prevSectionRef.current = idx;
    }

    if (local < 0.1) {
      glitchRef.current = Math.max(glitchRef.current, 1 - local / 0.1);
    }

    sectionRef.current = idx;
    setSectionIndex(idx);
  };

  const section = SECTIONS[sectionIndex];
  const glitchPx = Math.round(glitchUi * 6);

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={400}
      stickyClassName="bg-[#edeae4] text-[#0a0a0a]"
      hint={locale === "ko" ? "↓ 스크롤 — 화면 고정, 섹션마다 글리치 버스트" : "↓ Scroll — screen locked, glitch burst per section"}
      progressLabel="Section"
    >
      <div className="relative h-full w-full">
      <Canvas
        className="absolute inset-0"
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1, near: 0.1, far: 10 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <GlitchPlane
          progressRef={progressRef}
          glitchRef={glitchRef}
          sectionRef={sectionRef}
        />
      </Canvas>

      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between px-8 py-10 sm:px-14 sm:py-12">
        <header className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.35em]">
            Glitch&amp;Grit
          </span>
          <div className="flex gap-5 text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/40">
            <span>Work</span>
            <span>Info</span>
            <span>Contact</span>
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-center">
          <p
            className="text-[10px] uppercase tracking-[0.35em] text-[#0a0a0a]/45 transition-all duration-75"
            style={{
              textShadow:
                glitchUi > 0.2
                  ? `${glitchPx}px 0 rgba(255,0,120,0.7), ${-glitchPx}px 0 rgba(0,220,255,0.6)`
                  : "none",
            }}
          >
            {section.category}
          </p>
          <h2
            className="mt-4 max-w-3xl text-4xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
            style={{
              transform: glitchUi > 0.3 ? `translateX(${(glitchUi - 0.3) * 8}px)` : undefined,
              textShadow:
                glitchUi > 0.15
                  ? `${glitchPx * 1.2}px 0 #ff0066, ${-glitchPx}px 0 #00d4ff, 0 ${glitchPx * 0.5}px #0a0a0a`
                  : undefined,
            }}
          >
            {section.project}
          </h2>
          <p className="mt-6 text-sm text-[#0a0a0a]/50">{section.tag}</p>
        </div>

        <footer className="flex items-end justify-between">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#0a0a0a]/35">
            Section {sectionIndex + 1} / {SECTIONS.length}
          </p>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-[#0a0a0a]/35">
              Glitch burst
            </p>
            <p
              className="font-mono text-2xl font-bold tabular-nums"
              style={{ color: glitchUi > 0.4 ? "#ff0066" : "#0a0a0a" }}
            >
              {Math.round(glitchUi * 100)}%
            </p>
          </div>
        </footer>
      </div>

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
      </div>
    </LabStickyScroll>
  );
}
