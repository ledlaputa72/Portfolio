import type { Localized } from "@/i18n/config";

export type LabCategory =
  | "interactive-portfolio"
  | "brand-experience"
  | "b2b-tech"
  | "data-viz";

export type LabConfidence =
  | "confirmed"
  | "partial"
  | "estimated"
  | "nominee"
  | "concept";

export type LabDifficulty = "high" | "mid" | "low";

export type LabSite = {
  slug: string;
  title: string;
  url: string;
  category: LabCategory;
  confidence: LabConfidence;
  /** 1-2 sentence concept / message. */
  concept: Localized;
  /** Three.js / R3F / GSAP technique tags. */
  techniques: Localized[];
  /** The one signature interaction, 1 sentence. */
  signature: Localized;
  difficulty: LabDifficulty;
};

export const CATEGORY_LABELS: Record<LabCategory, Localized> = {
  "interactive-portfolio": {
    en: "Interactive portfolio / Creative studio",
    ko: "인터랙티브 포트폴리오 / 크리에이티브 스튜디오",
  },
  "brand-experience": {
    en: "Brand / Product interactive experience",
    ko: "브랜드 / 제품 인터랙티브 경험",
  },
  "b2b-tech": {
    en: "B2B / Tech / Infrastructure",
    ko: "B2B / 기술 / 인프라",
  },
  "data-viz": {
    en: "Data visualization / Special",
    ko: "데이터 시각화 / 특수",
  },
};

export const CONFIDENCE_LABELS: Record<LabConfidence, Localized> = {
  confirmed: { en: "Confirmed", ko: "확인됨" },
  partial: { en: "Partially confirmed", ko: "부분확인" },
  estimated: { en: "Estimated", ko: "추정" },
  nominee: { en: "Confirmed (Awwwards nominee)", ko: "확인(노미니)" },
  concept: { en: "Confirmed (concept)", ko: "확인(컨셉)" },
};

export const DIFFICULTY_LABELS: Record<LabDifficulty, Localized> = {
  high: { en: "High", ko: "상" },
  mid: { en: "Medium", ko: "중" },
  low: { en: "Low", ko: "하" },
};

export const labSites: LabSite[] = [
  // A. interactive-portfolio
  {
    slug: "hiroto-sato",
    title: "Hiroto Sato",
    url: "https://hirotos.com",
    category: "interactive-portfolio",
    confidence: "confirmed",
    concept: {
      en: "A single 3D hero built around a slender white central pillar, with a mirror/arcade showreel screen, tag-style signs, and arrow signposts floating around it. Navigation is shaped like a cluster of road signs.",
      ko: "중앙의 가느다란 흰색 기둥을 중심으로 거울/아케이드 쇼릴 화면, 태그형 사인, 화살표형 표지판이 떠다니는 단일 3D 히어로 구성. 도로 표지판 클러스터처럼 내비게이션을 형상화한다.",
    },
    techniques: [
      {
        en: "Floating 3D object cluster (idle drift animation)",
        ko: "떠다니는 3D 오브젝트 클러스터(부유 애니메이션)",
      },
      { en: "Mouse drag / parallax rotation", ko: "마우스 드래그/패럴럭스 회전" },
      {
        en: "Reflective (mirror) material + render target for a screen-in-screen showreel",
        ko: "반사 머티리얼(미러) + 렌더 타깃으로 화면 속 화면(showreel) 표현",
      },
      { en: "Signpost-style navigation objects", ko: "표지판형 내비게이션 오브젝트" },
    ],
    signature: {
      en: "A circular mirror reflects an arcade-style showreel while 'HIROTO SATO' tag signs and a 'PROJECTS ARCHIVE' arrow signpost drift around it in parallax with the mouse.",
      ko: "원형 미러가 아케이드풍 쇼릴 화면을 반사하고, 그 주변을 'HIROTO SATO' 태그 사인과 'PROJECTS ARCHIVE' 화살표 표지판이 마우스 움직임에 따라 패럴럭스로 부유.",
    },
    difficulty: "mid",
  },
  {
    slug: "danzan",
    title: "DANZAN",
    url: "https://danzan.jiejoe.com",
    category: "interactive-portfolio",
    confidence: "concept",
    concept: {
      en: "A slash-to-reveal: swiping along a dotted line splits the shell open to expose the layer beneath. It translates a samurai / violence aesthetic into motion.",
      ko: "점선을 스와이프하면 껍질이 갈라지며 내부 레이어가 드러나는 slash-to-reveal. 사무라이/폭력의 미학을 모션으로 번역한다.",
    },
    techniques: [
      { en: "Mouse/touch drag-driven shader mask", ko: "마우스/터치 드래그 기반 셰이더 마스크" },
      { en: "Cut-surface texture morphing", ko: "절단면 텍스처 모핑" },
      { en: "Layer separation animation", ko: "레이어 분리 애니메이션" },
      { en: "Custom GLSL shader", ko: "커스텀 GLSL 셰이더" },
    ],
    signature: {
      en: "Swiping along the dotted line cuts the surface open as if slashed, exposing the inner layer.",
      ko: "점선을 따라 스와이프하면 표면이 갈라지듯 절단되며 내부 레이어가 노출.",
    },
    difficulty: "high",
  },
  {
    slug: "tony-mak",
    title: "Tony Mak",
    url: "https://tonymak.co",
    category: "interactive-portfolio",
    confidence: "partial",
    concept: {
      en: "'Creative at the Speed of Next' / Art Direction & Systems. A creative portfolio that conveys brand, AI, and systems thinking through a typography-led minimal UI.",
      ko: "'Creative at the Speed of Next' / Art Direction & Systems. 브랜드·AI·시스템 사고를 타이포 중심 미니멀 UI로 전달하는 크리에이티브 포트폴리오.",
    },
    techniques: [
      { en: "Page transition & loading intro motion", ko: "페이지 전환·로딩 인트로 모션" },
      { en: "Typography & system-UI motion", ko: "타이포그래피·시스템 UI 모션" },
      { en: "Custom cursor interaction", ko: "커서 인터랙션" },
      { en: "GSAP timeline", ko: "GSAP 타임라인" },
    ],
    signature: {
      en: "Fast-paced typography and UI transitions spanning loading-to-intro, page transitions, and a custom cursor.",
      ko: "Loading-to-intro, page transition, custom cursor를 포함한 속도감 있는 타이포·UI 전환.",
    },
    difficulty: "mid",
  },
  {
    slug: "lesse-studio",
    title: "Lesse Studio",
    url: "https://lessestudio.com",
    category: "interactive-portfolio",
    confidence: "partial",
    concept: {
      en: "A Design & Technology studio. Built on SvelteKit with clarity, performance, and intentionality first — craft shown through refined typography, deliberate layout, and subtle motion.",
      ko: "Design & Technology 스튜디오. SvelteKit 기반으로 clarity·performance·intentionality 우선. refined typography, intentional layout, subtle motion으로 craft를 드러낸다.",
    },
    techniques: [
      {
        en: "SvelteKit custom animation (no external animation library)",
        ko: "SvelteKit 커스텀 애니메이션(외부 애니메이션 라이브러리 없음)",
      },
      { en: "Typography & grid-layout motion", ko: "타이포그래피·그리드 레이아웃 모션" },
      { en: "Subtle hover / scroll transitions", ko: "미세 hover/scroll transition" },
      {
        en: "Performance optimization (WebP pipeline, Cloudflare R2)",
        ko: "성능 최적화(WebP pipeline, Cloudflare R2)",
      },
    ],
    signature: {
      en: "Restrained typography and grid layout with subtle scroll/hover motion for an immersive yet functional experience.",
      ko: "절제된 타이포·그리드 레이아웃과 subtle scroll/hover motion으로 immersive yet functional 경험.",
    },
    difficulty: "mid",
  },
  {
    slug: "kvs-studio",
    title: "KVS Studio",
    url: "https://kvs.services",
    category: "interactive-portfolio",
    confidence: "partial",
    concept: {
      en: "Product Design & Creative Development. Positions itself as a premium design partner through interactive typography and gamified UI.",
      ko: "Product Design & Creative Development. 인터랙티브 타이포·게이미피케이션 UI로 premium design partner 포지셔닝.",
    },
    techniques: [
      { en: "Interactive typography / glitch UI", ko: "인터랙티브 타이포/글리치 UI" },
      { en: "Micro-gamification such as CLICK TO BREAK", ko: "CLICK TO BREAK 등 마이크로 게임화" },
      { en: "Cursor / touch interaction", ko: "커서/터치 인터랙션" },
      { en: "DOM/GSAP custom motion", ko: "DOM/GSAP 커스텀 모션" },
    ],
    signature: {
      en: "Interactive UI like 'CLICK TO BREAK' shatters alongside a typography and coordinate HUD to unfold the showcase.",
      ko: "'CLICK TO BREAK' 등 인터랙티브 UI가 타이포·좌표 HUD와 함께 깨지며 쇼케이스를 전개.",
    },
    difficulty: "mid",
  },
  {
    slug: "synapser-studio",
    title: "Synapser Studio",
    url: "https://synapserstudio.com",
    category: "interactive-portfolio",
    confidence: "confirmed",
    concept: {
      en: "A Lisbon digital atelier. A scroll-driven 3D world — each section its own scene, with camera drift linking manifesto and archive into one cinematic journey.",
      ko: "Lisbon digital atelier. scroll-driven 3D world — 섹션마다 독립 씬, camera drift, manifesto·archive가 하나의 cinematic journey로 연결.",
    },
    techniques: [
      { en: "Three.js + Blender pipeline", ko: "Three.js + Blender 파이프라인" },
      { en: "GSAP ScrollTrigger + Observer", ko: "GSAP ScrollTrigger + Observer" },
      { en: "Scroll-driven camera / scene transitions", ko: "scroll-driven camera/scene 전환" },
      { en: "WebGL hero mouse interaction", ko: "WebGL hero mouse interaction" },
    ],
    signature: {
      en: "Scroll-driven storytelling where the camera, objects, and typography of the 3D environment transition scene by scene.",
      ko: "스크롤 진행에 따라 3D 환경의 카메라·오브젝트·타이포가 장면 단위로 전환되는 scroll-driven storytelling.",
    },
    difficulty: "high",
  },
  {
    slug: "produx",
    title: "PRODUX",
    url: "https://produx.design",
    category: "interactive-portfolio",
    confidence: "estimated",
    concept: {
      en: "A design studio with the slogan 'Design that Speaks.' Motion centered on typography and message delivery.",
      ko: "'Design that Speaks'를 슬로건으로 하는 디자인 스튜디오. 타이포와 메시지 전달력 중심의 모션.",
    },
    techniques: [
      { en: "Typography scroll reveal", ko: "타이포그래피 스크롤 reveal" },
      { en: "Text split / reassemble animation", ko: "텍스트 분해/재조합 애니메이션" },
      { en: "GSAP SplitText", ko: "GSAP SplitText" },
      { en: "Scroll-triggered section transitions", ko: "스크롤 트리거 섹션 전환" },
    ],
    signature: {
      en: "Headline text splits and reassembles word by word as you scroll.",
      ko: "헤드라인 텍스트가 스크롤에 맞춰 단어 단위로 분해/재조합.",
    },
    difficulty: "mid",
  },
  {
    slug: "iris-k",
    title: "Iris K",
    url: "https://theirisk.com",
    category: "interactive-portfolio",
    confidence: "estimated",
    concept: {
      en: "Personal portfolio of a composer/violinist. An emotive experience translating musical rhythm into visual motion.",
      ko: "작곡가/바이올리니스트 개인 포트폴리오. 음악적 리듬감을 비주얼 모션으로 변환한 감성적 경험.",
    },
    techniques: [
      { en: "Audio-reactive visuals", ko: "오디오 반응형 비주얼" },
      { en: "Waveform / frequency visualization", ko: "파형/주파수 시각화" },
      { en: "Scroll-linked scene transitions", ko: "스크롤 연동 씬 전환" },
      { en: "Soft particle background", ko: "소프트 파티클 배경" },
    ],
    signature: {
      en: "The waveform of the playing music is reflected in the background visuals in real time.",
      ko: "재생 중인 음악의 파형이 배경 비주얼에 실시간으로 반영.",
    },
    difficulty: "mid",
  },
  {
    slug: "glitch-and-grit",
    title: "Glitch&Grit",
    url: "https://glitchandgrit.com",
    category: "interactive-portfolio",
    confidence: "nominee",
    concept: {
      en: "A creative studio combining glitch aesthetics with raw grit texture. Motion quality validated by an Awwwards nomination.",
      ko: "글리치 미학과 거친 질감(grit)을 결합한 크리에이티브 스튜디오. Awwwards 노미니로 검증된 모션 품질.",
    },
    techniques: [
      { en: "Glitch shader effects", ko: "글리치 셰이더 효과" },
      { en: "RGB shift / noise", ko: "RGB 시프트/노이즈" },
      { en: "Scroll-triggered glitch transitions", ko: "스크롤 트리거 글리치 트랜지션" },
      { en: "WebGL post-processing", ko: "WebGL 포스트프로세싱" },
    ],
    signature: {
      en: "A brief glitch-noise burst sweeps the full screen on each section change.",
      ko: "섹션 전환 시 화면 전체에 짧은 글리치 노이즈 버스트가 발생.",
    },
    difficulty: "high",
  },
  {
    slug: "digitalists",
    title: "digitalists",
    url: "https://digitalists.at",
    category: "interactive-portfolio",
    confidence: "partial",
    concept: {
      en: "An Austrian WordPress/Webflow agency. Practical web design, branding, and campaigns — an Awwwards Honorable Mention portfolio.",
      ko: "오스트리아 WordPress/Webflow 에이전시. 실무적 웹디자인·브랜딩·캠페인, Awwwards HM portfolio.",
    },
    techniques: [
      { en: "WordPress/WooCommerce", ko: "WordPress/WooCommerce" },
      { en: "Light CSS/GSAP motion", ko: "CSS/GSAP 라이트 모션" },
      { en: "Hover card transitions", ko: "호버 카드 transition" },
      { en: "Scroll-reveal section transitions", ko: "scroll reveal 섹션 전환" },
    ],
    signature: {
      en: "Practical motion centered on service/project card hovers and scroll reveals (Three.js not central).",
      ko: "서비스·프로젝트 카드 hover와 scroll reveal 중심의 실무적 모션(Three.js 핵심 아님).",
    },
    difficulty: "low",
  },

  // B. brand-experience
  {
    slug: "razorpay-sprint-26",
    title: "Razorpay Sprint 26",
    url: "https://razorpay.com/sprint/26",
    category: "brand-experience",
    confidence: "confirmed",
    concept: {
      en: "A B2B payments campaign. A WebGL + Three.js + Webflow build that uses only a two-color palette (#0039FF/#151515) yet creates a rich experience with 100+ scroll/click triggers. A massive object advances along a track as you scroll, unfolding the shopper's payment journey as narrative. Awwwards SOTD.",
      ko: "B2B 결제 캠페인. WebGL+Three.js+Webflow 조합으로 단 2색(#0039FF/#151515) 팔레트만 사용하면서도 100개 이상의 스크롤/클릭 트리거로 풍부한 경험을 만든다. 스크롤에 따라 거대한 오브제가 트랙을 따라 전진하며 쇼퍼의 결제 여정을 내러티브로 펼친다. Awwwards SOTD.",
    },
    techniques: [
      { en: "Two-color-palette WebGL scene", ko: "2색 팔레트 기반 WebGL 씬" },
      {
        en: "Orchestration of 100+ scroll/click triggers",
        ko: "100+ 스크롤/클릭 트리거 오케스트레이션",
      },
      {
        en: "Scroll-linked object advance (track-based progression narrative)",
        ko: "스크롤 연동 오브제 전진(트랙형 진행 내러티브)",
      },
      { en: "Webflow + Three.js hybrid", ko: "Webflow + Three.js 하이브리드" },
      { en: "GSAP ScrollTrigger timeline chaining", ko: "GSAP ScrollTrigger 타임라인 체이닝" },
    ],
    signature: {
      en: "As you scroll, 100+ triggers fire in sequence around a giant object (a shoe) advancing forward, unfolding like the shopper's journey.",
      ko: "스크롤에 따라 거대한 오브제(신발)를 중심으로 100+ 트리거가 순차적으로 전진하며 쇼퍼의 여정처럼 펼쳐짐.",
    },
    difficulty: "high",
  },
  {
    slug: "izanami",
    title: "Izanami",
    url: "https://izanami-official.com",
    category: "brand-experience",
    confidence: "confirmed",
    concept: {
      en: "A Japanese lifestyle brand. Stages the 'spirit of harmony (和)' through a restrained Japanese-aesthetic WebGL mood.",
      ko: "일본 라이프스타일 브랜드. '조화(和)의 정신'을 절제된 일본 미학의 WebGL 분위기로 연출한다.",
    },
    techniques: [
      { en: "Restrained color-grading shader", ko: "절제된 컬러 그레이딩 셰이더" },
      { en: "Slow camera parallax", ko: "느린 카메라 패럴럭스" },
      { en: "Fog / depth post-processing", ko: "안개/깊이감 포스트프로세싱" },
      { en: "Minimal scroll fade transitions", ko: "미니멀 스크롤 페이드 전환" },
    ],
    signature: {
      en: "As you scroll, the next product emerges as though fog is slowly lifting.",
      ko: "스크롤에 따라 안개가 서서히 걷히듯 다음 제품이 드러남.",
    },
    difficulty: "mid",
  },
  {
    slug: "cartier-watches-and-wonders",
    title: "Cartier Watches & Wonders",
    url: "https://www.cartier.com/en-fr/watchesandwonders",
    category: "brand-experience",
    confidence: "estimated",
    concept: {
      en: "A luxury watch brand campaign. Emphasizes the precision of watch components through 3D close-ups and lighting.",
      ko: "럭셔리 워치 브랜드 캠페인. 시계 부품의 정밀함을 3D 클로즈업과 라이팅으로 강조한다.",
    },
    techniques: [
      { en: "3D watch-model close-up rendering", ko: "3D 시계 모델 클로즈업 렌더링" },
      { en: "Studio lighting simulation", ko: "스튜디오 라이팅 시뮬레이션" },
      { en: "Scroll-linked camera dolly-in", ko: "스크롤 연동 카메라 도리 인" },
      { en: "Metal / glass PBR materials", ko: "메탈/유리 PBR 머티리얼" },
    ],
    signature: {
      en: "As you scroll, the alcove 3D space rotates, and the central watch model swaps out as each universe transitions.",
      ko: "스크롤에 따라 alcove 3D 공간이 회전하고, universe 전환 시 중앙 시계 모델이 함께 교체된다.",
    },
    difficulty: "high",
  },
  {
    slug: "pp-neue-montreal",
    title: "PP Neue Montreal",
    url: "https://neuemontreal.com",
    category: "brand-experience",
    confidence: "estimated",
    concept: {
      en: "A Pangram Pangram typeface showcase. A letterform experiment where typography itself is the protagonist.",
      ko: "Pangram Pangram 서체 쇼케이스. 타이포그래피 자체가 주인공인 글자 형태 실험.",
    },
    techniques: [
      { en: "Variable-font interaction", ko: "베리어블 폰트 인터랙션" },
      { en: "Letterform morphing shader", ko: "글자 형태 모핑 셰이더" },
      { en: "Mouse-tracked font-weight variation", ko: "마우스 추적 폰트 weight 변화" },
      { en: "WebGL text rendering", ko: "WebGL 텍스트 렌더링" },
    ],
    signature: {
      en: "Text weight and width interpolate in real time based on mouse position.",
      ko: "마우스 위치에 따라 텍스트의 굵기/너비가 실시간으로 보간.",
    },
    difficulty: "mid",
  },
  {
    slug: "kfc-loyalty",
    title: "KFC Loyalty",
    url: "https://kfc.it/loyalty",
    category: "brand-experience",
    confidence: "estimated",
    concept: {
      en: "A brand loyalty campaign. Visualizes the reward system like a game in a friendly, playful tone.",
      ko: "브랜드 로열티 캠페인. 친근하고 유쾌한 톤으로 리워드 시스템을 게임처럼 시각화.",
    },
    techniques: [
      { en: "Gamification UI motion", ko: "게이미피케이션 UI 모션" },
      { en: "Icon / badge bounce animation", ko: "아이콘/뱃지 바운스 애니메이션" },
      { en: "Scroll-triggered counter", ko: "스크롤 트리거 카운터" },
      { en: "GSAP elastic easing", ko: "GSAP 일레스틱 이징" },
    ],
    signature: {
      en: "Point accumulation is visualized with a counter and bounce animation.",
      ko: "포인트가 쌓이는 과정을 카운터와 바운스 애니메이션으로 시각화.",
    },
    difficulty: "low",
  },
  {
    slug: "hydroflow",
    title: "Hydroflow",
    url: "https://hydroflowdrink.com",
    category: "brand-experience",
    confidence: "estimated",
    concept: {
      en: "A beverage brand site. A refreshing experience using the flow of water/liquid as a visual metaphor.",
      ko: "음료 브랜드 사이트. 물/액체의 흐름을 시각적 메타포로 사용한 청량한 경험.",
    },
    techniques: [
      { en: "Fluid simulation shader", ko: "유체 시뮬레이션 셰이더" },
      { en: "3D bottle model + liquid material", ko: "병 3D 모델 + 액체 머티리얼" },
      { en: "Scroll-linked liquid-fill animation", ko: "스크롤 연동 액체 채움 애니메이션" },
      { en: "Refraction / reflection post-processing", ko: "굴절/반사 포스트프로세싱" },
    ],
    signature: {
      en: "A shader animation where the liquid inside the bottle appears to fill up as you scroll.",
      ko: "스크롤에 맞춰 병 안의 액체가 차오르는 듯한 셰이더 애니메이션.",
    },
    difficulty: "mid",
  },
  {
    slug: "la-revoltosa",
    title: "La Revoltosa",
    url: "https://larevoltosa.es",
    category: "brand-experience",
    confidence: "estimated",
    concept: {
      en: "An Iberian beverage brand. Dynamic visuals carrying vivid color and Latin sentiment.",
      ko: "이베리아 음료 브랜드. 강렬한 색감과 라틴 정서를 담은 다이내믹한 비주얼.",
    },
    techniques: [
      { en: "Vivid color-gradient shader", ko: "비비드 컬러 그라디언트 셰이더" },
      { en: "Rhythmic scroll transitions", ko: "리듬감 있는 스크롤 트랜지션" },
      { en: "Image-sequence animation", ko: "이미지 시퀀스 애니메이션" },
      { en: "GSAP timeline", ko: "GSAP 타임라인" },
    ],
    signature: {
      en: "Each scroll rapidly switches the background through vivid color gradients.",
      ko: "스크롤마다 강렬한 컬러 그라디언트가 배경을 빠르게 전환.",
    },
    difficulty: "mid",
  },
  {
    slug: "northgarden",
    title: "NorthGarden",
    url: "https://northgarden.com",
    category: "brand-experience",
    confidence: "estimated",
    concept: {
      en: "A brand site. A calm, organic visual experience with a nature/garden motif.",
      ko: "브랜드 사이트. 자연/정원을 모티프로 한 차분하고 유기적인 비주얼 경험.",
    },
    techniques: [
      { en: "Organic particle field (petals / leaves)", ko: "유기적 파티클 필드(꽃잎/잎사귀)" },
      { en: "Wind simulation shader", ko: "바람 시뮬레이션 셰이더" },
      { en: "Scroll parallax layers", ko: "스크롤 패럴럭스 레이어" },
      { en: "Soft lighting", ko: "소프트 라이팅" },
    ],
    signature: {
      en: "Background particles drift softly as if swaying in the wind.",
      ko: "배경의 파티클이 바람에 흔들리듯 부드럽게 떠다님.",
    },
    difficulty: "mid",
  },
  {
    slug: "loft-thirty-one",
    title: "LOFT THIRTY ONE",
    url: "https://loftthirtyone.com",
    category: "brand-experience",
    confidence: "estimated",
    concept: {
      en: "A brand/space site. Expresses the dimensionality of a loft space like a 3D walkthrough.",
      ko: "브랜드/공간 사이트. 로프트 공간의 입체감을 3D 워크스루처럼 표현.",
    },
    techniques: [
      { en: "3D space walkthrough camera", ko: "3D 공간 워크스루 카메라" },
      { en: "Scroll-linked room transitions", ko: "스크롤 연동 룸 전환" },
      { en: "Lighting-transition animation", ko: "조명 전환 애니메이션" },
      { en: "Spatial depth blur", ko: "공간감 있는 깊이 블러" },
    ],
    signature: {
      en: "A walkthrough where the camera moves across the space as you scroll.",
      ko: "스크롤에 따라 카메라가 공간을 가로질러 이동하는 워크스루.",
    },
    difficulty: "high",
  },
  {
    slug: "cryptowl",
    title: "CryptOwl",
    url: "https://cryptowl.io",
    category: "brand-experience",
    confidence: "estimated",
    concept: {
      en: "A crypto brand espousing 'Crypto Strategy Through Time.' Uses time/timeline as its core metaphor.",
      ko: "'Crypto Strategy Through Time'을 표방하는 크립토 브랜드. 시간/타임라인을 핵심 메타포로 사용.",
    },
    techniques: [
      { en: "3D timeline visualization", ko: "3D 타임라인 시각화" },
      { en: "Scroll-linked movement along the time axis", ko: "스크롤 연동 시간축 이동" },
      { en: "Glow / neon shader", ko: "글로우/네온 셰이더" },
      { en: "Data-point marker animation", ko: "데이터 포인트 마커 애니메이션" },
    ],
    signature: {
      en: "The camera moves chronologically along a 3D timeline as you scroll.",
      ko: "스크롤에 따라 3D 타임라인을 따라 카메라가 시간순으로 이동.",
    },
    difficulty: "high",
  },

  // C. b2b-tech
  {
    slug: "cipher-digital",
    title: "Cipher Digital",
    url: "https://cipherdigital.com",
    category: "b2b-tech",
    confidence: "confirmed",
    concept: {
      en: "An AI data-center infrastructure company (partners: Google/AWS/Fluidstack). Keeps a premium, precise, trustworthy tone through restrained motion rather than heavy 3D.",
      ko: "AI 데이터센터 인프라 기업(파트너 Google/AWS/Fluidstack). 헤비 3D보다 절제된 모션으로 프리미엄/정밀/신뢰 톤을 유지한다.",
    },
    techniques: [
      { en: "Restrained wireframe / grid visuals", ko: "절제된 와이어프레임/그리드 비주얼" },
      { en: "Minimal scroll fade", ko: "미니멀 스크롤 페이드" },
      { en: "Abstracted data-center 3D objects", ko: "데이터센터 추상화 3D 오브젝트" },
      { en: "Light glow accents", ko: "라이트 글로우 액센트" },
    ],
    signature: {
      en: "Abstracted server-rack forms align precisely as you scroll.",
      ko: "추상화된 서버랙 형상이 스크롤에 맞춰 정교하게 정렬되는 모션.",
    },
    difficulty: "mid",
  },
  {
    slug: "armory",
    title: "Armory",
    url: "https://armory.in",
    category: "b2b-tech",
    confidence: "estimated",
    concept: {
      en: "A C-UAS (counter-drone) defense company. A precise, heavy tone conveying security and defense.",
      ko: "C-UAS(대드론) 방산 기업. 보안/방어 이미지를 전달하는 정밀하고 무거운 톤.",
    },
    techniques: [
      { en: "Loading radar animation", ko: "로딩 레이더 애니메이션" },
      { en: "Scroll-linked camera dolly (far → near)", ko: "스크롤 연동 카메라 돌리(원경→근경)" },
      { en: "Wireframe drone 3D model", ko: "와이어프레임 드론 3D 모델" },
      { en: "Sequential content-card reveal", ko: "콘텐츠 카드 순차 reveal" },
    ],
    signature: {
      en: "After a loading radar sweep, the camera dollies from a distant view in to the drone as you scroll, and capability cards appear.",
      ko: "로딩 레이더 후 스크롤에 따라 원경에서 드론 근접으로 카메라가 이동하고 capability 카드가 등장.",
    },
    difficulty: "high",
  },
  {
    slug: "hashgraph-ventures",
    title: "Hashgraph Ventures",
    url: "https://hashgraphvc.com",
    category: "b2b-tech",
    confidence: "estimated",
    concept: {
      en: "An AI & blockchain VC. Visualizes the flow of networks and capital as an abstract graph.",
      ko: "AI & 블록체인 VC. 네트워크와 자본의 흐름을 추상적 그래프로 시각화.",
    },
    techniques: [
      { en: "Diagonal section transition (diagonal wipe)", ko: "대각선 섹션 전환 (diagonal wipe)" },
      { en: "Hexagon 3D core hover fracture", ko: "헥사곤 3D 코어 hover 분열" },
      { en: "Particle / node-graph hover dispersion", ko: "파티클·노드 그래프 hover 분산" },
      { en: "Scroll-linked network expansion", ko: "스크롤 연동 네트워크 확장" },
    ],
    signature: {
      en: "As you scroll, the network expands, and diagonal transitions and hover fractures carry the VC chapters forward in an immersive 3D experience.",
      ko: "스크롤 시 네트워크가 확장되고, 대각선 전환·hover 분열로 VC 챕터가 이어지는 몰입형 3D 경험.",
    },
    difficulty: "mid",
  },
  {
    slug: "rsquad",
    title: "RSquad",
    url: "https://rsquad.io",
    category: "b2b-tech",
    confidence: "estimated",
    concept: {
      en: "A Blockchain Lab. Expresses the image of a tech laboratory through abstract geometric structures.",
      ko: "Blockchain Lab. 기술 실험실의 이미지를 추상적인 기하 구조로 표현.",
    },
    techniques: [
      { en: "Geometric 3D object rotation", ko: "기하학적 3D 오브젝트 회전" },
      { en: "Wireframe morphing", ko: "와이어프레임 모핑" },
      { en: "Scroll-linked structural deformation", ko: "스크롤 연동 구조 변형" },
      { en: "Neon accent color", ko: "네온 액센트 컬러" },
    ],
    signature: {
      en: "Geometric objects morph into different shapes as you scroll.",
      ko: "스크롤에 맞춰 기하학적 오브젝트가 다른 형태로 모핑.",
    },
    difficulty: "mid",
  },
  {
    slug: "air-business-center",
    title: "AIR business center",
    url: "https://aircenter.space",
    category: "b2b-tech",
    confidence: "estimated",
    concept: {
      en: "A business center / space. A clean site emphasizing architectural spatiality.",
      ko: "비즈니스 센터/공간. 건축적 공간감을 강조하는 클린한 사이트.",
    },
    techniques: [
      { en: "Architectural-model 3D viewer", ko: "건축 모델 3D 뷰어" },
      { en: "Scroll-linked floor-by-floor transitions", ko: "스크롤 연동 층별 전환" },
      { en: "Spatial lighting simulation", ko: "공간 조명 시뮬레이션" },
      { en: "Minimal UI overlay", ko: "미니멀 UI 오버레이" },
    ],
    signature: {
      en: "A 3D transition that reveals each floor of the building in order as you scroll.",
      ko: "스크롤에 따라 건물의 각 층을 순서대로 보여주는 3D 전환.",
    },
    difficulty: "mid",
  },
  {
    slug: "reventador",
    title: "Reventador",
    url: "https://reventador.global",
    category: "b2b-tech",
    confidence: "estimated",
    concept: {
      en: "An industrial decarbonization solution. Conveys sustainability through abstract data visuals.",
      ko: "산업 탈탄소화 솔루션. 친환경/지속가능성을 추상 데이터 비주얼로 전달.",
    },
    techniques: [
      { en: "Carbon-emission reduction data visualization", ko: "탄소 배출 감소 데이터 시각화" },
      { en: "Organic curve animation", ko: "유기적 곡선 애니메이션" },
      { en: "Scroll-linked number count-up", ko: "스크롤 연동 수치 카운트업" },
      { en: "Green-tone gradient", ko: "그린 톤 그래디언트" },
    ],
    signature: {
      en: "The carbon-emission graph curve descends gradually as you scroll.",
      ko: "스크롤에 따라 탄소 배출 그래프 곡선이 점진적으로 하강.",
    },
    difficulty: "mid",
  },
  {
    slug: "podium",
    title: "Podium",
    url: "https://podium.global",
    category: "b2b-tech",
    confidence: "estimated",
    concept: {
      en: "A sports-video creative studio. Brings a dynamic video-editing sensibility to the web.",
      ko: "스포츠 영상 제작 크리에이티브 스튜디오. 다이내믹한 영상 편집 감성을 웹으로 옮긴다.",
    },
    techniques: [
      { en: "Video-sequence scrub animation", ko: "영상 시퀀스 스크럽 애니메이션" },
      { en: "Sports motion-blur effect", ko: "스포츠 모션 블러 효과" },
      { en: "Scroll-linked clip transitions", ko: "스크롤 연동 클립 전환" },
      { en: "Video-texture 3D panels", ko: "비디오 텍스처 3D 패널" },
    ],
    signature: {
      en: "Video clips scrub and play according to scroll position.",
      ko: "스크롤 위치에 따라 영상 클립이 스크럽되며 재생.",
    },
    difficulty: "mid",
  },
  {
    slug: "tower-architectural-doors",
    title: "Tower Architectural Doors",
    url: "https://towerdoors.com.au",
    category: "b2b-tech",
    confidence: "estimated",
    concept: {
      en: "An architectural door-system manufacturer. Clearly conveys product structure and how it operates.",
      ko: "건축 도어 시스템 제조사. 제품의 구조와 작동 방식을 명확히 전달.",
    },
    techniques: [
      { en: "Door-mechanism 3D animation", ko: "도어 작동 메커니즘 3D 애니메이션" },
      { en: "Exploded-view interaction", ko: "분해도(exploded view) 인터랙션" },
      { en: "Scroll-linked part separation", ko: "스크롤 연동 부품 분리" },
      { en: "Clean studio lighting", ko: "클린 스튜디오 라이팅" },
    ],
    signature: {
      en: "Door parts spread out like an exploded view as you scroll.",
      ko: "스크롤에 따라 도어 부품들이 분해도처럼 펼쳐짐.",
    },
    difficulty: "mid",
  },
  {
    slug: "fabrics-protection",
    title: "Fabrics Protection",
    url: "https://en.protection.gr",
    category: "b2b-tech",
    confidence: "estimated",
    concept: {
      en: "A fabric-protection product brand. Emphasizes fabric texture and protective effect through close-up visuals.",
      ko: "패브릭 보호 제품 브랜드. 직물의 질감과 보호 효과를 클로즈업 비주얼로 강조.",
    },
    techniques: [
      { en: "Fabric-texture close-up shader", ko: "직물 질감 클로즈업 셰이더" },
      { en: "Water- and stain-repellency simulation", ko: "방수/오염 방지 시뮬레이션" },
      { en: "Scroll-linked before/after transition", ko: "스크롤 연동 비포/애프터 전환" },
      { en: "Macro lighting", ko: "매크로 라이팅" },
    ],
    signature: {
      en: "As you scroll, liquid dropped on the fabric surface beads up and rolls off instead of soaking in.",
      ko: "스크롤에 따라 직물 표면에 떨어진 액체가 스며들지 않고 굴러떨어짐.",
    },
    difficulty: "mid",
  },

  // D. data-viz
  {
    slug: "world-cup-2026",
    title: "World Cup 2026",
    url: "https://sheets.works/data-viz/world-cup-2026",
    category: "data-viz",
    confidence: "estimated",
    concept: {
      en: "Team / stadium / match data visualization. Likely D3/Canvas-family techniques, making vast sports data intuitively explorable.",
      ko: "팀/경기장/경기 데이터 시각화. D3/Canvas 계열 기법으로 추정되며, 방대한 스포츠 데이터를 직관적으로 탐색 가능하게 만든다.",
    },
    techniques: [
      { en: "D3.js-based data binding", ko: "D3.js 기반 데이터 바인딩" },
      { en: "Canvas/SVG hybrid rendering", ko: "Canvas/SVG 하이브리드 렌더링" },
      { en: "Interactive filter / exploration UI", ko: "인터랙티브 필터/탐색 UI" },
      { en: "Geo-coordinate stadium map", ko: "지리 좌표 기반 경기장 맵" },
    ],
    signature: {
      en: "Clicking a team or stadium dynamically filters and reconfigures the related data.",
      ko: "팀이나 경기장을 클릭하면 관련 데이터가 동적으로 필터링되어 재구성.",
    },
    difficulty: "mid",
  },
  {
    slug: "south-cliff-dental",
    title: "South Cliff Dental",
    url: "https://southcliffdentalgroup.com",
    category: "data-viz",
    confidence: "nominee",
    concept: {
      en: "A UK dental group. An immersive, fully 3D interactive website — exploring practice locations, services, and 3D modelling with WebGL/Three.js.",
      ko: "UK 치과 그룹. immersive fully 3D interactive website — practice locations, services, 3D modelling을 WebGL/Three.js로 탐색.",
    },
    techniques: [
      { en: "3D scroll animation", ko: "3D scroll animation" },
      { en: "3D interactive navigation", ko: "3D interactive navigation" },
      { en: "Practice-location 3D model", ko: "practice location 3D model" },
      { en: "WebGL/Three.js + Next.js", ko: "WebGL/Three.js + Next.js" },
    ],
    signature: {
      en: "Immersively explore dental practices and locations through 3D scroll animation and 3D interactive navigation.",
      ko: "3D scroll animation과 3D interactive navigation으로 dental practices·locations를 immersive하게 탐색.",
    },
    difficulty: "low",
  },
  {
    slug: "climanova",
    title: "ClimaNova",
    url: "https://climanovaquebec.com",
    category: "data-viz",
    confidence: "nominee",
    concept: {
      en: "An energy / solar / battery brand. An Awwwards nominee that expresses energy flow as visual data.",
      ko: "에너지/태양광/배터리 브랜드. Awwwards 노미니로, 에너지 흐름을 시각적 데이터로 표현한다.",
    },
    techniques: [
      { en: "Energy-flow particle visualization", ko: "에너지 흐름 파티클 시각화" },
      { en: "Solar-panel 3D model", ko: "태양광 패널 3D 모델" },
      { en: "Scroll-linked number count-up", ko: "스크롤 연동 수치 카운트업" },
      { en: "Green / yellow-tone glow", ko: "그린/옐로 톤 글로우" },
    ],
    signature: {
      en: "A particle animation of energy flowing from solar to battery as you scroll.",
      ko: "스크롤에 따라 태양광에서 배터리로 이어지는 에너지 흐름 파티클 애니메이션.",
    },
    difficulty: "mid",
  },
];
