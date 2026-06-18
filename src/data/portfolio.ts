export const profile = {
  name: "홍길동",
  role: "Product Designer & Frontend Developer",
  tagline: "사용자 경험과 코드를 모두 다루는 디자이너 겸 개발자입니다.",
  email: "hello@example.com",
  social: {
    github: "https://github.com/yourname",
    linkedin: "https://linkedin.com/in/yourname",
    instagram: "https://instagram.com/yourname",
  },
};

export const about = {
  summary:
    "5년차 프로덕트 디자이너 겸 프론트엔드 개발자로, 사용자 리서치부터 UI 디자인, 구현까지 전 과정을 경험했습니다. 작은 디테일이 큰 임팩트를 만든다고 믿습니다.",
  skills: [
    "TypeScript",
    "React / Next.js",
    "Figma",
    "Tailwind CSS",
    "UX Research",
    "Design Systems",
  ],
  timeline: [
    { year: "2024 — 현재", title: "Senior Product Designer", org: "ACME Inc." },
    { year: "2021 — 2024", title: "Product Designer", org: "Studio Nine" },
    { year: "2019 — 2021", title: "Frontend Developer", org: "Bright Labs" },
  ],
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  role: string;
  year: string;
  tags: string[];
  image: string;
  link?: string;
};

export const projects: Project[] = [
  {
    id: "case-1",
    title: "핀테크 모바일 앱 리디자인",
    summary:
      "온보딩 이탈률을 42% 낮춘 결제 앱 전면 리디자인 프로젝트입니다.",
    role: "Lead Designer",
    year: "2024",
    tags: ["UX Research", "Mobile", "Design System"],
    image: "/window.svg",
    link: "#",
  },
  {
    id: "case-2",
    title: "사내 데이터 대시보드",
    summary: "복잡한 운영 데이터를 한눈에 볼 수 있는 대시보드를 설계 및 구축했습니다.",
    role: "Designer & Developer",
    year: "2023",
    tags: ["React", "Data Viz", "B2B"],
    image: "/file.svg",
    link: "#",
  },
  {
    id: "case-3",
    title: "커머스 플랫폼 디자인 시스템",
    summary: "여러 팀이 공유하는 컴포넌트 라이브러리와 디자인 토큰을 구축했습니다.",
    role: "Design System Lead",
    year: "2022",
    tags: ["Design System", "Figma", "Tailwind"],
    image: "/globe.svg",
    link: "#",
  },
];

export const gallery = [
  { id: "g1", src: "/window.svg", alt: "작업 스냅샷 1" },
  { id: "g2", src: "/file.svg", alt: "작업 스냅샷 2" },
  { id: "g3", src: "/globe.svg", alt: "작업 스냅샷 3" },
  { id: "g4", src: "/next.svg", alt: "작업 스냅샷 4" },
  { id: "g5", src: "/vercel.svg", alt: "작업 스냅샷 5" },
];
