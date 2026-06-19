/**
 * Generate Lab planning doc plain text from site metadata.
 */
export function generatePlanningDoc(site, labNum) {
  const num = String(labNum).padStart(2, "0");
  const nameSlug = site.fileSlug ?? site.title.replace(/\s+/g, "-").replace(/&/g, "And");

  return `${site.title} 사이트 실험 기획

레퍼런스: ${site.title} — ${site.url}
카테고리: ${site.categoryLabel}
신뢰도: ${site.confidence}
난이도: ${site.difficulty}
Three.js 핵심: ${site.threeJsCore ? "예" : "아니오 (CSS/DOM/GSAP 중심)"}
사이트 경로: /lab/${site.slug}
Lab 문서: Lab-${num}-${nameSlug}-기획

1. 컨셉 / 메시지
${site.concept}

2. 시그니처 인터랙션
${site.signature}

3. 구현할 기술 (Three.js / R3F / GSAP 기준)
${site.techniques.map((t) => `- ${t}`).join("\n")}

4. 구현 단계 제안
1) 정적 레이아웃 + 타이포/컬러 톤 잡기
2) ${site.techniques[0]}을 위한 핵심 셋업 후 정지 상태로 렌더
3) 스크롤/인터랙션 연동 (${site.signature})
4) 디테일 다듬기 (이징, 퍼포먼스, 반응형, prefers-reduced-motion)

5. 검증 출처
${(site.auditSources ?? ["Live site", "Awwwards"]).map((s) => `- ${s}`).join("\n")}

6. 커서 작업 시 참고
- Three.js 핵심 ${site.threeJsCore ? "→ R3F Canvas + useFrame/ScrollTrigger 패턴" : "→ DOM/CSS/GSAP 우선, WebGL은 보조만"}
- @react-three/drei 헬퍼는 3D Lab에만 적용
- 모바일 성능과 prefers-reduced-motion 접근성 대응 확인
`;
}

/** Canonical lab site data — keep in sync with lab-sites.ts */
export const labSitesForSync = [
  {
    num: 1,
    fileSlug: "Hiroto-Sato",
    slug: "hiroto-sato",
    title: "Hiroto Sato",
    url: "https://hirotos.com",
    categoryLabel: "인터랙티브 포트폴리오 / 크리에이티브 스튜디오",
    confidence: "확인됨",
    difficulty: "중",
    threeJsCore: true,
    concept:
      "중앙의 가느다란 흰색 기둥을 중심으로 거울/아케이드 쇼릴, 태그형 사인, 화살표 표지판이 떠다니는 단일 3D 히어로. 도로 표지판 클러스터처럼 내비게이션을 형상화한다.",
    signature:
      "원형 미러가 아케이드풍 쇼릴 화면을 반사하고, 'HIROTO SATO' 태그·'PROJECTS ARCHIVE' 화살표 표지판이 마우스 움직임에 따라 패럴럭스로 부유.",
    techniques: [
      "떠다니는 3D 오브젝트 클러스터(부유 애니메이션)",
      "마우스 드래그/패럴럭스 회전",
      "반사 머티리얼(미러) + Render Target 쇼릴",
      "표지판형 내비게이션 오브젝트",
    ],
    auditSources: [
      "Live: https://hirotos.com",
      "Awwwards Nominee — hiroto-sato",
      "참고 서브작품 TRACK: https://demo-03-track.hirotos.com (별도 Lab 확장 가능)",
    ],
  },
  {
    num: 3,
    fileSlug: "Tony-Mak",
    slug: "tony-mak",
    title: "Tony Mak",
    url: "https://tonymak.co",
    categoryLabel: "인터랙티브 포트폴리오 / 크리에이티브 스튜디오",
    confidence: "부분확인",
    difficulty: "중",
    threeJsCore: false,
    concept:
      "'Creative at the Speed of Next' / Art Direction & Systems. 브랜드·AI·시스템 사고를 타이포 중심 미니멀 UI로 전달하는 크리에이티브 포트폴리오.",
    signature:
      "Loading-to-intro, page transition, custom cursor를 포함한 속도감 있는 타이포·UI 전환.",
    techniques: [
      "페이지 전환·로딩 인트로 모션",
      "타이포그래피·시스템 UI 모션",
      "커서 인터랙션",
      "GSAP 타임라인",
    ],
    auditSources: ["Live: https://tonymak.co", "Awwwards Nominee — tony-mak-art-direction-systems"],
  },
  {
    num: 4,
    fileSlug: "Lesse-Studio",
    slug: "lesse-studio",
    title: "Lesse Studio",
    url: "https://lessestudio.com",
    categoryLabel: "인터랙티브 포트폴리오 / 크리에이티브 스튜디오",
    confidence: "부분확인",
    difficulty: "중",
    threeJsCore: false,
    concept:
      "Design & Technology 스튜디오. SvelteKit 기반으로 clarity·performance·intentionality 우선. refined typography, intentional layout, subtle motion으로 craft를 드러낸다.",
    signature:
      "절제된 타이포·그리드 레이아웃과 subtle scroll/hover motion으로 immersive yet functional 경험.",
    techniques: [
      "SvelteKit 커스텀 애니메이션(외부 애니메이션 라이브러리 없음)",
      "타이포그래피·그리드 레이아웃 모션",
      "미세 hover/scroll transition",
      "성능 최적화(WebP pipeline, Cloudflare R2)",
    ],
    auditSources: [
      "Live: https://lessestudio.com",
      "Codrops — The Making of the New Lesse Studio Website (2026)",
    ],
  },
  {
    num: 5,
    fileSlug: "Kvs-Studio",
    slug: "kvs-studio",
    title: "KVS Studio",
    url: "https://kvs.services",
    categoryLabel: "인터랙티브 포트폴리오 / 크리에이티브 스튜디오",
    confidence: "부분확인",
    difficulty: "중",
    threeJsCore: false,
    concept:
      "Product Design & Creative Development. 인터랙티브 타이포·게이미피케이션 UI로 premium design partner 포지셔닝.",
    signature:
      "'CLICK TO BREAK' 등 인터랙티브 UI가 타이포·좌표 HUD와 함께 깨지며 쇼케이스를 전개.",
    techniques: [
      "인터랙티브 타이포/글리치 UI",
      "CLICK TO BREAK 등 마이크로 게임화",
      "커서/터치 인터랙션",
      "DOM/GSAP 커스텀 모션",
    ],
    auditSources: ["Live: https://kvs.services"],
  },
  {
    num: 6,
    fileSlug: "Synapser-Studio",
    slug: "synapser-studio",
    title: "Synapser Studio",
    url: "https://synapserstudio.com",
    categoryLabel: "인터랙티브 포트폴리오 / 크리에이티브 스튜디오",
    confidence: "확인됨",
    difficulty: "상",
    threeJsCore: true,
    concept:
      "Lisbon digital atelier. scroll-driven 3D world — 섹션마다 독립 씬, camera drift, manifesto·archive가 하나의 cinematic journey로 연결.",
    signature:
      "스크롤 진행에 따라 3D 환경의 카메라·오브젝트·타이포가 장면 단위로 전환되는 scroll-driven storytelling.",
    techniques: [
      "Three.js + Blender 파이프라인",
      "GSAP ScrollTrigger + Observer",
      "scroll-driven camera/scene 전환",
      "WebGL hero mouse interaction",
    ],
    auditSources: [
      "Live: https://synapserstudio.com",
      "Awwwards HM — synapser-studio",
      "Codrops — scroll-driven 3D world (2026)",
    ],
  },
  {
    num: 10,
    fileSlug: "Digitalists",
    slug: "digitalists",
    title: "digitalists",
    url: "https://digitalists.at",
    categoryLabel: "인터랙티브 포트폴리오 / 크리에이티브 스튜디오",
    confidence: "부분확인",
    difficulty: "하",
    threeJsCore: false,
    concept:
      "오스트리아 WordPress/Webflow 에이전시. 실무적 웹디자인·브랜딩·캠페인, Awwwards HM portfolio.",
    signature:
      "서비스·프로젝트 카드 hover와 scroll reveal 중심의 실무적 모션(Three.js 핵심 아님).",
    techniques: [
      "WordPress/WooCommerce",
      "CSS/GSAP 라이트 모션",
      "호버 카드 transition",
      "scroll reveal 섹션 전환",
    ],
    auditSources: ["Live: https://digitalists.at", "Awwwards HM — digitalists"],
  },
  {
    num: 31,
    fileSlug: "South-Cliff-Dental",
    slug: "south-cliff-dental",
    title: "South Cliff Dental",
    url: "https://southcliffdentalgroup.com",
    categoryLabel: "데이터 시각화 / 특수",
    confidence: "확인(노미니)",
    difficulty: "하",
    threeJsCore: true,
    concept:
      "UK 치과 그룹. immersive fully 3D interactive website — practice locations, services, 3D modelling을 WebGL/Three.js로 탐색.",
    signature:
      "3D scroll animation과 3D interactive navigation으로 dental practices·locations를 immersive하게 탐색.",
    techniques: [
      "3D scroll animation",
      "3D interactive navigation",
      "practice location 3D model",
      "WebGL/Three.js + Next.js",
    ],
    auditSources: [
      "Live: https://southcliffdentalgroup.com",
      "Awwwards Nominee — south-cliff-dental-group",
    ],
  },
];
