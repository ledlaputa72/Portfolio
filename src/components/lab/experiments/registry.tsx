import type { ComponentType } from "react";
import type { Localized } from "@/i18n/config";
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
import RsquadGeometryMorph from "./RsquadGeometryMorph";
import RsquadSample from "./RsquadSample";
import AirBusinessCenterFloors from "./AirBusinessCenterFloors";
import AirBusinessCenterSample from "./AirBusinessCenterSample";
import ReventadorCarbonCurve from "./ReventadorCarbonCurve";
import ReventadorSample from "./ReventadorSample";
import PodiumVideoScrub from "./PodiumVideoScrub";
import PodiumSample from "./PodiumSample";
import TowerArchitecturalDoors from "./TowerArchitecturalDoors";
import TowerArchitecturalDoorsSample from "./TowerArchitecturalDoorsSample";
import FabricsProtectionWeave from "./FabricsProtectionWeave";
import FabricsProtectionSample from "./FabricsProtectionSample";
import WorldCup2026DataViz from "./WorldCup2026DataViz";
import WorldCup2026Sample from "./WorldCup2026Sample";
import SouthCliffDentalExplore from "./SouthCliffDentalExplore";
import SouthCliffDentalSample from "./SouthCliffDentalSample";
import ClimaNovaEnergyFlow from "./ClimaNovaEnergyFlow";
import ClimaNovaSample from "./ClimaNovaSample";
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
import SynapserStudioDemo from "./SynapserStudioDemo";
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

/** Same string in both locales (e.g. code identifiers, English-only tech terms). */
const mono = (s: string): Localized => ({ en: s, ko: s });

export type LabExperiment = {
  Demo: ComponentType;
  /** Implementation notes shown below the live demo. */
  notes: {
    libraries: Localized[];
    points: Localized[];
    snippet: { label: Localized; code: string };
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
        mono("Roboto Flex (Google) — wght + wdth variable axes stand-in"),
        mono("font-variation-settings — per-letter mouse distance mapping"),
        mono("LabStickyScroll + gsap.set — 3 specimen scroll crossfade"),
      ],
      points: [
        {
          en: "360vh sticky pin — crossfades 3 specimens: NEUE MONTREAL / GROTESQUE / HAIRLINE BLACK.",
          ko: "360vh sticky pin — NEUE MONTREAL / GROTESQUE / HAIRLINE BLACK 3 specimen 전환.",
        },
        {
          en: "Per-letter span + mousemove — distance-based real-time interpolation of wght (920→base) and wdth (140→55).",
          ko: "글자별 span + mousemove — 거리 기반 wght(920→base)·wdth(140→55) 실시간 보간.",
        },
        {
          en: "Scroll progress raises baseWght — a layer where the overall tone thickens the more you scroll.",
          ko: "scroll progress가 baseWght 상승 — 스크롤할수록 전체 톤이 두꺼워지는 레이어.",
        },
        {
          en: "Black field + mono HUD (wght/wdth/specimen) — the minimal showcase tone of neuemontreal.com.",
          ko: "블랙 필드 + mono HUD(wght/wdth/specimen) — neuemontreal.com 미니멀 쇼케이스 톤.",
        },
      ],
      snippet: {
        label: { en: "Mouse distance → variable axes", ko: "마우스 거리 → variable axes" },
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
        mono("@react-three/fiber + drei Float — KFC striped bucket 3D"),
        mono("gsap.set — reward box stagger bounce, CTA scale"),
        mono("LabStickyScroll — 5-section onboarding journey scrub"),
      ],
      points: [
        mono("480vh sticky — HERO → 50 PTS counter → KFC BOX list → DRIVE THE BUCKET → CTA."),
        mono("3D bucket: scroll game phase sinus path + Float idle; pointer parallax rotation."),
        mono("Points 0→250 mapped to scroll local; boxes data-kfc-box stagger reveal."),
        {
          en: "Background cream→pink→red transition — the kfc.it loyalty onboarding tone.",
          ko: "배경 cream→pink→red 전환 — kfc.it loyalty 온보딩 톤.",
        },
      ],
      snippet: {
        label: { en: "Scroll points + bucket path", ko: "스크롤 포인트 + 버킷 경로" },
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
        mono("@react-three/fiber — scroll-driven camera dolly"),
        mono("gsap — loading radar sweep overlay"),
        {
          en: "LabStickyScroll — far→near (drone) + card reveal",
          ko: "LabStickyScroll — 원경→근경(드론) + 카드 reveal",
        },
      ],
      points: [
        mono("480vh sticky — loading radar → aerial dolly → capability cards."),
        mono("Camera keys: wide 16m → medium 3.6m → close 1.15m on hero UAV."),
        mono("Distant wireframe threats fade as camera locks on SURGE unit."),
        mono("4 DOM cards stagger at 52%–88% — Detect / Deploy / OS / EW."),
      ],
      snippet: {
        label: { en: "Scroll → camera dolly", ko: "스크롤 → 카메라 돌리" },
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
        mono("gsap quickTo — pointer tension on grid lines"),
        mono("LabStickyScroll — 3-phase scroll journey (780vh)"),
        mono("CSS horiz-scroll — framed media + copy panel swap"),
      ],
      points: [
        mono("Phase 1 (0–17%): hero grid — spacer 25vh→4vh, line draw, partner bar."),
        mono("Phase 2 (14–70%): horiz-scroll — 3 framed slides + floating copy panels."),
        {
          en: "Frame: diagonal lines, extended media lines, corner dots (reference horiz-scroll).",
          ko: "Frame: diagonal lines, extended media lines, corner dots (레퍼런스 horiz-scroll).",
        },
        mono("Phase 3 (66–100%): expertise cards stagger + 600MW/3.2GW/327MW metrics."),
      ],
      snippet: {
        label: mono("horiz-scroll track"),
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
        mono("@react-three/fiber — particle shard / shattered / humanoid / cone"),
        mono("Full-viewport diagonal push-up transition (clip-path)"),
        mono("LabStickyScroll — 4 cinematic chapters (920vh)"),
      ],
      points: [
        mono("Each chapter is a full-screen scene — not a framed viewport."),
        mono("Scroll: next screen pushes up, diagonal seam wipes over previous."),
        mono("Hero shard → shattered cluster → humanoid → cone particle shapes."),
        mono("Hover repulses particles; transition adds falling particle stream."),
      ],
      snippet: {
        label: { en: "Diagonal full-screen transition", ko: "대각선 전체 화면 전환" },
        code: `const pushY = lerp(18, 0, smoothstep(t));
incoming.style.clipPath = incomingClip(t);
outgoing.style.clipPath = outgoingClip(t);`,
      },
    },
  },
  rsquad: {
    Demo: RsquadGeometryMorph,
    Sample: RsquadSample,
    notes: {
      libraries: [
        mono("@react-three/fiber — particle shell + EdgesGeometry wireframe"),
        mono("Scroll-driven polyhedron morph (5 platonic solids)"),
        mono("LabStickyScroll — Clarke narrative chapters (720vh)"),
      ],
      points: [
        mono("Black/white rsquad.io palette — cyan wire accent (#b8fff0)."),
        mono("4500 particles morph tetra → cube → octa → icosa → dodeca on scroll."),
        mono("EdgesGeometry cage raycast-morphs in sync with particle shell."),
        mono("Glitch typography on section change; pointer parallax on 3D group."),
      ],
      snippet: {
        label: { en: "Scroll → geometry morph", ko: "스크롤 → 기하 모핑" },
        code: `const { from, to, t } = morphState(progress);
sampleMorph(buffers, from, to, t, count, workPos);
// wire: raycastPolyhedron(dir, geo, r) per edge vertex`,
      },
    },
  },
  "air-business-center": {
    Demo: AirBusinessCenterFloors,
    Sample: AirBusinessCenterSample,
    notes: {
      libraries: [
        mono("@react-three/fiber — meshPhysicalMaterial glass towers"),
        mono("Scroll floor reveal + explode offset per slab"),
        mono("LabStickyScroll — 580vh premium real-estate chapters"),
      ],
      points: [
        mono("Hero: oversized A/I/R cropped at viewport — letters spread and fade on scroll."),
        mono("Center ribbed sculpture rotates, then crossfades to three twisted towers."),
        mono("Camera dollies from typographic framing into floor-by-floor tower scrub."),
        mono("White editorial chapters — Class (A) hero → momentum → facade → lobby."),
      ],
      snippet: {
        label: { en: "Scroll → floor-by-floor transition", ko: "스크롤 → 층별 전환" },
        code: `const reveal = clamp01((progress - 0.48) / 0.38);
const active = floor(reveal * (floors - 1));
const explode = clamp01((reveal - floorT) * floors) * 0.2;
// emissiveIntensity peaks on active floor slab`,
      },
    },
  },
  reventador: {
    Demo: ReventadorCarbonCurve,
    Sample: ReventadorSample,
    notes: {
      libraries: [
        mono("Full-viewport chapter slide-up — 9 editorial sections (2600vh)"),
        mono("ScreenFrame bezel — carbon SVG chart inside monitor mockup"),
        mono("Light/dark layout alternation + scroll-scrubbed module tabs & process steps"),
      ],
      points: [
        mono("2600vh sticky — hero → benefits ticker → 3 pillars → SmartZero monitor → module hub → 4-step → vs alternatives → stats → CTA."),
        mono("Chart only renders inside ScreenFrame — scroll bends emissions curve during SmartZero chapter."),
        mono("Benefits, modules and process steps crossfade by scroll index — mimics parallax copy swaps."),
        mono("Alternating BG_LIGHT / BG_DARK chapters — reventador.global page rhythm."),
      ],
      snippet: {
        label: { en: "Chapter slide-up", ko: "챕터 슬라이드업" },
        code: `const riseSmartZero = panelRise(progress, 0.28, 0.4);
<ChapterSlide rise={riseSmartZero} zIndex={40}>
  <ScreenFrame><CarbonChart reduction={reduction} /></ScreenFrame>
</ChapterSlide>`,
      },
    },
  },
  podium: {
    Demo: PodiumVideoScrub,
    Sample: PodiumSample,
    notes: {
      libraries: [
        mono("GLSL sports film shader — scroll-scrubbed multi-clip blend"),
        mono("@react-three/fiber — PodiumMonolith (3-beat visibility) + MosaicCluster"),
        mono("LabStickyScroll — 3200vh continuous sequence + chapter slide-up"),
      ],
      points: [
        mono("3D object: visible at 20–40%, 44–62%, 74–96% scroll — hide between beats (Codrops footer object)."),
        mono("WebGL mosaic: tilted planes spread on Work chapter — replaces flat CSS stills."),
        mono("PodiumMonolith: tiered steps + dual torus rings, camera shifts per phase."),
        mono("Film layer dims when 3D/mosaic active — layered WebGL + DOM chapters."),
      ],
      snippet: {
        label: { en: "Scroll → video scrub", ko: "스크롤 → 영상 스크럽" },
        code: `scrubRef.current = easeOut(smoothstep(0.04, 0.78, progress));
// shader: seg = uScrub * 4.0 — crossfade trail/speed/mountain/night
video.currentTime = duration * progress; // ref pattern`,
      },
    },
  },
  "tower-architectural-doors": {
    Demo: TowerArchitecturalDoors,
    Sample: TowerArchitecturalDoorsSample,
    notes: {
      libraries: [
        mono("@react-three/fiber + drei RoundedBox — TA8™ aluminum frame assembly"),
        mono("Scroll-scrubbed explode offsets per part (frame, seal, hinge, cladding)"),
        mono("LabStickyScroll — 3000vh load counter + 9 chapter crossfade"),
      ],
      points: [
        mono("0→100% welcome load overlay — fades before hero (towerdoors.com.au)."),
        mono("Sticky WebGL door scrubs explode 0→peak→reassemble while HTML chapters crossfade left."),
        mono("Milestone rail 0·15·27·35·55·70·87·95·100 — scroll % sync."),
        mono("Active part emissive pulse on frame / seal / hinge / cladding chapters."),
      ],
      snippet: {
        label: { en: "Scroll → exploded view", ko: "스크롤 → 분해도" },
        code: `const e = rise * fall; // peak mid-scroll, reassemble end
leftFrame.position.x = lerp(0, -0.95, e);
sealGroup.position.z = lerp(0.02, 0.55, e);
hingeGroup.rotation.z = lerp(0, 0.35, e);`,
      },
    },
  },
  "fabrics-protection": {
    Demo: FabricsProtectionWeave,
    Sample: FabricsProtectionSample,
    notes: {
      libraries: [
        mono("GLSL macro fabric weave shader — replaces background video (en.protection.gr)"),
        mono("@react-three/fiber — displaced plane + scroll-driven uProtection uniform"),
        mono("LabStickyScroll — 2900vh chapter slide-up + lotus effect simulation"),
      ],
      points: [
        mono("Scroll 0→1 drives water repellency — stains fade, droplets bead and roll off."),
        mono("Macro camera zooms into weave as scroll progresses — pointer parallax on fabric."),
        mono("Chapters: Fabrics · Applications · Technology · specs · heritage · contact."),
        mono("Technical data rail: waterproof 100%, spray grade 5, UPF 80, GTOT 0.04."),
      ],
      snippet: {
        label: { en: "Scroll → lotus effect", ko: "스크롤 → 로터스 이펙트" },
        code: `protectionRef.current = easeInOut(smoothstep(0.18, 0.72, progress));
// shader: droplets roll up as uProtection rises
drops += drop(uv, center, r) * smoothstep(0.2, 0.55, uProtection);`,
      },
    },
  },
  "world-cup-2026": {
    Demo: WorldCup2026DataViz,
    Sample: WorldCup2026Sample,
    notes: {
      libraries: [
        mono("SVG host-city map — 16 pins with nation colour coding (USA · Mexico · Canada)"),
        mono("React state filter — team / city / nation clicks reconfigure fixtures + groups"),
        mono("LabStickyScroll — 3000vh editorial chapters (sheets.works data-viz)"),
      ],
      points: [
        mono("Signature: click stadium or team → fixture list and group grid filter dynamically."),
        mono("Scroll chapters: Azteca opener → stats → Argentina → hosts map → legends → Dallas heat → mascots → 12 groups → MetLife final."),
        mono("48 nations · 16 cities · 104 matches · 39 days — count-up on scroll reveal."),
        mono("Clay-card mascots + debutant chips — warm editorial palette matching reference."),
      ],
      snippet: {
        label: { en: "Click → data filter", ko: "클릭 → 데이터 필터" },
        code: `const filtered = FIXTURES.filter((m) => {
  if (selectedCity && m.city !== selectedCity) return false;
  if (selectedTeam && m.home !== team && m.away !== team) return false;
  return nationMatchesCity(m.city, filterNation);
});`,
      },
    },
  },
  "south-cliff-dental": {
    Demo: SouthCliffDentalExplore,
    Sample: SouthCliffDentalSample,
    notes: {
      libraries: [
        mono("@react-three/fiber + drei RoundedBox — low-poly practice buildings + dental chair"),
        mono("Scroll-scrubbed camera path — lobby through 5 regional practices"),
        mono("LabStickyScroll — 2800vh chapters + click-to-fly location navigation"),
      ],
      points: [
        mono("Signature: click location pin or list item — camera lerps to that practice in 3D."),
        mono("5 practices: West Sussex · East Sussex · Kent · Hampshire · Wiltshire."),
        mono("Chapters: treatments · emergency · +546K stats · locations · book CTA."),
        mono("Tooth icon + chair props per building — clinical teal/navy palette."),
      ],
      snippet: {
        label: { en: "Click → 3D navigation", ko: "클릭 → 3D 네비게이션" },
        code: `focusPos.set(practice.x + 2.5, 1.8, practice.z + 3);
focusLook.set(practice.x, 1.2, practice.z);
targetPos.lerp(focusPos, focusBlend * 0.85);
camera.position.lerp(targetPos, 0.07);`,
      },
    },
  },
  climanova: {
    Demo: ClimaNovaEnergyFlow,
    Sample: ClimaNovaSample,
    notes: {
      libraries: [
        mono("LabStickyScroll — 3400vh stacked panel slide-up (bottom → top)"),
        mono("SVG isometric illustrations — house hero · solar system · module stack"),
        mono("SplitBlock — text and visual rise on staggered scroll offsets (cross parallax)"),
      ],
      points: [
        mono("Signature: each chapter panel translates up from 108% — light hero → warm day → navy night."),
        mono("12 sections in reference order — jour · pointe · nuit · système · modules · essentials · CTA."),
        mono("No WebGL particles — matches climanovaquebec.com editorial scroll storytelling."),
        mono("Teal accent + navy dramatic beats — ClimaLogo glow on dark chapters."),
      ],
      snippet: {
        label: { en: "Panel slide-up", ko: "패널 슬라이드업" },
        code: `const panelRise = easeInOut(smoothstep(start, end, progress));
transform: translateY(lerp(108, 0, panelRise) + '%');
// textRise vs visualRise offset → cross-scroll`,
      },
    },
  },
  cryptowl: {
    Demo: CryptOwlTimeline,
    Sample: CryptOwlSample,
    notes: {
      libraries: [
        mono("@react-three/fiber + drei Line — CatmullRom timeline tube"),
        mono("emissive glow nodes — scroll proximity pulse"),
        mono("LabStickyScroll — 480vh timeline camera scrub"),
      ],
      points: [
        {
          en: "480vh sticky — 5 segments: Time → Strategy → Replay → Control → Analytics.",
          ko: "480vh sticky — Time → Strategy → Replay → Control → Analytics 5구간.",
        },
        mono("CatmullRomCurve3 tube + 6 nodes — progress→getPointAt camera lerp."),
        {
          en: "Node emissiveIntensity — active glow based on |progress - nodeT|.",
          ko: "노드 emissiveIntensity — |progress - nodeT| 기반 활성 글로우.",
        },
        {
          en: "Metric HUD — Net PnL +$1,152, ROI +11.52%, etc. update on scroll thresholds.",
          ko: "메트릭 HUD — Net PnL +$1,152, ROI +11.52% 등 scroll threshold 갱신.",
        },
      ],
      snippet: {
        label: { en: "Scroll → timeline camera", ko: "스크롤 → 타임라인 카메라" },
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
        mono("@react-three/fiber — scroll-scrub camera lerp + lookAt"),
        {
          en: "Procedural loft shell — 4 zones: Living/Kitchen/Dining/Suite",
          ko: "프로시저럴 로프트 셸 — Living/Kitchen/Dining/Suite 4 zone",
        },
        mono("LabStickyScroll — 500vh sticky walkthrough"),
      ],
      points: [
        {
          en: "500vh sticky — CAMERA_KEYS 5 keyframes, progress→pos/look smoothstep lerp.",
          ko: "500vh sticky — CAMERA_KEYS 5키프레임, progress→pos/look smoothstep lerp.",
        },
        {
          en: "4 room zones along -Z — furniture proxies + WindowWall emissive + exposed beams.",
          ko: "4 room zones along -Z — 가구 proxy + WindowWall emissive + exposed beams.",
        },
        {
          en: "RoomLights point intensity — lighting transitions based on camera distance.",
          ko: "RoomLights point intensity — 카메라 거리 기반 조명 전환.",
        },
        {
          en: "Noto Serif + Fragment Mono tone — 'We build sensational spaces' copy.",
          ko: "Noto Serif + Fragment Mono 톤 — We build sensational spaces 카피.",
        },
      ],
      snippet: {
        label: { en: "Scroll → camera walkthrough", ko: "스크롤 → 카메라 워크스루" },
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
        mono("@react-three/fiber — Points + InstancedMesh petal layer"),
        {
          en: "Wind vector field — sin/cos noise + pointer wind bias",
          ko: "바람 벡터 필드 — sin/cos noise + pointer wind bias",
        },
        {
          en: "readPixels — bottom-center canvas pixel → CSS background sync",
          ko: "readPixels — 캔버스 중앙 하단 픽셀 → CSS background 동기화",
        },
      ],
      points: [
        {
          en: "440vh sticky — 4 segments: Home → Work → Services → Start a Project.",
          ko: "440vh sticky — Home → Work → Services → Start a Project 4구간.",
        },
        {
          en: "1100 soft points + 280 petal planes — organic paper/leaf-tone PALETTE.",
          ko: "1100 soft points + 280 petal planes — organic paper/leaf 톤 PALETTE.",
        },
        {
          en: "windRef = 0.45 + progress×0.85 — wind strength and particle speed rise on scroll.",
          ko: "windRef = 0.45 + progress×0.85 — 스크롤 시 바람 세기·파티클 속도 상승.",
        },
        {
          en: "preserveDrawingBuffer + readPixels — recreates northgarden.com's theme-color pattern.",
          ko: "preserveDrawingBuffer + readPixels — northgarden.com theme-color 패턴 재현.",
        },
      ],
      snippet: {
        label: { en: "Wind field + background sampling", ko: "바람 필드 + 배경 샘플" },
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
        {
          en: "Custom GLSL — scroll-driven multi-stop gradient sweep",
          ko: "커스텀 GLSL — scroll-driven multi-stop gradient sweep",
        },
        mono("@react-three/fiber — transmission bubble cluster"),
        mono("LabStickyScroll + gsap.set — drink card stagger"),
      ],
      points: [
        {
          en: "420vh sticky — 4 segments, Coral→Magenta→Limón→Cola gradient transition.",
          ko: "420vh sticky — 4구간 Coral→Magenta→Limón→Cola 그라디언트 전환.",
        },
        {
          en: "uProgress + sweep band — the background palette slides quickly on each scroll.",
          ko: "uProgress + sweep band — 스크롤마다 배경 팔레트가 빠르게 슬라이드.",
        },
        {
          en: "Section-boundary pulseRef decay — a rhythmic flash on each gradient cut.",
          ko: "섹션 경계 pulseRef decay — 그라디언트 컷 시 리듬감 있는 플래시.",
        },
        {
          en: "3D bubble transmission + pointer parallax — the 'La burbuja Ibérica' metaphor.",
          ko: "3D 버블 transmission + pointer parallax — La burbuja Ibérica 메타포.",
        },
      ],
      snippet: {
        label: { en: "Scroll → gradient palette", ko: "스크롤 → 그라디언트 팔레트" },
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
        mono("@react-three/fiber — glass bottle + liquid meshPhysicalMaterial"),
        {
          en: "Custom GLSL fluid backdrop — wave surface linked to uFill",
          ko: "커스텀 GLSL fluid backdrop — uFill 연동 파도 surface",
        },
        mono("LabStickyScroll — fill 0→100% scroll scrub"),
      ],
      points: [
        mono("450vh sticky — HYDROFLOW → Solana Splash → WATER MEETS INNOVATION → SCAN IT."),
        {
          en: "fillRef = (progress-0.08)/0.72 — liquid cylinder scale.y + bottom-anchored fill position.",
          ko: "fillRef = (progress-0.08)/0.72 — 액체 cylinder scale.y + position 하단 고정 채움.",
        },
        {
          en: "Fluid shader uFill — the background water level rises in sync with scroll.",
          ko: "Fluid shader uFill — 배경 수면 높이가 스크롤과 동기 상승.",
        },
        {
          en: "pointer → bottle rotation.y/x — the 'Rotate Hydroflow' reference.",
          ko: "pointer → bottle rotation.y/x — Rotate Hydroflow 레퍼런스.",
        },
      ],
      snippet: {
        label: { en: "Scroll liquid fill", ko: "스크롤 액체 채움" },
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
        mono("@react-three/fiber — 6 alcove universe, unified group rotation"),
        mono("@react-three/drei — procedural watch variants per universe"),
        mono("LabStickyScroll — 500vh sticky, scroll-driven scene swap"),
      ],
      points: [
        {
          en: "Camera fixed at the origin — looks outward from the center inside a cylindrical stage (CYLINDER_R=7).",
          ko: "카메라 원점 고정 — 원통 무대(CYLINDER_R=7) 내부 중앙에서 바깥을 바라봄.",
        },
        {
          en: "Only background panels sit on the cylinder at 180° intervals — stage.rotation.y increases by π on each scroll.",
          ko: "배경 패널만 원통에 180° 간격 배치 — 스크롤마다 stage.rotation.y가 π씩 증가.",
        },
        {
          en: "The hero watch is a child of the camera with counter-rotation.y = -stageRot — kept fixed at screen center.",
          ko: "히어로 시계는 camera 자식 + counter-rotation.y = -stageRot — 화면 중앙 고정.",
        },
        {
          en: "Watch crossfade over local 0.76→0.98 — synced to the background universe transition.",
          ko: "local 0.76→0.98 구간에서 시계 crossfade — 배경 universe 전환 시점과 동기.",
        },
      ],
      snippet: {
        label: { en: "Fixed watch + counter-rotation", ko: "고정 시계 + 반대 회전" },
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
        {
          en: "@react-three/fiber — fog, Float, useFrame parallax",
          ko: "@react-three/fiber — fog, Float, useFrame 패럴럭스",
        },
        {
          en: "Custom GLSL — mist overlay (uDensity) + warm grading",
          ko: "커스텀 GLSL — mist 오버레이(uDensity) + warm 그레이딩",
        },
        mono("LabStickyScroll — 400vh sticky, 3 practice fog reveal"),
      ],
      points: [
        {
          en: "400vh sticky pin — splits progress into 3 segments (School/Craft/Retreat); fog lifts and objects scale in at each segment's center.",
          ko: "400vh sticky pin — progress를 School/Craft/Retreat 3구간으로 분할, 구간 중심에서 안개 걷힘·오브젝트 scale in.",
        },
        {
          en: "FogGradingPlane GLSL + three.js fog — recreates ethereal mist via uDensity linked to scroll and visibility.",
          ko: "FogGradingPlane GLSL + three.js fog — scroll·visibility에 연동된 uDensity로 ethereal mist 재현.",
        },
        {
          en: "3 objects — Enso circle, ceramic, zen stone — Japanese-aesthetic symbolic geometry with pointer drift.",
          ko: "원(Enso)·도자기·선석 3 오브젝트 — 일본 미학 symbolic geometry, pointer drift.",
        },
        {
          en: "DOM serif typography + 和 + Mist % HUD — the izanami-official.com tone (#ebe6dc, #8b7355).",
          ko: "DOM serif 타이포 + 和 + Mist % HUD — izanami-official.com 톤(#ebe6dc, #8b7355).",
        },
      ],
      snippet: {
        label: {
          en: "Scroll → fog density + practice visibility",
          ko: "스크롤 → 안개 밀도 + practice visibility",
        },
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
        mono("gsap — gsap.set card transform, gsap.utils.clamp"),
        mono("LabStickyScroll — 380vh sticky + scrub reveal"),
        mono("DOM/CSS — hover yellow accent, no WebGL"),
      ],
      points: [
        {
          en: "380vh sticky pin — first half (0–52%) reveals 4 service cards, second half (48–100%) reveals 4 reference cards in sequence.",
          ko: "380vh sticky pin — 전반(0–52%) 서비스 4카드, 후반(48–100%) 레퍼런스 4카드 순차 reveal.",
        },
        {
          en: "Card hover: lift + thumb scale + #f1e500 left bar and underline — digitalists' practical card motion.",
          ko: "카드 hover: lift + thumb scale + #f1e500 좌측 바·underline — digitalists 실무 카드 모션.",
        },
        {
          en: "The headline switches Leistungen ↔ Referenzen with progress; #kein0815 brand tone.",
          ko: "헤드라인이 progress에 따라 Leistungen ↔ Referenzen 전환, #kein0815 브랜드 톤.",
        },
        {
          en: "Awwwards palette #171717 / #F2F2F2 / #f1e500 — recreates the WordPress-agency tone.",
          ko: "Awwwards 팔레트 #171717 / #F2F2F2 / #f1e500 — WordPress 에이전시 톤 재현.",
        },
      ],
      snippet: {
        label: { en: "Scroll → sequential card reveal", ko: "스크롤 → 카드 순차 reveal" },
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
        {
          en: "Custom GLSL — RGB channel shift, slice displacement, grit noise",
          ko: "커스텀 GLSL — RGB 채널 시프트, 슬라이스 displacement, grit noise",
        },
        mono("@react-three/fiber — orthographic fullscreen shader plane"),
        {
          en: "LabStickyScroll — 400vh sticky, glitch burst at section boundaries",
          ko: "LabStickyScroll — 400vh sticky, 섹션 경계 glitch burst",
        },
      ],
      points: [
        {
          en: "400vh sticky pin — splits progress into 4 work sections; on entering each, uGlitch=1 → 0.9 decay drives a burst.",
          ko: "400vh sticky pin — progress를 4개 워크 섹션으로 분할, 구간 진입 시 uGlitch=1 → 0.9 decay로 버스트.",
        },
        {
          en: "Fragment shader: procedural editorial paper + grit grain; on glitch, R/G/B UV separation, slice offset, and scanlines.",
          ko: "Fragment shader: procedural editorial paper + grit grain, glitch 시 R/G/B UV 분리·슬라이스 offset·스캔라인.",
        },
        {
          en: "RGB text-shadow synced on DOM typography — the shader burst and HTML headline break together.",
          ko: "DOM 타이포에 RGB text-shadow 동기화 — 셰이더 버스트와 HTML 헤드라인이 함께 깨짐.",
        },
        {
          en: "Glitch burst % HUD + scanline mix-blend overlay — recreates the reference's section-transition signature.",
          ko: "Glitch burst % HUD + scanline mix-blend overlay — 레퍼런스 섹션 전환 시그니처 재현.",
        },
      ],
      snippet: {
        label: { en: "Section boundary → glitch burst", ko: "섹션 경계 → glitch 버스트" },
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
        {
          en: "Web Audio API — OscillatorNode + AnalyserNode real-time frequency data",
          ko: "Web Audio API — OscillatorNode + AnalyserNode 실시간 주파수 데이터",
        },
        {
          en: "@react-three/fiber — InstancedMesh bars, Points particles, Line staff",
          ko: "@react-three/fiber — InstancedMesh 바, Points 파티클, Line 악보",
        },
        {
          en: "LabStickyScroll — 400vh sticky + scrub, 4 phases Silence→Resonance",
          ko: "LabStickyScroll — 400vh sticky + scrub, 4단계 Silence→Resonance",
        },
      ],
      points: [
        {
          en: "Break the Silence gate — after a click/key press a procedural violin chord plays, and the Analyser feeds waveform and particle amplitude.",
          ko: "Break the Silence 게이트 — 클릭/키 입력 후 프로시저럴 바이올린 화음 재생, Analyser가 파형·파티클 amplitude에 반영.",
        },
        {
          en: "400vh sticky pin — scroll progress drives amp, staff overlay, and 4-phase (Silence/Pulse/Waveform/Resonance) transitions.",
          ko: "400vh sticky pin — scroll progress로 amp·악보 오버레이·4 Phase(Silence/Pulse/Waveform/Resonance) 전환.",
        },
        {
          en: "InstancedMesh 72 bars + Line curve + 320 soft particles — a scroll-sine fallback keeps the visuals alive even without audio.",
          ko: "InstancedMesh 72바 + Line 곡선 + 320 soft particles — 오디오 없어도 scroll sine fallback으로 시각 유지.",
        },
        {
          en: "Mute/Unmute toggle + headphone hint — recreates the theirisk.com UX flow.",
          ko: "Mute/Unmute 토글 + 헤드폰 안내 — 레퍼런스 theirisk.com UX 흐름 재현.",
        },
      ],
      snippet: {
        label: { en: "Analyser → waveform bar height", ko: "Analyser → 파형 바 높이" },
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
        mono("gsap — gsap.set word transform, gsap.utils.clamp"),
        mono("LabStickyScroll — 400vh sticky + scrub"),
        {
          en: "DOM/CSS — per-word spans, will-change-transform",
          ko: "DOM/CSS — 단어 단위 span, will-change-transform",
        },
      ],
      points: [
        {
          en: "400vh sticky pin — splits progress into 3 phrases × 3 stages (together/split/reform); the typography sequence plays from scroll alone.",
          ko: "400vh sticky pin — progress를 3구문 × 3단계(together/split/reform)로 분할, 스크롤만으로 타이포 시퀀스 체험.",
        },
        {
          en: "Each word is an inline-block span + ref — x/y/rotation/scale driven directly via gsap.set on scroll onProgress (same effect without SplitText).",
          ko: "각 단어는 inline-block span + ref — scroll onProgress에서 x/y/rotation/scale을 gsap.set으로 직접 제어(SplitText 없이 동일 효과).",
        },
        {
          en: "Split stage: words radial-explode; Reform stage: they converge back — recreates PRODUX's signature 'split/reassemble'.",
          ko: "Split 단계: 단어가 radial explode, Reform 단계: 원위치로 수렴 — PRODUX 시그니처 '분해/재조합' 재현.",
        },
        {
          en: "Together/Split/Reform phase indicator + Spread % + Phrase counter make scroll feedback clear.",
          ko: "Together/Split/Reform 페이즈 인디케이터 + Spread % + Phrase 카운터로 스크롤 피드백 명확화.",
        },
      ],
      snippet: {
        label: { en: "Scroll → word split/reassemble", ko: "스크롤 → 단어 분해/재조합" },
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
    Demo: SynapserStudioDemo,
    Sample: SynapserStudioSample,
    notes: {
      libraries: [
        mono("@react-three/fiber — Canvas, useFrame, useThree"),
        mono("@react-three/drei — Float, Line, useGLTF, fog"),
        mono("IndexedDB — custom GLB persist across demo + sample pages"),
      ],
      points: [
        {
          en: "400vh sticky pin — splits progress 0–1 into 3 scenes (Manifesto/Archive/Journey); each segment scale-fades its own 3D object set.",
          ko: "400vh sticky pin — progress 0–1을 3개 장면(Manifesto/Archive/Journey)으로 분할, 각 구간마다 독립 3D 오브젝트 세트 scale fade.",
        },
        {
          en: "Per-scene settings: 3D model + lighting · background · object motion · camera · camera animation (keyframes) — saved to localStorage.",
          ko: "씬별 설정: 3D 모델 + 조명 · 배경 · 오브젝트 움직임 · 카메라 · 카메라 애니메이션(키프레임) — localStorage 저장.",
        },
        {
          en: "3-keyframe camera-path lerp + pointer drift; custom models scale to scroll visibility.",
          ko: "카메라 경로 3키프레임 lerp + pointer drift, custom 모델은 스크롤 visibility에 맞춰 scale.",
        },
        {
          en: "HTML typography overlay fades by sceneIndex + local progress — scroll-driven storytelling synced with the 3D scene.",
          ko: "HTML 타이포 오버레이는 sceneIndex + local progress fade — 3D 씬과 동기화된 scroll-driven storytelling.",
        },
      ],
      snippet: {
        label: {
          en: "Scroll progress → scene weights + camera",
          ko: "스크롤 progress → 장면 가중치 + 카메라",
        },
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
        mono("gsap — letter scatter timeline, hover glitch"),
        {
          en: "DOM/CSS — RGB text-shadow glitch, monospace HUD",
          ko: "DOM/CSS — RGB text-shadow 글리치, monospace HUD",
        },
        {
          en: "React state — manages only broken/coordinate/click counters",
          ko: "React state — broken/좌표/클릭 카운터만 관리",
        },
      ],
      points: [
        {
          en: "LabStickyScroll (350vh) — letters scatter in sequence with scroll progress; showcase reveals past 92%.",
          ko: "LabStickyScroll(350vh) — 스크롤 progress에 따라 글자가 순차 scatter, 92% 이상에서 showcase reveal.",
        },
        {
          en: "Per-letter thresholds scrub the break apart — experience the CLICK TO BREAK signature via scroll.",
          ko: "글자별 threshold로 scrub 분해 — CLICK TO BREAK 시그니처를 스크롤 기반으로 체험 가능.",
        },
        {
          en: "Click triggers an instant full break (secondary interaction); the coordinate HUD shows X/Y/BRK on pointermove.",
          ko: "클릭 시 즉시 full break(보조 인터랙션), 좌표 HUD는 pointermove로 X/Y/BRK 표시.",
        },
        {
          en: "React-mapped letter spans + gsap.set/transform only — no direct DOM innerHTML.",
          ko: "React map 글자 span + gsap.set/transform만 사용 — DOM 직접 innerHTML 없음.",
        },
      ],
      snippet: {
        label: { en: "CLICK TO BREAK — letter scatter", ko: "CLICK TO BREAK — 글자 scatter" },
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
        {
          en: "@react-three/fiber + drei Float — central floating 3D, mouse parallax",
          ko: "@react-three/fiber + drei Float — 중앙 플로팅 3D, 마우스 패럴럭스",
        },
        {
          en: "gsap + LabStickyScroll — sequential grid-card reveal",
          ko: "gsap + LabStickyScroll — 그리드 카드 순차 reveal",
        },
        { en: "DOM/CSS — editorial grid layout", ko: "DOM/CSS — editorial 그리드 레이아웃" },
      ],
      points: [
        {
          en: "LesseStudioFloatingObject — torusKnot + accent shapes, subtle pointer rotation/position.",
          ko: "LesseStudioFloatingObject — torusKnot + 보조 형태, pointer 미세 rotation/position.",
        },
        {
          en: "3D placed in the sample hero and early demo sticky — fades out via heroFade on scroll.",
          ko: "샘플 히어로 + 데모 sticky 초반에 3D 배치 — 스크롤 시 heroFade로 fade out.",
        },
        {
          en: "LabStickyScroll (350vh) — 6 cards reveal in sequence via opacity/y/scale.",
          ko: "LabStickyScroll(350vh) — 6개 카드 opacity/y/scale 순차 reveal.",
        },
        {
          en: "Card hover: gsap thumb scale and underline — a micro-interaction independent of scroll.",
          ko: "카드 hover: gsap thumb scale·underline — 스크롤과 독립 마이크로 인터랙션.",
        },
      ],
      snippet: {
        label: mono("Nested scroller + ScrollTrigger reveal"),
        code: `gsap.to(card, {
  opacity: 1,
  y: 0,
  duration: 0.7,
  scrollTrigger: {
    trigger: card,
    scroller: scrollContainerRef.current, // demo inner scroll
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
        mono("@react-three/fiber — Canvas, useFrame scroll-scrub 3D"),
        {
          en: "three — Hero torusKnot·shards, per-project 3D preview shape",
          ko: "three — Hero torusKnot·shards, 프로젝트별 3D 프리뷰 shape",
        },
        mono("LabStickyScroll + GSAP ScrollTrigger scrub"),
      ],
      points: [
        {
          en: "680vh sticky — Hero (0–54%): progress→rotation/position mapped directly; the 3D stops when scrolling stops.",
          ko: "680vh sticky — Hero(0–54%): progress→rotation/position 직접 매핑, 스크롤 멈추면 3D도 정지.",
        },
        {
          en: "Hero typography crossfades across 3 chapters with rising translateY — swapping 'Creative at the Speed of Next' and more.",
          ko: "히어로 타이포 3챕터 crossfade + translateY 상승 — Creative at the Speed of Next 등 교체.",
        },
        {
          en: "Work (54–92%): project list reveals in sequence; on hover, weightsRef lerp swaps the 3D preview behind.",
          ko: "Work(54–92%): 프로젝트 리스트 순차 reveal, hover 시 weightsRef lerp로 뒤쪽 3D 프리뷰 교체.",
        },
        {
          en: "Custom cursor dot (mix-blend-difference), Contact closing section.",
          ko: "커스텀 커서 dot(mix-blend-difference), Contact 마무리 섹션.",
        },
      ],
      snippet: {
        label: { en: "Scroll-scrub 3D + hover weight", ko: "스크롤 scrub 3D + hover weight" },
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
        {
          en: "@react-three/fiber — hero 3D shards + mouse parallax",
          ko: "@react-three/fiber — 히어로 3D 샤드 + 마우스 패럴럭스",
        },
        { en: "Canvas 2D — mouse afterimage trail", ko: "Canvas 2D — 마우스 잔상 트레일" },
        {
          en: "CSS mask (Canvas) — cuts the beige shell layer without swapping the whole background",
          ko: "CSS mask (Canvas) — 베이지 껍질 레이어 절단, 배경 통째 교체 없음",
        },
      ],
      points: [
        {
          en: "Single sticky viewport + z-index layers — exposes the inspiration beneath the shell instead of swapping whole panels.",
          ko: "단일 sticky 뷰포트 + z-index 레이어 — 패널 통째 교체가 아닌 껍질(shell) 아래 灵感 노출.",
        },
        {
          en: "CSS mask (Canvas) on the beige shell — only the slashed region (t<reveal) turns transparent, showing the yellow layer behind.",
          ko: "베이지 껍질에 CSS mask(Canvas) — slash 진행(t<reveal) 구간만 투명, 뒤 노란 레이어 비침.",
        },
        {
          en: "Hero 3D + trail → rises via scroll translateY → beige enters → slash gate → shell peel.",
          ko: "히어로 3D+잔상 → scroll translateY로 올라감 → 베이지 진입 → 절단 게이트 → 껍질 peel.",
        },
        {
          en: "Yellow→red: RedDripTop/YellowDripBottom paint drips + continuous scroll sections.",
          ko: "노란→빨강: RedDripTop/YellowDripBottom 페인트 드립 + 연속 scroll 섹션.",
        },
      ],
      snippet: {
        label: { en: "Shell mask cut", ko: "껍질 마스크 절단" },
        code: `// Shell mask: alpha=0 where projection t < reveal
const sealed = t >= reveal - 0.008 ? 1 : 0;
shell.style.maskImage = canvasDataUrl;

// Inner yellow inspiration sits at z-0 behind shell`,
      },
    },
  },
  "hiroto-sato": {
    Demo: HirotoSatoSignage,
    Sample: HirotoSatoSample,
    notes: {
      libraries: [
        mono("@react-three/fiber — Canvas, useFrame, useThree"),
        {
          en: "@react-three/drei — Float (independent idle drift per object), Text (showreel/sign text)",
          ko: "@react-three/drei — Float (오브젝트별 독립 부유 애니메이션), Text (쇼릴/사인 텍스트)",
        },
        {
          en: "gsap + gsap/ScrollTrigger — scrub-based fine rotation-speed / camera-zoom correction",
          ko: "gsap + gsap/ScrollTrigger — scrub 기반의 미세한 회전 속도/카메라 줌 보정",
        },
      ],
      points: [
        {
          en: "LabStickyScroll pattern (300vh track + sticky h-screen + scrub) pins the view on scroll; cluster rotation and camera zoom link to progress.",
          ko: "LabStickyScroll 패턴(300vh 트랙 + sticky h-screen + scrub)으로 페이지 스크롤 시 화면 고정, 클러스터 회전·카메라 줌이 progress에 연동.",
        },
        {
          en: "The main interaction is pointer parallax + scroll orbit: scrollOrbitRef maps Y-axis rotation 0→2π and zooms cameraZ 5.5→3.3.",
          ko: "메인 인터랙션은 포인터 패럴럭스 + 스크롤 오비트: scrollOrbitRef로 Y축 회전 각도를 0→2π 매핑, cameraZ 5.5→3.3 줌.",
        },
        {
          en: "A Scene Phase overlay gives visual feedback on scroll segments (0–33–66–100%) — a simplified take on the reference's scene-transition feel.",
          ko: "Scene Phase 오버레이로 스크롤 구간(0–33–66–100%) 시각적 피드백 — 레퍼런스의 장면 전환 감각을 단순화해 표현.",
        },
        {
          en: "useFrame + ref pattern for 60fps 3D updates; Scroll Progress % is shown via the LabStickyScroll overlay.",
          ko: "useFrame + ref 패턴으로 60fps 3D 업데이트, Scroll Progress %는 LabStickyScroll 오버레이로 표시.",
        },
      ],
      snippet: {
        label: {
          en: "Pointer parallax → cluster rotation lerp",
          ko: "포인터 패럴럭스 → 클러스터 회전 lerp",
        },
        code: `const { pointer } = useThree();
const target = useRef({ x: 0, y: 0 });

useFrame((_, delta) => {
  target.current.x = pointer.y * 0.25;
  target.current.y = pointer.x * 0.35;

  cluster.rotation.x += (target.current.x - cluster.rotation.x) * 0.05;
  cluster.rotation.y += (target.current.y - cluster.rotation.y) * 0.05;
  cluster.rotation.y += rotationSpeedRef.current * delta; // slight scroll accel
});`,
      },
    },
  },
  "razorpay-sprint-26": {
    Demo: RazorpaySprintTrack,
    Sample: RazorpaySprintSample,
    notes: {
      libraries: [
        {
          en: "@react-three/fiber — Canvas, useFrame, grouped shoe object",
          ko: "@react-three/fiber — Canvas, useFrame, 그룹형 신발 오브제",
        },
        {
          en: "three — MeshStandardMaterial, emissive track markers",
          ko: "three — MeshStandardMaterial, 트랙 마커 emissive",
        },
        mono("LabStickyScroll + gsap ScrollTrigger scrub"),
      ],
      points: [
        {
          en: "400vh LabStickyScroll sticky pin — R3F useFrame reads the progress ref to lerp shoe z and camera.",
          ko: "400vh LabStickyScroll sticky pin — progress ref를 R3F useFrame에서 읽어 신발 z·카메라 lerp.",
        },
        {
          en: "Two-color palette (#0039FF/#151515) only — consistent across track, shoe, markers, and HUD.",
          ko: "2색 팔레트(#0039FF/#151515)만 사용 — 트랙·신발·마커·HUD 일관.",
        },
        {
          en: "18 track markers emissive-flash as scroll passes — mapped to a Triggers Fired counter of 108+.",
          ko: "18개 트랙 마커가 스크롤 통과 시 emissive flash — Triggers Fired 카운터 108+ 매핑.",
        },
        {
          en: "Typography for Sprint 26's actual 6 sections (Agentic Stack → Business Banking) syncs to progress.",
          ko: "Sprint 26 실제 6대 섹션(Agentic Stack → Business Banking) 타이포가 progress에 동기화.",
        },
      ],
      snippet: {
        label: {
          en: "Scroll progress → 3D position mapping (core structure)",
          ko: "스크롤 progress → 3D 위치 연동 핵심 구조",
        },
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

// inside the R3F component
useFrame(() => {
  const z = -progressRef.current * TRACK_LENGTH;
  object.position.z += (z - object.position.z) * 0.1; // lerp
});`,
      },
    },
  },
};
