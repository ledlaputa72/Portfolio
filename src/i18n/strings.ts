import type { Localized } from "./config";

/** Fixed UI chrome strings for the header and Lab pages. */
export const UI = {
  // Header
  signIn: { en: "Sign in with GitHub", ko: "GitHub 로그인" },
  signOut: { en: "Sign out", ko: "로그아웃" },
  langToggleAria: {
    en: "Switch language",
    ko: "언어 전환",
  },

  // Lab index
  labIntro: {
    en: "A technical testbed where interactions are rebuilt from scratch with Three.js / React Three Fiber / GSAP. Each card links to a per-site experiment page, and the actual implementation is carried out step by step in Cursor.",
    ko: "이곳은 Three.js / React Three Fiber / GSAP로 직접 재현해보는 기술 테스트베드입니다. 각 카드는 사이트별 실험 페이지로 연결되며, 실제 구현은 Cursor에서 단계적으로 진행됩니다.",
  },
  featuredOnly: { en: "Featured only", ko: "추천만" },
  featuredOnlyAria: { en: "Show featured Labs only", ko: "추천한 Lab만 보기" },
  addFavorite: { en: "Add to favorites", ko: "즐겨찾기 추가" },
  removeFavorite: { en: "Remove from favorites", ko: "즐겨찾기 해제" },
  noFavorites: {
    en: "No featured Labs yet. Tap a card's star to add one.",
    ko: "추천한 Lab이 없습니다. 카드의 별을 눌러 추가해 보세요.",
  },

  // Lab detail
  difficultyPrefix: { en: "Difficulty", ko: "난이도" },
  viewFullSample: { en: "View full-page sample →", ko: "전체 페이지 샘플 보기 →" },
  conceptHeading: { en: "Concept", ko: "컨셉" },
  signatureHeading: { en: "Signature interaction", ko: "시그니처 인터랙션" },
  techniquesHeading: { en: "Techniques to build", ko: "구현할 기술" },
  coreDemoHeading: { en: "Core feature demo", ko: "핵심 기능 구현" },
  coreDemoDesc: {
    en: "Scroll to drive the parts that animate.",
    ko: "스크롤에 따라 변화하는 부분을 실제로 움직여보세요.",
  },
  librariesHeading: {
    en: "Implementation notes — key libraries",
    ko: "구현 노트 — 핵심 라이브러리",
  },
  pointsHeading: { en: "Implementation points", ko: "구현 포인트" },
  plannedPlaceholder: {
    en: "🚧 Implementation planned — built step by step in Cursor with Three.js / R3F",
    ko: "🚧 구현 예정 — Cursor에서 실제 Three.js/R3F 구현 진행",
  },
  backToLab: { en: "← Back to Lab", ko: "← Lab으로 돌아가기" },
} satisfies Record<string, Localized>;

/** "{title} style study" heading for a detail page. */
export const styleStudyHeading = (
  title: string,
): Localized => ({
  en: `${title} — style study`,
  ko: `${title} 스타일 실험`,
});

/** Back link on the sample page. */
export const backToTechPage = (title: string): Localized => ({
  en: `← Back to ${title} tech page`,
  ko: `← ${title} 기술 페이지로`,
});
