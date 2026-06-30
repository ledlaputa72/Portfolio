"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { SynapserScrollGlitchSettings } from "@/lib/synapser-scroll-glitch";
import {
  computeSynapserObjectGlitchIntensity,
  getSynapserObjectGlitchDisplay,
  parseSynapserHexColor,
} from "@/lib/synapser-scroll-glitch";
import { getCinematicSceneVisibilities, type SynapserSceneId } from "@/lib/synapser-scene-settings";
import type { SynapserObjectHoverState } from "./synapser-object-hover";

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uGlitch;
uniform float uIrregularity;
uniform float uDisplace;
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vViewNormal;

float hash(float n) {
  return fract(sin(n) * 43758.5453);
}

void main() {
  vUv = uv;
  vec3 n = normalize(normalMatrix * normal);
  vViewNormal = n;

  float seed = position.x * 17.0 + position.y * 31.0 + position.z * 13.0;
  float row = floor(position.y * (18.0 + uIrregularity * 24.0) + uTime * (6.0 + uIrregularity * 8.0));
  float rowHash = hash(row + seed);
  vec3 pos = position;
  pos += normal * (rowHash - 0.5) * uGlitch * uDisplace * 0.035;

  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vWorldPos = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uGlitch;
uniform float uRgbShift;
uniform float uSlice;
uniform float uScanline;
uniform float uGrit;
uniform float uIrregularity;
uniform float uColorTint;
uniform vec3 uCameraPos;
uniform vec3 uColorAccent;
uniform vec3 uColorFringeA;
uniform vec3 uColorFringeB;
uniform vec3 uColorBar;
uniform vec3 uColorSpeckle;
varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vViewNormal;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float hash1(float n) {
  return fract(sin(n) * 43758.5453);
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

void main() {
  vec3 viewDir = normalize(uCameraPos - vWorldPos);
  float fresnel = pow(1.0 - max(dot(normalize(vViewNormal), viewDir), 0.0), 1.6);
  float edge = 0.45 + fresnel * 0.75;
  float g = uGlitch * edge;
  if (g < 0.015) discard;

  vec2 uv = vUv;
  float rowScale = 16.0 + hash1(vWorldPos.y * 7.0 + uTime * 0.7) * 34.0 * uIrregularity;
  float slice = floor(uv.y * rowScale + hash(vec2(uv.x * 3.0, uTime)) * uIrregularity * 5.0);
  float sliceHash = hash(vec2(slice, floor(uTime * (32.0 + g * 60.0 + uIrregularity * 35.0))));
  float sliceShift = (sliceHash - 0.5) * g * 0.14 * uSlice;

  vec2 sampleUv = uv;
  sampleUv.x += sliceShift;
  if (sliceHash > 0.87) {
    sampleUv.y += (hash(vec2(slice, uTime * 1.5)) - 0.5) * g * 0.05 * uIrregularity;
  }

  float shift = g * 0.02 * uRgbShift + sin(uTime * (44.0 + sliceHash * 24.0)) * g * 0.006;
  float r = hash(sampleUv + vec2(shift, 0.0));
  float gn = hash(sampleUv);
  float b = hash(sampleUv - vec2(shift * 1.3, shift * 0.35));
  vec3 noiseColor = vec3(r, gn * 0.12, b);
  vec3 color = mix(noiseColor, uColorAccent, uColorTint * clamp(g, 0.0, 1.0));

  float barMask = step(0.83, sliceHash) * g;
  color = mix(color, uColorBar, barMask * 0.5);
  color = mix(color, uColorFringeA, step(0.74, sliceHash) * step(sliceHash, 0.83) * g * 0.38);

  float speckle = step(0.96, hash(floor(uv * vec2(88.0 + uIrregularity * 36.0, 64.0)) + floor(uTime * 16.0)));
  color = mix(color, uColorSpeckle, speckle * g * 0.48);

  float grit = noise(uv * 360.0 + uTime * 0.35) * 0.06 * uGrit;
  color += vec3(grit);

  float scan = abs(sin(uv.y * (620.0 + sliceHash * 360.0))) * 0.016 * uScanline * g;
  color += vec3(scan);

  float fringe = abs(sliceShift) * 12.0;
  color += uColorFringeA * fringe * 0.38;
  color += uColorFringeB * fringe * 0.38;

  float alpha = g * (0.32 + barMask * 0.48 + speckle * 0.32 + fringe * 0.42 + fresnel * 0.25);
  gl_FragColor = vec4(color, min(alpha, 0.9));
}
`;

type GlitchShell = {
  shell: THREE.Mesh;
  material: THREE.ShaderMaterial;
};

function setColorUniform(material: THREE.ShaderMaterial, name: string, hex: string) {
  const [r, g, b] = parseSynapserHexColor(hex);
  (material.uniforms[name].value as THREE.Vector3).set(r, g, b);
}

function createGlitchMaterial(layer: SynapserScrollGlitchSettings["object"]) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uGlitch: { value: 0 },
      uRgbShift: { value: layer.rgbShift },
      uSlice: { value: layer.sliceStrength },
      uScanline: { value: layer.scanlineOpacity },
      uGrit: { value: layer.gritOpacity },
      uIrregularity: { value: layer.irregularity },
      uDisplace: { value: layer.displace * 0.35 },
      uColorTint: { value: layer.colorTint },
      uCameraPos: { value: new THREE.Vector3() },
      uColorAccent: { value: new THREE.Vector3(...parseSynapserHexColor(layer.colorAccent)) },
      uColorFringeA: { value: new THREE.Vector3(...parseSynapserHexColor(layer.colorFringeA)) },
      uColorFringeB: { value: new THREE.Vector3(...parseSynapserHexColor(layer.colorFringeB)) },
      uColorBar: { value: new THREE.Vector3(...parseSynapserHexColor(layer.colorBar)) },
      uColorSpeckle: { value: new THREE.Vector3(...parseSynapserHexColor(layer.colorSpeckle)) },
    },
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
}

function syncGlitchMaterialUniforms(
  material: THREE.ShaderMaterial,
  layer: SynapserScrollGlitchSettings["object"],
  glitch: number,
  time: number,
  camera: THREE.Camera,
) {
  material.uniforms.uTime.value = time;
  material.uniforms.uGlitch.value = glitch;
  material.uniforms.uRgbShift.value = layer.rgbShift;
  material.uniforms.uSlice.value = layer.sliceStrength;
  material.uniforms.uScanline.value = layer.scanlineOpacity;
  material.uniforms.uGrit.value = layer.gritOpacity;
  material.uniforms.uIrregularity.value = layer.irregularity;
  material.uniforms.uDisplace.value = layer.displace * 0.35;
  material.uniforms.uColorTint.value = layer.colorTint;
  (material.uniforms.uCameraPos.value as THREE.Vector3).copy(camera.position);
  setColorUniform(material, "uColorAccent", layer.colorAccent);
  setColorUniform(material, "uColorFringeA", layer.colorFringeA);
  setColorUniform(material, "uColorFringeB", layer.colorFringeB);
  setColorUniform(material, "uColorBar", layer.colorBar);
  setColorUniform(material, "uColorSpeckle", layer.colorSpeckle);
}

type SynapserMeshGlitchBinderProps = {
  children: ReactNode;
  glitchRef: React.RefObject<number>;
  progressRef: React.RefObject<number>;
  sceneId: SynapserSceneId;
  settings: SynapserScrollGlitchSettings;
  objectHoverRef: React.RefObject<SynapserObjectHoverState>;
};

export default function SynapserMeshGlitchBinder({
  children,
  glitchRef,
  progressRef,
  sceneId,
  settings,
  objectHoverRef,
}: SynapserMeshGlitchBinderProps) {
  const rootRef = useRef<THREE.Group>(null);
  const shellsRef = useRef<Map<THREE.Mesh, GlitchShell>>(new Map());
  const scanFrame = useRef(0);
  const { camera } = useThree();

  const syncShells = () => {
    const root = rootRef.current;
    if (!root) return;

    const liveMeshes = new Set<THREE.Mesh>();
    root.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      if (obj.userData.synapserGlitchShell) return;
      if (!obj.geometry) return;
      liveMeshes.add(obj);

      if (!shellsRef.current.has(obj)) {
        const material = createGlitchMaterial(settings.object);
        const shell = new THREE.Mesh(obj.geometry, material);
        shell.userData.synapserGlitchShell = true;
        shell.raycast = () => undefined;
        shell.frustumCulled = obj.frustumCulled;
        shell.renderOrder = (obj.renderOrder || 0) + 1;
        obj.add(shell);
        shellsRef.current.set(obj, { shell, material });
      }
    });

    shellsRef.current.forEach(({ shell, material }, source) => {
      if (!liveMeshes.has(source)) {
        source.remove(shell);
        material.dispose();
        shellsRef.current.delete(source);
      }
    });
  };

  useLayoutEffect(() => {
    syncShells();
    return () => {
      shellsRef.current.forEach(({ shell, material }, source) => {
        source.remove(shell);
        material.dispose();
      });
      shellsRef.current.clear();
    };
  }, []);

  useFrame(({ clock }) => {
    if (scanFrame.current++ % 15 === 0) syncShells();

    const vis = getCinematicSceneVisibilities(progressRef.current)[sceneId];
    const layer = settings.object;
    const hover =
      objectHoverRef.current.sceneId === sceneId ? objectHoverRef.current.blend : 0;

    const idlePhase = 0.5 + 0.5 * Math.sin(clock.elapsedTime * layer.idlePulseSpeed);
    const scrollBurst =
      settings.enabled && layer.enabled
        ? getSynapserObjectGlitchDisplay(glitchRef, settings) * vis
        : 0;
    const glitch = computeSynapserObjectGlitchIntensity({
      settings,
      scrollBurst,
      sceneVisibility: vis,
      idlePhase,
      hoverBlend: hover,
    });

    shellsRef.current.forEach(({ shell, material }) => {
      shell.visible = glitch > 0.015;
      syncGlitchMaterialUniforms(material, layer, glitch, clock.elapsedTime, camera);
    });
  });

  return <group ref={rootRef}>{children}</group>;
}
