export type LabSite = {
  slug: string;
  title: string;
  url: string;
  category:
    | "interactive-portfolio"
    | "brand-experience"
    | "b2b-tech"
    | "data-viz";
  categoryLabel: string; // Korean label
  confidence: "확인됨" | "부분확인" | "추정" | "확인(노미니)" | "확인(컨셉)";
  concept: string; // 1-2 sentence concept/message in Korean
  techniques: string[]; // Three.js/R3F/GSAP technique tags, Korean ok
  signature: string; // the one signature interaction, Korean, 1 sentence
  difficulty: "상" | "중" | "하";
};

const INTERACTIVE_PORTFOLIO_LABEL =
  "인터랙티브 포트폴리오 / 크리에이티브 스튜디오";
const BRAND_EXPERIENCE_LABEL = "브랜드 / 제품 인터랙티브 경험";
const B2B_TECH_LABEL = "B2B / 기술 / 인프라";
const DATA_VIZ_LABEL = "데이터 시각화 / 특수";

export const labSites: LabSite[] = [
  // A. interactive-portfolio
  {
    slug: "hiroto-sato",
    title: "Hiroto Sato",
    url: "https://hirotos.com",
    category: "interactive-portfolio",
    categoryLabel: INTERACTIVE_PORTFOLIO_LABEL,
    confidence: "확인됨",
    concept:
      "중앙의 가느다란 흰색 기둥을 중심으로 거울/아케이드 쇼릴 화면, 태그형 사인, 화살표형 표지판이 떠다니는 단일 3D 히어로 구성. 도로 표지판 클러스터처럼 내비게이션을 형상화한다.",
    techniques: [
      "떠다니는 3D 오브젝트 클러스터(부유 애니메이션)",
      "마우스 드래그/패럴럭스 회전",
      "반사 머티리얼(미러) + 렌더 타깃으로 화면 속 화면(showreel) 표현",
      "표지판형 내비게이션 오브젝트",
    ],
    signature:
      "원형 미러가 아케이드풍 쇼릴 화면을 반사하고, 그 주변을 'HIROTO SATO' 태그 사인과 'PROJECTS ARCHIVE' 화살표 표지판이 마우스 움직임에 따라 패럴럭스로 부유.",
    difficulty: "중",
  },
  {
    slug: "danzan",
    title: "DANZAN",
    url: "https://danzan.jiejoe.com",
    category: "interactive-portfolio",
    categoryLabel: INTERACTIVE_PORTFOLIO_LABEL,
    confidence: "확인(컨셉)",
    concept:
      "점선을 스와이프하면 껍질이 갈라지며 내부 레이어가 드러나는 slash-to-reveal. 사무라이/폭력의 미학을 모션으로 번역한다.",
    techniques: [
      "마우스/터치 드래그 기반 셰이더 마스크",
      "절단면 텍스처 모핑",
      "레이어 분리 애니메이션",
      "커스텀 GLSL 셰이더",
    ],
    signature:
      "점선을 따라 스와이프하면 표면이 갈라지듯 절단되며 내부 레이어가 노출.",
    difficulty: "상",
  },
  {
    slug: "tony-mak",
    title: "Tony Mak",
    url: "https://tonymak.co",
    category: "interactive-portfolio",
    categoryLabel: INTERACTIVE_PORTFOLIO_LABEL,
    confidence: "추정",
    concept:
      "'Creative at the Speed of Next'를 표방하는 크리에이티브 개인 포트폴리오. 빠른 전환과 타이포 중심의 다이내믹한 인상.",
    techniques: [
      "페이지 전환 트랜지션",
      "타이포그래피 모션",
      "커서 인터랙션",
      "GSAP 타임라인",
    ],
    signature: "프로젝트 간 전환 시 속도감 있는 타이포/이미지 와이프 트랜지션.",
    difficulty: "중",
  },
  {
    slug: "lesse-studio",
    title: "Lesse Studio",
    url: "https://lessestudio.com",
    category: "interactive-portfolio",
    categoryLabel: INTERACTIVE_PORTFOLIO_LABEL,
    confidence: "추정",
    concept:
      "Design & Technology를 표방하는 스튜디오 사이트. 절제된 그리드와 미세한 3D 디테일로 기술력을 은근히 드러낸다.",
    techniques: [
      "그리드 기반 레이아웃 모션",
      "스크롤 패럴럭스",
      "라이트 3D 오브젝트 하이라이트",
      "호버 마이크로 인터랙션",
    ],
    signature: "프로젝트 카드 호버 시 3D 오브젝트가 미세하게 회전하며 반응.",
    difficulty: "중",
  },
  {
    slug: "kvs-studio",
    title: "KVS Studio",
    url: "https://kvs.services",
    category: "interactive-portfolio",
    categoryLabel: INTERACTIVE_PORTFOLIO_LABEL,
    confidence: "추정",
    concept:
      "Product Design & Creative Dev를 표방하는 스튜디오. 제품 데모처럼 인터랙티브한 쇼케이스 형식.",
    techniques: [
      "3D 제품 모델 인터랙션",
      "드래그 회전",
      "스크롤 연동 카메라 무브",
      "R3F 기반 씬",
    ],
    signature: "프로젝트 쇼케이스에서 3D 모델을 드래그로 자유롭게 회전 가능.",
    difficulty: "중",
  },
  {
    slug: "synapser-studio",
    title: "Synapser Studio",
    url: "https://synapserstudio.com",
    category: "interactive-portfolio",
    categoryLabel: INTERACTIVE_PORTFOLIO_LABEL,
    confidence: "추정",
    concept:
      "신경망/시냅스를 연상시키는 이름처럼, 연결과 흐름을 형상화한 비주얼의 크리에이티브 스튜디오.",
    techniques: [
      "파티클 네트워크/노드 연결 비주얼",
      "마우스 추적 인터랙션",
      "GLSL 노이즈 셰이더",
      "WebGL 배경 씬",
    ],
    signature: "마우스 움직임에 따라 파티클 노드 간 연결선이 실시간으로 재구성.",
    difficulty: "상",
  },
  {
    slug: "produx",
    title: "PRODUX",
    url: "https://produx.design",
    category: "interactive-portfolio",
    categoryLabel: INTERACTIVE_PORTFOLIO_LABEL,
    confidence: "추정",
    concept:
      "'Design that Speaks'를 슬로건으로 하는 디자인 스튜디오. 타이포와 메시지 전달력 중심의 모션.",
    techniques: [
      "타이포그래피 스크롤 reveal",
      "텍스트 분해/재조합 애니메이션",
      "GSAP SplitText",
      "스크롤 트리거 섹션 전환",
    ],
    signature: "헤드라인 텍스트가 스크롤에 맞춰 단어 단위로 분해/재조합.",
    difficulty: "중",
  },
  {
    slug: "iris-k",
    title: "Iris K",
    url: "https://theirisk.com",
    category: "interactive-portfolio",
    categoryLabel: INTERACTIVE_PORTFOLIO_LABEL,
    confidence: "추정",
    concept:
      "작곡가/바이올리니스트 개인 포트폴리오. 음악적 리듬감을 비주얼 모션으로 변환한 감성적 경험.",
    techniques: [
      "오디오 반응형 비주얼",
      "파형/주파수 시각화",
      "스크롤 연동 씬 전환",
      "소프트 파티클 배경",
    ],
    signature: "재생 중인 음악의 파형이 배경 비주얼에 실시간으로 반영.",
    difficulty: "중",
  },
  {
    slug: "glitch-and-grit",
    title: "Glitch&Grit",
    url: "https://glitchandgrit.com",
    category: "interactive-portfolio",
    categoryLabel: INTERACTIVE_PORTFOLIO_LABEL,
    confidence: "확인(노미니)",
    concept:
      "글리치 미학과 거친 질감(grit)을 결합한 크리에이티브 스튜디오. Awwwards 노미니로 검증된 모션 품질.",
    techniques: [
      "글리치 셰이더 효과",
      "RGB 시프트/노이즈",
      "스크롤 트리거 글리치 트랜지션",
      "WebGL 포스트프로세싱",
    ],
    signature: "섹션 전환 시 화면 전체에 짧은 글리치 노이즈 버스트가 발생.",
    difficulty: "상",
  },
  {
    slug: "digitalists",
    title: "digitalists",
    url: "https://digitalists.at",
    category: "interactive-portfolio",
    categoryLabel: INTERACTIVE_PORTFOLIO_LABEL,
    confidence: "추정",
    concept:
      "WordPress 기반의 웹 에이전시 사이트. 상대적으로 라이트한 모션으로 실무 친화적인 균형감을 보여준다.",
    techniques: [
      "라이트 패럴럭스 스크롤",
      "CSS/GSAP 하이브리드 모션",
      "호버 카드 트랜지션",
      "심플 페이지 전환",
    ],
    signature: "서비스 카드에 마우스를 올리면 가벼운 패럴럭스 틸트가 적용.",
    difficulty: "하",
  },

  // B. brand-experience
  {
    slug: "razorpay-sprint-26",
    title: "Razorpay Sprint 26",
    url: "https://razorpay.com/sprint/26",
    category: "brand-experience",
    categoryLabel: BRAND_EXPERIENCE_LABEL,
    confidence: "확인됨",
    concept:
      "B2B 결제 캠페인. WebGL+Three.js+Webflow 조합으로 단 2색(#0039FF/#151515) 팔레트만 사용하면서도 100개 이상의 스크롤/클릭 트리거로 풍부한 경험을 만든다. 스크롤에 따라 거대한 오브제가 트랙을 따라 전진하며 쇼퍼의 결제 여정을 내러티브로 펼친다. Awwwards SOTD.",
    techniques: [
      "2색 팔레트 기반 WebGL 씬",
      "100+ 스크롤/클릭 트리거 오케스트레이션",
      "스크롤 연동 오브제 전진(트랙형 진행 내러티브)",
      "Webflow + Three.js 하이브리드",
      "GSAP ScrollTrigger 타임라인 체이닝",
    ],
    signature:
      "스크롤에 따라 거대한 오브제(신발)를 중심으로 100+ 트리거가 순차적으로 전진하며 쇼퍼의 여정처럼 펼쳐짐.",
    difficulty: "상",
  },
  {
    slug: "izanami",
    title: "Izanami",
    url: "https://izanami-official.com",
    category: "brand-experience",
    categoryLabel: BRAND_EXPERIENCE_LABEL,
    confidence: "확인됨",
    concept:
      "일본 라이프스타일 브랜드. '조화(和)의 정신'을 절제된 일본 미학의 WebGL 분위기로 연출한다.",
    techniques: [
      "절제된 컬러 그레이딩 셰이더",
      "느린 카메라 패럴럭스",
      "안개/깊이감 포스트프로세싱",
      "미니멀 스크롤 페이드 전환",
    ],
    signature: "스크롤에 따라 안개가 서서히 걷히듯 다음 제품이 드러남.",
    difficulty: "중",
  },
  {
    slug: "cartier-watches-and-wonders",
    title: "Cartier Watches & Wonders",
    url: "https://cartier.com/.../watchesandwonders",
    category: "brand-experience",
    categoryLabel: BRAND_EXPERIENCE_LABEL,
    confidence: "추정",
    concept:
      "럭셔리 워치 브랜드 캠페인. 시계 부품의 정밀함을 3D 클로즈업과 라이팅으로 강조한다.",
    techniques: [
      "3D 시계 모델 클로즈업 렌더링",
      "스튜디오 라이팅 시뮬레이션",
      "스크롤 연동 카메라 도리 인",
      "메탈/유리 PBR 머티리얼",
    ],
    signature: "스크롤에 따라 카메라가 시계 무브먼트 내부로 줌인.",
    difficulty: "상",
  },
  {
    slug: "pp-neue-montreal",
    title: "PP Neue Montreal",
    url: "https://neuemontreal.com",
    category: "brand-experience",
    categoryLabel: BRAND_EXPERIENCE_LABEL,
    confidence: "추정",
    concept:
      "Pangram Pangram 서체 쇼케이스. 타이포그래피 자체가 주인공인 글자 형태 실험.",
    techniques: [
      "베리어블 폰트 인터랙션",
      "글자 형태 모핑 셰이더",
      "마우스 추적 폰트 weight 변화",
      "WebGL 텍스트 렌더링",
    ],
    signature: "마우스 위치에 따라 텍스트의 굵기/너비가 실시간으로 보간.",
    difficulty: "중",
  },
  {
    slug: "kfc-loyalty",
    title: "KFC Loyalty",
    url: "https://kfc.it/loyalty",
    category: "brand-experience",
    categoryLabel: BRAND_EXPERIENCE_LABEL,
    confidence: "추정",
    concept:
      "브랜드 로열티 캠페인. 친근하고 유쾌한 톤으로 리워드 시스템을 게임처럼 시각화.",
    techniques: [
      "게이미피케이션 UI 모션",
      "아이콘/뱃지 바운스 애니메이션",
      "스크롤 트리거 카운터",
      "GSAP 일레스틱 이징",
    ],
    signature: "포인트가 쌓이는 과정을 카운터와 바운스 애니메이션으로 시각화.",
    difficulty: "하",
  },
  {
    slug: "hydroflow",
    title: "Hydroflow",
    url: "https://hydroflowdrink.com",
    category: "brand-experience",
    categoryLabel: BRAND_EXPERIENCE_LABEL,
    confidence: "추정",
    concept:
      "음료 브랜드 사이트. 물/액체의 흐름을 시각적 메타포로 사용한 청량한 경험.",
    techniques: [
      "유체 시뮬레이션 셰이더",
      "병 3D 모델 + 액체 머티리얼",
      "스크롤 연동 액체 채움 애니메이션",
      "굴절/반사 포스트프로세싱",
    ],
    signature: "스크롤에 맞춰 병 안의 액체가 차오르는 듯한 셰이더 애니메이션.",
    difficulty: "중",
  },
  {
    slug: "la-revoltosa",
    title: "La Revoltosa",
    url: "https://larevoltosa.es",
    category: "brand-experience",
    categoryLabel: BRAND_EXPERIENCE_LABEL,
    confidence: "추정",
    concept:
      "이베리아 음료 브랜드. 강렬한 색감과 라틴 정서를 담은 다이내믹한 비주얼.",
    techniques: [
      "비비드 컬러 그라디언트 셰이더",
      "리듬감 있는 스크롤 트랜지션",
      "이미지 시퀀스 애니메이션",
      "GSAP 타임라인",
    ],
    signature: "스크롤마다 강렬한 컬러 그라디언트가 배경을 빠르게 전환.",
    difficulty: "중",
  },
  {
    slug: "northgarden",
    title: "NorthGarden",
    url: "https://northgarden.com",
    category: "brand-experience",
    categoryLabel: BRAND_EXPERIENCE_LABEL,
    confidence: "추정",
    concept:
      "브랜드 사이트. 자연/정원을 모티프로 한 차분하고 유기적인 비주얼 경험.",
    techniques: [
      "유기적 파티클 필드(꽃잎/잎사귀)",
      "바람 시뮬레이션 셰이더",
      "스크롤 패럴럭스 레이어",
      "소프트 라이팅",
    ],
    signature: "배경의 파티클이 바람에 흔들리듯 부드럽게 떠다님.",
    difficulty: "중",
  },
  {
    slug: "loft-thirty-one",
    title: "LOFT THIRTY ONE",
    url: "https://loftthirtyone.com",
    category: "brand-experience",
    categoryLabel: BRAND_EXPERIENCE_LABEL,
    confidence: "추정",
    concept:
      "브랜드/공간 사이트. 로프트 공간의 입체감을 3D 워크스루처럼 표현.",
    techniques: [
      "3D 공간 워크스루 카메라",
      "스크롤 연동 룸 전환",
      "조명 전환 애니메이션",
      "공간감 있는 깊이 블러",
    ],
    signature: "스크롤에 따라 카메라가 공간을 가로질러 이동하는 워크스루.",
    difficulty: "상",
  },
  {
    slug: "cryptowl",
    title: "CryptOwl",
    url: "https://cryptowl.io",
    category: "brand-experience",
    categoryLabel: BRAND_EXPERIENCE_LABEL,
    confidence: "추정",
    concept:
      "'Crypto Strategy Through Time'을 표방하는 크립토 브랜드. 시간/타임라인을 핵심 메타포로 사용.",
    techniques: [
      "3D 타임라인 시각화",
      "스크롤 연동 시간축 이동",
      "글로우/네온 셰이더",
      "데이터 포인트 마커 애니메이션",
    ],
    signature: "스크롤에 따라 3D 타임라인을 따라 카메라가 시간순으로 이동.",
    difficulty: "상",
  },

  // C. b2b-tech
  {
    slug: "cipher-digital",
    title: "Cipher Digital",
    url: "https://cipherdigital.com",
    category: "b2b-tech",
    categoryLabel: B2B_TECH_LABEL,
    confidence: "확인됨",
    concept:
      "AI 데이터센터 인프라 기업(파트너 Google/AWS/Fluidstack). 헤비 3D보다 절제된 모션으로 프리미엄/정밀/신뢰 톤을 유지한다.",
    techniques: [
      "절제된 와이어프레임/그리드 비주얼",
      "미니멀 스크롤 페이드",
      "데이터센터 추상화 3D 오브젝트",
      "라이트 글로우 액센트",
    ],
    signature: "추상화된 서버랙 형상이 스크롤에 맞춰 정교하게 정렬되는 모션.",
    difficulty: "중",
  },
  {
    slug: "armory",
    title: "Armory",
    url: "https://armory.in",
    category: "b2b-tech",
    categoryLabel: B2B_TECH_LABEL,
    confidence: "추정",
    concept:
      "C-UAS(대드론) 방산 기업. 보안/방어 이미지를 전달하는 정밀하고 무거운 톤.",
    techniques: [
      "레이더/탐지 범위 시각화",
      "와이어프레임 드론 3D 모델",
      "스캔라인 셰이더 효과",
      "다크 톤 라이팅",
    ],
    signature: "레이더 스캔처럼 화면을 가로지르는 탐지 범위 애니메이션.",
    difficulty: "상",
  },
  {
    slug: "hashgraph-ventures",
    title: "Hashgraph Ventures",
    url: "https://hashgraphvc.com",
    category: "b2b-tech",
    categoryLabel: B2B_TECH_LABEL,
    confidence: "추정",
    concept:
      "AI & 블록체인 VC. 네트워크와 자본의 흐름을 추상적 그래프로 시각화.",
    techniques: [
      "노드/엣지 네트워크 그래프",
      "파티클 흐름 애니메이션",
      "스크롤 연동 그래프 확장",
      "다크 그래디언트 배경",
    ],
    signature: "스크롤할수록 네트워크 그래프의 노드가 점점 더 많이 확장.",
    difficulty: "중",
  },
  {
    slug: "rsquad",
    title: "RSquad",
    url: "https://rsquad.io",
    category: "b2b-tech",
    categoryLabel: B2B_TECH_LABEL,
    confidence: "추정",
    concept:
      "Blockchain Lab. 기술 실험실의 이미지를 추상적인 기하 구조로 표현.",
    techniques: [
      "기하학적 3D 오브젝트 회전",
      "와이어프레임 모핑",
      "스크롤 연동 구조 변형",
      "네온 액센트 컬러",
    ],
    signature: "스크롤에 맞춰 기하학적 오브젝트가 다른 형태로 모핑.",
    difficulty: "중",
  },
  {
    slug: "air-business-center",
    title: "AIR business center",
    url: "https://aircenter.space",
    category: "b2b-tech",
    categoryLabel: B2B_TECH_LABEL,
    confidence: "추정",
    concept: "비즈니스 센터/공간. 건축적 공간감을 강조하는 클린한 사이트.",
    techniques: [
      "건축 모델 3D 뷰어",
      "스크롤 연동 층별 전환",
      "공간 조명 시뮬레이션",
      "미니멀 UI 오버레이",
    ],
    signature: "스크롤에 따라 건물의 각 층을 순서대로 보여주는 3D 전환.",
    difficulty: "중",
  },
  {
    slug: "reventador",
    title: "Reventador",
    url: "https://reventador.global",
    category: "b2b-tech",
    categoryLabel: B2B_TECH_LABEL,
    confidence: "추정",
    concept:
      "산업 탈탄소화 솔루션. 친환경/지속가능성을 추상 데이터 비주얼로 전달.",
    techniques: [
      "탄소 배출 감소 데이터 시각화",
      "유기적 곡선 애니메이션",
      "스크롤 연동 수치 카운트업",
      "그린 톤 그래디언트",
    ],
    signature: "스크롤에 따라 탄소 배출 그래프 곡선이 점진적으로 하강.",
    difficulty: "중",
  },
  {
    slug: "podium",
    title: "Podium",
    url: "https://podium.global",
    category: "b2b-tech",
    categoryLabel: B2B_TECH_LABEL,
    confidence: "추정",
    concept:
      "스포츠 영상 제작 크리에이티브 스튜디오. 다이내믹한 영상 편집 감성을 웹으로 옮긴다.",
    techniques: [
      "영상 시퀀스 스크럽 애니메이션",
      "스포츠 모션 블러 효과",
      "스크롤 연동 클립 전환",
      "비디오 텍스처 3D 패널",
    ],
    signature: "스크롤 위치에 따라 영상 클립이 스크럽되며 재생.",
    difficulty: "중",
  },
  {
    slug: "tower-architectural-doors",
    title: "Tower Architectural Doors",
    url: "https://towerdoors.com.au",
    category: "b2b-tech",
    categoryLabel: B2B_TECH_LABEL,
    confidence: "추정",
    concept: "건축 도어 시스템 제조사. 제품의 구조와 작동 방식을 명확히 전달.",
    techniques: [
      "도어 작동 메커니즘 3D 애니메이션",
      "분해도(exploded view) 인터랙션",
      "스크롤 연동 부품 분리",
      "클린 스튜디오 라이팅",
    ],
    signature: "스크롤에 따라 도어 부품들이 분해도처럼 펼쳐짐.",
    difficulty: "중",
  },
  {
    slug: "fabrics-protection",
    title: "Fabrics Protection",
    url: "https://en.protection.gr",
    category: "b2b-tech",
    categoryLabel: B2B_TECH_LABEL,
    confidence: "추정",
    concept:
      "패브릭 보호 제품 브랜드. 직물의 질감과 보호 효과를 클로즈업 비주얼로 강조.",
    techniques: [
      "직물 질감 클로즈업 셰이더",
      "방수/오염 방지 시뮬레이션",
      "스크롤 연동 비포/애프터 전환",
      "매크로 라이팅",
    ],
    signature: "스크롤에 따라 직물 표면에 떨어진 액체가 스며들지 않고 굴러떨어짐.",
    difficulty: "중",
  },

  // D. data-viz
  {
    slug: "world-cup-2026",
    title: "World Cup 2026",
    url: "https://sheets.works/data-viz/world-cup-2026",
    category: "data-viz",
    categoryLabel: DATA_VIZ_LABEL,
    confidence: "추정",
    concept:
      "팀/경기장/경기 데이터 시각화. D3/Canvas 계열 기법으로 추정되며, 방대한 스포츠 데이터를 직관적으로 탐색 가능하게 만든다.",
    techniques: [
      "D3.js 기반 데이터 바인딩",
      "Canvas/SVG 하이브리드 렌더링",
      "인터랙티브 필터/탐색 UI",
      "지리 좌표 기반 경기장 맵",
    ],
    signature: "팀이나 경기장을 클릭하면 관련 데이터가 동적으로 필터링되어 재구성.",
    difficulty: "중",
  },
  {
    slug: "south-cliff-dental",
    title: "South Cliff Dental",
    url: "https://southcliffdentalgroup.com",
    category: "data-viz",
    categoryLabel: DATA_VIZ_LABEL,
    confidence: "확인(노미니)",
    concept:
      "치과 브랜드. Awwwards 노미니로, '지루한 업종도 craft로 수상권에 들 수 있다'는 증거가 되는 사례.",
    techniques: [
      "미니멀 클레이/3D 일러스트",
      "부드러운 스크롤 트랜지션",
      "호버 마이크로 인터랙션",
      "따뜻한 컬러 팔레트 라이팅",
    ],
    signature: "스크롤마다 치아/케어 관련 3D 일러스트가 부드럽게 등장.",
    difficulty: "하",
  },
  {
    slug: "climanova",
    title: "ClimaNova",
    url: "https://climanovaquebec.com",
    category: "data-viz",
    categoryLabel: DATA_VIZ_LABEL,
    confidence: "확인(노미니)",
    concept:
      "에너지/태양광/배터리 브랜드. Awwwards 노미니로, 에너지 흐름을 시각적 데이터로 표현한다.",
    techniques: [
      "에너지 흐름 파티클 시각화",
      "태양광 패널 3D 모델",
      "스크롤 연동 수치 카운트업",
      "그린/옐로 톤 글로우",
    ],
    signature: "스크롤에 따라 태양광에서 배터리로 이어지는 에너지 흐름 파티클 애니메이션.",
    difficulty: "중",
  },
];
