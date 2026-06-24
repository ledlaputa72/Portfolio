import type { ComponentType } from "react";
import PpNeueMontrealType from "./PpNeueMontrealType";
import PpNeueMontrealSample from "./PpNeueMontrealSample";
import KfcLoyaltyRewards from "./KfcLoyaltyRewards";
import KfcLoyaltySample from "./KfcLoyaltySample";
import HydroflowFill from "./HydroflowFill";
import HydroflowSample from "./HydroflowSample";
import LaRevoltosaGradient from "./LaRevoltosaGradient";
import LaRevoltosaSample from "./LaRevoltosaSample";
import NorthGardenParticles from "./NorthGardenParticles";
import NorthGardenSample from "./NorthGardenSample";
import LoftThirtyOneWalkthrough from "./LoftThirtyOneWalkthrough";
import LoftThirtyOneSample from "./LoftThirtyOneSample";
import CryptOwlTimeline from "./CryptOwlTimeline";
import CryptOwlSample from "./CryptOwlSample";
import CipherDigitalRackAlign from "./CipherDigitalRackAlign";
import CipherDigitalSample from "./CipherDigitalSample";
import ArmoryRadarScan from "./ArmoryRadarScan";
import ArmorySample from "./ArmorySample";
import HashgraphVenturesNetwork from "./HashgraphVenturesNetwork";
import HashgraphVenturesSample from "./HashgraphVenturesSample";
import CartierWatchZoom from "./CartierWatchZoom";
import CartierWatchSample from "./CartierWatchSample";
import IzanamiFogReveal from "./IzanamiFogReveal";
import IzanamiSample from "./IzanamiSample";
import DigitalistsCardReveal from "./DigitalistsCardReveal";
import DigitalistsSample from "./DigitalistsSample";
import GlitchAndGritBurst from "./GlitchAndGritBurst";
import GlitchAndGritSample from "./GlitchAndGritSample";
import IrisKWaveform from "./IrisKWaveform";
import IrisKSample from "./IrisKSample";
import ProduxSplitText from "./ProduxSplitText";
import ProduxSample from "./ProduxSample";
import SynapserStudioScroll from "./SynapserStudioScroll";
import SynapserStudioSample from "./SynapserStudioSample";
import KvsStudioBreak from "./KvsStudioBreak";
import KvsStudioSample from "./KvsStudioSample";
import LesseStudioGrid from "./LesseStudioGrid";
import LesseStudioSample from "./LesseStudioSample";
import TonyMakTransition from "./TonyMakTransition";
import TonyMakSample from "./TonyMakSample";
import DanzanSlashReveal from "./DanzanSlashReveal";
import DanzanSample from "./DanzanSample";
import HirotoSatoSignage from "./HirotoSatoSignage";
import HirotoSatoSample from "./HirotoSatoSample";
import RazorpaySprintTrack from "./RazorpaySprintTrack";
import RazorpaySprintSample from "./RazorpaySprintSample";

export type LabExperiment = {
  Demo: ComponentType;
  /** Implementation notes shown below the live demo. */
  notes: {
    libraries: string[];
    points: string[];
    snippet: { label: string; code: string };
  };
  /** Optional full-page sample mimicking the reference site's overall flow. */
  Sample?: ComponentType;
};

export const labExperiments: Record<string, LabExperiment> = {
  "pp-neue-montreal": {
    Demo: PpNeueMontrealType,
    Sample: PpNeueMontrealSample,
    notes: {
      libraries: [
        "Roboto Flex (Google) — wght + wdth variable axes stand-in",
        "font-variation-settings — per-letter mouse distance mapping",
        "LabStickyScroll + gsap.set — 3 specimen scroll crossfade",
      ],
      points: [
        "360vh sticky pin — NEUE MONTREAL / GROTESQUE / HAIRLINE BLACK 3 specimen 전환.",
        "글자별 span + mousemove — 거리 기반 wght(920→base)·wdth(140→55) 실시간 보간.",
        "scroll progress가 baseWght 상승 — 스크롤할수록 전체 톤이 두꺼워지는 레이어.",
        "블랙 필드 + mono HUD(wght/wdth/specimen) — neuemontreal.com 미니멀 쇼케이스 톤.",
      ],
      snippet: {
        label: "마우스 거리 → variable axes",
        code: `const dist = Math.hypot(mouseX - cx, mouseY - cy);
const t = Math.min(1, dist / 200);
const wght = Math.round(920 - t * (920 - baseWght));
const wdth = Math.round(140 - t * 85);

el.style.fontVariationSettings =
  \`'wght' \${wght}, 'wdth' \${wdth}\`;`,
      },
    },
  },
  "kfc-loyalty": {
    Demo: KfcLoyaltyRewards,
    Sample: KfcLoyaltySample,
    notes: {
      libraries: [
        "@react-three/fiber + drei Float — KFC striped bucket 3D",
        "gsap.set — reward box stagger bounce, CTA scale",
        "LabStickyScroll — 5-section onboarding journey scrub",
      ],
      points: [
        "480vh sticky — HERO → 50 PTS counter → KFC BOX list → DRIVE THE BUCKET → CTA.",
        "3D bucket: scroll game phase sinus path + Float idle; pointer parallax rotation.",
        "Points 0→250 mapped to scroll local; boxes data-kfc-box stagger reveal.",
        "배경 cream→pink→red 전환 — kfc.it loyalty 온보딩 톤.",
      ],
      snippet: {
        label: "스크롤 포인트 + 버킷 경로",
        code: `const pts = Math.round(sectionLocal(p, 0.22, 0.44) * 250);

const pathX = gamePhase > 0
  ? Math.sin(p * Math.PI * 8) * 1.2 : 0;
group.position.y = Math.abs(Math.sin(p * Math.PI * 12)) * 0.35;`,
      },
    },
  },
  armory: {
    Demo: ArmoryRadarScan,
    Sample: ArmorySample,
    notes: {
      libraries: [
        "@react-three/fiber — scroll-driven camera dolly",
        "gsap — loading radar sweep overlay",
        "LabStickyScroll — 원경→근경(드론) + 카드 reveal",
      ],
      points: [
        "480vh sticky — loading radar → aerial dolly → capability cards.",
        "Camera keys: wide 16m → medium 3.6m → close 1.15m on hero UAV.",
        "Distant wireframe threats fade as camera locks on SURGE unit.",
        "4 DOM cards stagger at 52%–88% — Detect / Deploy / OS / EW.",
      ],
      snippet: {
        label: "스크롤 → 카메라 돌리",
        code: `const { pos, look } = sampleCamera(progress);
camera.position.lerp(pos, 0.07);
camera.lookAt(look);

// cards after dolly lock (p > 0.55)
const t = smoothstep((progress - 0.52) / 0.1);`,
      },
    },
  },
  "cipher-digital": {
    Demo: CipherDigitalRackAlign,
    Sample: CipherDigitalSample,
    notes: {
      libraries: [
        "gsap quickTo — pointer tension on grid lines",
        "LabStickyScroll — 3-phase scroll journey (780vh)",
        "CSS horiz-scroll — framed media + copy panel swap",
      ],
      points: [
        "Phase 1 (0–17%): hero grid — spacer 25vh→4vh, line draw, partner bar.",
        "Phase 2 (14–70%): horiz-scroll — 3 framed slides + floating copy panels.",
        "Frame: diagonal lines, extended media lines, corner dots (레퍼런스 horiz-scroll).",
        "Phase 3 (66–100%): expertise cards stagger + 600MW/3.2GW/327MW metrics.",
      ],
      snippet: {
        label: "horiz-scroll track",
        code: `const horizP = (p - 0.14) / (0.7 - 0.14);
track.style.transform = \`translate3d(-\${horizP * 200}%, 0, 0)\`;

// copy panel crossfade
const o = panelOpacity(horizP, panelIndex, 3);`,
      },
    },
  },
  "hashgraph-ventures": {
    Demo: HashgraphVenturesNetwork,
    Sample: HashgraphVenturesSample,
    notes: {
      libraries: [
        "@react-three/fiber — crystal shards + particle figure + water shader",
        "CSS diagonal split — hard screen transition on scroll",
        "LabStickyScroll — 5-chapter cinematic journey (920vh)",
      ],
      points: [
        "Hero: reflective water + emissive crystal cluster over mist.",
        "Diagonal split overlay + particle stream at section boundaries.",
        "Hover: 56 shards burst outward + 2200 figure particles repulse.",
        "//01–//03 copy + portfolio tags + team crossfade (reference layout).",
      ],
      snippet: {
        label: "hover → 샤드 분열",
        code: `const repulse = hover * max(0, 2.2 - dist) * 0.22;
shard.vel.add(burstDir.multiplyScalar(explode * 0.018));
shard.vel.add(home.sub(pos).multiplyScalar(0.035));`,
      },
    },
  },
  cryptowl: {
    Demo: CryptOwlTimeline,
    Sample: CryptOwlSample,
    notes: {
      libraries: [
        "@react-three/fiber + drei Line — CatmullRom timeline tube",
        "emissive glow nodes — scroll proximity pulse",
        "LabStickyScroll — 480vh timeline camera scrub",
      ],
      points: [
        "480vh sticky — Time → Strategy → Replay → Control → Analytics 5구간.",
        "CatmullRomCurve3 tube + 6 nodes — progress→getPointAt camera lerp.",
        "노드 emissiveIntensity — |progress - nodeT| 기반 활성 글로우.",
        "메트릭 HUD — Net PnL +$1,152, ROI +11.52% 등 scroll threshold 갱신.",
      ],
      snippet: {
        label: "스크롤 → 타임라인 카메라",
        code: `const point = curve.getPointAt(progress);
const ahead = curve.getPointAt(progress + 0.04);

camera.position.lerp(
  new Vector3(point.x - 2.8, point.y + 1.6, 4.5), 0.08);
camera.lookAt(ahead);

nodeGlow = max(0, 1 - abs(progress - nodeT) * 4.5);`,
      },
    },
  },
  "loft-thirty-one": {
    Demo: LoftThirtyOneWalkthrough,
    Sample: LoftThirtyOneSample,
    notes: {
      libraries: [
        "@react-three/fiber — scroll-scrub camera lerp + lookAt",
        "프로시저럴 로프트 셸 — Living/Kitchen/Dining/Suite 4 zone",
        "LabStickyScroll — 500vh sticky walkthrough",
      ],
      points: [
        "500vh sticky — CAMERA_KEYS 5키프레임, progress→pos/look smoothstep lerp.",
        "4 room zones along -Z — 가구 proxy + WindowWall emissive + exposed beams.",
        "RoomLights point intensity — 카메라 거리 기반 조명 전환.",
        "Noto Serif + Fragment Mono 톤 — We build sensational spaces 카피.",
      ],
      snippet: {
        label: "스크롤 → 카메라 워크스루",
        code: `const { pos, look } = sampleCamera(progress);
const ease = local * local * (3 - 2 * local);

camera.position.lerp(pos, 0.08);
camera.lookAt(look);

light.intensity = max(0.15, 1.4 - dist * 0.12);`,
      },
    },
  },
  northgarden: {
    Demo: NorthGardenParticles,
    Sample: NorthGardenSample,
    notes: {
      libraries: [
        "@react-three/fiber — Points + InstancedMesh petal layer",
        "바람 벡터 필드 — sin/cos noise + pointer wind bias",
        "readPixels — 캔버스 중앙 하단 픽셀 → CSS background 동기화",
      ],
      points: [
        "440vh sticky — Home → Work → Services → Start a Project 4구간.",
        "1100 soft points + 280 petal planes — organic paper/leaf 톤 PALETTE.",
        "windRef = 0.45 + progress×0.85 — 스크롤 시 바람 세기·파티클 속도 상승.",
        "preserveDrawingBuffer + readPixels — northgarden.com theme-color 패턴 재현.",
      ],
      snippet: {
        label: "바람 필드 + 배경 샘플",
        code: `p.vx = lerp(p.vx, fieldX * wind * 0.014, 0.06);
p.vy = lerp(p.vy, fieldY * wind * 0.012, 0.06);

gl.readPixels(w/2, h*0.08, 1, 1, RGBA, UNSIGNED_BYTE, px);
document.documentElement.style.setProperty('--background', hex);`,
      },
    },
  },
  "la-revoltosa": {
    Demo: LaRevoltosaGradient,
    Sample: LaRevoltosaSample,
    notes: {
      libraries: [
        "커스텀 GLSL — scroll-driven multi-stop gradient sweep",
        "@react-three/fiber — transmission bubble cluster",
        "LabStickyScroll + gsap.set — drink card stagger",
      ],
      points: [
        "420vh sticky — 4구간 Coral→Magenta→Limón→Cola 그라디언트 전환.",
        "uProgress + sweep band — 스크롤마다 배경 팔레트가 빠르게 슬라이드.",
        "섹션 경계 pulseRef decay — 그라디언트 컷 시 리듬감 있는 플래시.",
        "3D 버블 transmission + pointer parallax — La burbuja Ibérica 메타포.",
      ],
      snippet: {
        label: "스크롤 → 그라디언트 팔레트",
        code: `vec3 col = mix(palette(t), palette(t + 0.12),
  smoothstep(t - 0.08, t + 0.02, uv.y + wave));

uniforms.uProgress.value = progressRef.current;

if (sectionChanged) pulseRef.current = 1;`,
      },
    },
  },
  hydroflow: {
    Demo: HydroflowFill,
    Sample: HydroflowSample,
    notes: {
      libraries: [
        "@react-three/fiber — glass bottle + liquid meshPhysicalMaterial",
        "커스텀 GLSL fluid backdrop — uFill 연동 파도 surface",
        "LabStickyScroll — fill 0→100% scroll scrub",
      ],
      points: [
        "450vh sticky — HYDROFLOW → Solana Splash → WATER MEETS INNOVATION → SCAN IT.",
        "fillRef = (progress-0.08)/0.72 — 액체 cylinder scale.y + position 하단 고정 채움.",
        "Fluid shader uFill — 배경 수면 높이가 스크롤과 동기 상승.",
        "pointer → bottle rotation.y/x — Rotate Hydroflow 레퍼런스.",
      ],
      snippet: {
        label: "스크롤 액체 채움",
        code: `const fill = clamp((progress - 0.08) / 0.72, 0, 1);
liquid.scale.y = fill;
liquid.position.y = baseY + fill * liquidHeight * 0.5;

shader.uniforms.uFill.value = fill;`,
      },
    },
  },
  "cartier-watches-and-wonders": {
    Demo: CartierWatchZoom,
    Sample: CartierWatchSample,
    notes: {
      libraries: [
        "@react-three/fiber — 6 alcove universe, unified group rotation",
        "@react-three/drei — procedural watch variants per universe",
        "LabStickyScroll — 500vh sticky, scroll-driven scene swap",
      ],
      points: [
        "카메라 원점 고정 — 원통 무대(CYLINDER_R=7) 내부 중앙에서 바깥을 바라봄.",
        "배경 패널만 원통에 180° 간격 배치 — 스크롤마다 stage.rotation.y가 π씩 증가.",
        "히어로 시계는 camera 자식 + counter-rotation.y = -stageRot — 화면 중앙 고정.",
        "local 0.76→0.98 구간에서 시계 crossfade — 배경 universe 전환 시점과 동기.",
      ],
      snippet: {
        label: "고정 시계 + 반대 회전",
        code: `// Stage spins, hero watch counter-rotates
stage.rotation.y = -(section * PI + local * PI);
heroPivot.rotation.y = -stage.rotation.y;

// Swap watch at background pivot
const t = smoothstep(local, 0.76, 0.98);
current.alpha = 1 - t; next.alpha = t;`,
      },
    },
  },
  izanami: {
    Demo: IzanamiFogReveal,
    Sample: IzanamiSample,
    notes: {
      libraries: [
        "@react-three/fiber — fog, Float, useFrame 패럴럭스",
        "커스텀 GLSL — mist 오버레이(uDensity) + warm 그레이딩",
        "LabStickyScroll — 400vh sticky, 3 practice fog reveal",
      ],
      points: [
        "400vh sticky pin — progress를 School/Craft/Retreat 3구간으로 분할, 구간 중심에서 안개 걷힘·오브젝트 scale in.",
        "FogGradingPlane GLSL + three.js fog — scroll·visibility에 연동된 uDensity로 ethereal mist 재현.",
        "원(Enso)·도자기·선석 3 오브젝트 — 일본 미학 symbolic geometry, pointer drift.",
        "DOM serif 타이포 + 和 + Mist % HUD — izanami-official.com 톤(#ebe6dc, #8b7355).",
      ],
      snippet: {
        label: "스크롤 → 안개 밀도 + practice visibility",
        code: `const maxVis = Math.max(...sectionVisibilities);
const edgeFog = Math.min(local / 0.18, (1 - local) / 0.18, 1);
fogDensityRef.current = lerp(0.75, 0.08, maxVis * edgeFog);

// GLSL mist overlay
float alpha = uDensity * vignette * (0.55 + noise);`,
      },
    },
  },
  digitalists: {
    Demo: DigitalistsCardReveal,
    Sample: DigitalistsSample,
    notes: {
      libraries: [
        "gsap — gsap.set card transform, gsap.utils.clamp",
        "LabStickyScroll — 380vh sticky + scrub reveal",
        "DOM/CSS — hover yellow accent, no WebGL",
      ],
      points: [
        "380vh sticky pin — 전반(0–52%) 서비스 4카드, 후반(48–100%) 레퍼런스 4카드 순차 reveal.",
        "카드 hover: lift + thumb scale + #f1e500 좌측 바·underline — digitalists 실무 카드 모션.",
        "헤드라인이 progress에 따라 Leistungen ↔ Referenzen 전환, #kein0815 브랜드 톤.",
        "Awwwards 팔레트 #171717 / #F2F2F2 / #f1e500 — WordPress 에이전시 톤 재현.",
      ],
      snippet: {
        label: "스크롤 → 카드 순차 reveal",
        code: `const t = gsap.utils.clamp(0, 1,
  (localP - start) / (end - start));

gsap.set(card, {
  opacity: 0.12 + t * 0.88,
  y: 56 * (1 - t),
  scale: 0.94 + t * 0.06,
});`,
      },
    },
  },
  "glitch-and-grit": {
    Demo: GlitchAndGritBurst,
    Sample: GlitchAndGritSample,
    notes: {
      libraries: [
        "커스텀 GLSL — RGB 채널 시프트, 슬라이스 displacement, grit noise",
        "@react-three/fiber — orthographic fullscreen shader plane",
        "LabStickyScroll — 400vh sticky, 섹션 경계 glitch burst",
      ],
      points: [
        "400vh sticky pin — progress를 4개 워크 섹션으로 분할, 구간 진입 시 uGlitch=1 → 0.9 decay로 버스트.",
        "Fragment shader: procedural editorial paper + grit grain, glitch 시 R/G/B UV 분리·슬라이스 offset·스캔라인.",
        "DOM 타이포에 RGB text-shadow 동기화 — 셰이더 버스트와 HTML 헤드라인이 함께 깨짐.",
        "Glitch burst % HUD + scanline mix-blend overlay — 레퍼런스 섹션 전환 시그니처 재현.",
      ],
      snippet: {
        label: "섹션 경계 → glitch 버스트",
        code: `if (idx !== prevSection) {
  glitchRef.current = 1;
}
if (local < 0.1) {
  glitchRef.current = Math.max(glitchRef.current, 1 - local / 0.1);
}

// shader: RGB split
vec3 cr = sampleScene(uv + vec2(shift, 0.0), uSection);
vec3 cg = sampleScene(uv, uSection);
vec3 cb = sampleScene(uv - vec2(shift * 1.4, 0.0), uSection);
color = vec3(cr.r, cg.g, cb.b);`,
      },
    },
  },
  "iris-k": {
    Demo: IrisKWaveform,
    Sample: IrisKSample,
    notes: {
      libraries: [
        "Web Audio API — OscillatorNode + AnalyserNode 실시간 주파수 데이터",
        "@react-three/fiber — InstancedMesh 바, Points 파티클, Line 악보",
        "LabStickyScroll — 400vh sticky + scrub, 4단계 Silence→Resonance",
      ],
      points: [
        "Break the Silence 게이트 — 클릭/키 입력 후 프로시저럴 바이올린 화음 재생, Analyser가 파형·파티클 amplitude에 반영.",
        "400vh sticky pin — scroll progress로 amp·악보 오버레이·4 Phase(Silence/Pulse/Waveform/Resonance) 전환.",
        "InstancedMesh 72바 + Line 곡선 + 320 soft particles — 오디오 없어도 scroll sine fallback으로 시각 유지.",
        "Mute/Unmute 토글 + 헤드폰 안내 — 레퍼런스 theirisk.com UX 흐름 재현.",
      ],
      snippet: {
        label: "Analyser → 파형 바 높이",
        code: `analyser.getByteFrequencyData(data);

for (let i = 0; i < BAR_COUNT; i++) {
  const bin = Math.floor((i / BAR_COUNT) * data.length * 0.6);
  const h = (data[bin] / 255) * amp * 2.4 + 0.04;
  dummy.scale.set(0.06, h, 0.06);
  mesh.setMatrixAt(i, dummy.matrix);
}`,
      },
    },
  },
  produx: {
    Demo: ProduxSplitText,
    Sample: ProduxSample,
    notes: {
      libraries: [
        "gsap — gsap.set word transform, gsap.utils.clamp",
        "LabStickyScroll — 400vh sticky + scrub",
        "DOM/CSS — 단어 단위 span, will-change-transform",
      ],
      points: [
        "400vh sticky pin — progress를 3구문 × 3단계(together/split/reform)로 분할, 스크롤만으로 타이포 시퀀스 체험.",
        "각 단어는 inline-block span + ref — scroll onProgress에서 x/y/rotation/scale을 gsap.set으로 직접 제어(SplitText 없이 동일 효과).",
        "Split 단계: 단어가 radial explode, Reform 단계: 원위치로 수렴 — PRODUX 시그니처 '분해/재조합' 재현.",
        "Together/Split/Reform 페이즈 인디케이터 + Spread % + Phrase 카운터로 스크롤 피드백 명확화.",
      ],
      snippet: {
        label: "스크롤 → 단어 분해/재조합",
        code: `const local = (progress * 3) % 1;
const phase = local < 0.28 ? "together"
  : local < 0.55 ? "split" : "reform";

const spread = phase === "split"
  ? (local - 0.28) / 0.27
  : phase === "reform" ? 1 - (local - 0.55) / 0.45 : 0;

gsap.set(wordEl, {
  x: baseX * (1 + spread * 1.8),
  y: Math.sin(i * 1.4) * 90 * spread,
  rotation: (i - center) * 18 * spread,
});`,
      },
    },
  },
  "synapser-studio": {
    Demo: SynapserStudioScroll,
    Sample: SynapserStudioSample,
    notes: {
      libraries: [
        "@react-three/fiber — Canvas, useFrame, useThree",
        "@react-three/drei — Float, Line, Text, fog",
        "LabStickyScroll + gsap ScrollTrigger scrub",
      ],
      points: [
        "400vh sticky pin — progress 0–1을 3개 장면(Manifesto/Archive/Journey)으로 분할, 각 구간마다 독립 3D 오브젝트 세트 scale fade.",
        "카메라 경로 3키프레임 lerp: 정면 torus → archive 그리드 orbit → network pullback, pointer로 drift 보정.",
        "Synapse 장면: sphere 노드 + drei Line 링크로 네트워크 비주얼, archive는 3×3 box grid.",
        "HTML 타이포 오버레이는 sceneIndex + local progress fade — 3D 씬과 동기화된 scroll-driven storytelling.",
      ],
      snippet: {
        label: "스크롤 progress → 장면 가중치 + 카메라",
        code: `useFrame(() => {
  const p = progressRef.current;
  manifestoVis = Math.max(0, 1 - p * 3);
  archiveVis   = p ∈ [1/3, 2/3] ? 1 : fadeEdges;
  networkVis   = p > 2/3 ? (p - 2/3) * 3 : 0;

  camera.position.lerp(keyframeAt(p), 0.06);
  camera.position.x += pointer.x * 0.45; // mouse drift
});`,
      },
    },
  },
  "kvs-studio": {
    Demo: KvsStudioBreak,
    Sample: KvsStudioSample,
    notes: {
      libraries: [
        "gsap — letter scatter timeline, hover glitch",
        "DOM/CSS — RGB text-shadow 글리치, monospace HUD",
        "React state — broken/좌표/클릭 카운터만 관리",
      ],
      points: [
        "LabStickyScroll(350vh) — 스크롤 progress에 따라 글자가 순차 scatter, 92% 이상에서 showcase reveal.",
        "글자별 threshold로 scrub 분해 — CLICK TO BREAK 시그니처를 스크롤 기반으로 체험 가능.",
        "클릭 시 즉시 full break(보조 인터랙션), 좌표 HUD는 pointermove로 X/Y/BRK 표시.",
        "React map 글자 span + gsap.set/transform만 사용 — DOM 직접 innerHTML 없음.",
      ],
      snippet: {
        label: "CLICK TO BREAK — 글자 scatter",
        code: `letters.forEach((el, i) => {
  gsap.to(el, {
    x: (Math.random() - 0.5) * 280,
    y: (Math.random() - 0.5) * 160,
    rotation: (Math.random() - 0.5) * 80,
    opacity: Math.random() * 0.45 + 0.15,
    duration: 0.55 + Math.random() * 0.35,
    ease: "power3.out",
  }, i * 0.02);
});`,
      },
    },
  },
  "lesse-studio": {
    Demo: LesseStudioGrid,
    Sample: LesseStudioSample,
    notes: {
      libraries: [
        "@react-three/fiber + drei Float — 중앙 플로팅 3D, 마우스 패럴럭스",
        "gsap + LabStickyScroll — 그리드 카드 순차 reveal",
        "DOM/CSS — editorial 그리드 레이아웃",
      ],
      points: [
        "LesseStudioFloatingObject — torusKnot + 보조 형태, pointer 미세 rotation/position.",
        "샘플 히어로 + 데모 sticky 초반에 3D 배치 — 스크롤 시 heroFade로 fade out.",
        "LabStickyScroll(350vh) — 6개 카드 opacity/y/scale 순차 reveal.",
        "카드 hover: gsap thumb scale·underline — 스크롤과 독립 마이크로 인터랙션.",
      ],
      snippet: {
        label: "Nested scroller + ScrollTrigger reveal",
        code: `gsap.to(card, {
  opacity: 1,
  y: 0,
  duration: 0.7,
  scrollTrigger: {
    trigger: card,
    scroller: scrollContainerRef.current, // 데모 내부 스크롤
    start: "top 92%",
    toggleActions: "play none none reverse",
  },
});`,
      },
    },
  },
  "tony-mak": {
    Demo: TonyMakTransition,
    Sample: TonyMakSample,
    notes: {
      libraries: [
        "@react-three/fiber — Canvas, useFrame scroll-scrub 3D",
        "three — Hero torusKnot·shards, 프로젝트별 3D 프리뷰 shape",
        "LabStickyScroll + GSAP ScrollTrigger scrub",
      ],
      points: [
        "680vh sticky — Hero(0–54%): progress→rotation/position 직접 매핑, 스크롤 멈추면 3D도 정지.",
        "히어로 타이포 3챕터 crossfade + translateY 상승 — Creative at the Speed of Next 등 교체.",
        "Work(54–92%): 프로젝트 리스트 순차 reveal, hover 시 weightsRef lerp로 뒤쪽 3D 프리뷰 교체.",
        "커스텀 커서 dot(mix-blend-difference), Contact 마무리 섹션.",
      ],
      snippet: {
        label: "스크롤 scrub 3D + hover weight",
        code: `// Hero — scroll is the timeline
const phase = (progress / WORK_START) * Math.PI * 2;
group.rotation.y = phase * 0.85;

// Work — hover crossfade
weightsRef.current[i] = lerp(weightsRef.current[i], i === hoverIndex ? 1 : 0, 0.08);`,
      },
    },
  },
  danzan: {
    Demo: DanzanSlashReveal,
    Sample: DanzanSample,
    notes: {
      libraries: [
        "@react-three/fiber — 히어로 3D 샤드 + 마우스 패럴럭스",
        "Canvas 2D — 마우스 잔상 트레일",
        "CSS mask (Canvas) — 베이지 껍질 레이어 절단, 배경 통째 교체 없음",
      ],
      points: [
        "단일 sticky 뷰포트 + z-index 레이어 — 패널 통째 교체가 아닌 껍질(shell) 아래 灵感 노출.",
        "베이지 껍질에 CSS mask(Canvas) — slash 진행(t<reveal) 구간만 투명, 뒤 노란 레이어 비침.",
        "히어로 3D+잔상 → scroll translateY로 올라감 → 베이지 진입 → 절단 게이트 → 껍질 peel.",
        "노란→빨강: RedDripTop/YellowDripBottom 페인트 드립 + 연속 scroll 섹션.",
      ],
      snippet: {
        label: "껍질 마스크 절단",
        code: `// Shell mask: alpha=0 where projection t < reveal
const sealed = t >= reveal - 0.008 ? 1 : 0;
shell.style.maskImage = canvasDataUrl;

// Inner yellow 灵感 sits at z-0 behind shell`,
      },
    },
  },
  "hiroto-sato": {
    Demo: HirotoSatoSignage,
    Sample: HirotoSatoSample,
    notes: {
      libraries: [
        "@react-three/fiber — Canvas, useFrame, useThree",
        "@react-three/drei — Float (오브젝트별 독립 부유 애니메이션), Text (쇼릴/사인 텍스트)",
        "gsap + gsap/ScrollTrigger — scrub 기반의 미세한 회전 속도/카메라 줌 보정",
      ],
      points: [
        "LabStickyScroll 패턴(300vh 트랙 + sticky h-screen + scrub)으로 페이지 스크롤 시 화면 고정, 클러스터 회전·카메라 줌이 progress에 연동.",
        "메인 인터랙션은 포인터 패럴럭스 + 스크롤 오비트: scrollOrbitRef로 Y축 회전 각도를 0→2π 매핑, cameraZ 5.5→3.3 줌.",
        "Scene Phase 오버레이로 스크롤 구간(0–33–66–100%) 시각적 피드백 — 레퍼런스의 장면 전환 감각을 단순화해 표현.",
        "useFrame + ref 패턴으로 60fps 3D 업데이트, Scroll Progress %는 LabStickyScroll 오버레이로 표시.",
      ],
      snippet: {
        label: "포인터 패럴럭스 → 클러스터 회전 lerp",
        code: `const { pointer } = useThree();
const target = useRef({ x: 0, y: 0 });

useFrame((_, delta) => {
  target.current.x = pointer.y * 0.25;
  target.current.y = pointer.x * 0.35;

  cluster.rotation.x += (target.current.x - cluster.rotation.x) * 0.05;
  cluster.rotation.y += (target.current.y - cluster.rotation.y) * 0.05;
  cluster.rotation.y += rotationSpeedRef.current * delta; // scroll로 미세 가속
});`,
      },
    },
  },
  "razorpay-sprint-26": {
    Demo: RazorpaySprintTrack,
    Sample: RazorpaySprintSample,
    notes: {
      libraries: [
        "@react-three/fiber — Canvas, useFrame, 그룹형 신발 오브제",
        "three — MeshStandardMaterial, 트랙 마커 emissive",
        "LabStickyScroll + gsap ScrollTrigger scrub",
      ],
      points: [
        "400vh LabStickyScroll sticky pin — progress ref를 R3F useFrame에서 읽어 신발 z·카메라 lerp.",
        "2색 팔레트(#0039FF/#151515)만 사용 — 트랙·신발·마커·HUD 일관.",
        "18개 트랙 마커가 스크롤 통과 시 emissive flash — Triggers Fired 카운터 108+ 매핑.",
        "Sprint 26 실제 6대 섹션(Agentic Stack → Business Banking) 타이포가 progress에 동기화.",
      ],
      snippet: {
        label: "스크롤 progress → 3D 위치 연동 핵심 구조",
        code: `const progressRef = useRef(0);

useEffect(() => {
  const st = ScrollTrigger.create({
    trigger: wrapperEl,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      progressRef.current = self.progress; // 0~1
    },
  });
  return () => st.kill();
}, []);

// R3F 컴포넌트 내부
useFrame(() => {
  const z = -progressRef.current * TRACK_LENGTH;
  object.position.z += (z - object.position.z) * 0.1; // lerp
});`,
      },
    },
  },
};
