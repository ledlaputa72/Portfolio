"use client";

import TonyMakTransition from "./TonyMakTransition";
import {
  TonyMakCursorVector,
  TonyMakGridVector,
  TonyMakWipeVector,
} from "./LabVectors";
import { useLocale } from "@/i18n/LocaleProvider";

const SYSTEM_TAGS = [
  "ART DIRECTION",
  "BRAND SYSTEMS",
  "AI WORKFLOWS",
  "MOTION UI",
  "CREATIVE TECH",
];

const FLOW: { en: string; ko: string }[] = [
  {
    ko: "Hero — 스크롤 scrub으로 3D 배경 애니메이션 진행/정지",
    en: "Hero — scroll scrub drives/pauses the 3D background animation",
  },
  {
    ko: "타이틀 3챕터 상승·교체 (Creative at the Speed of Next → …)",
    en: "Three-chapter title rises and swaps (Creative at the Speed of Next → …)",
  },
  {
    ko: "Work — 프로젝트 리스트 + hover 시 뒤쪽 3D 프리뷰 교체",
    en: "Work — project list; hover swaps the 3D preview behind it",
  },
  {
    ko: "Contact — Let's build what's next",
    en: "Contact — Let's build what's next",
  },
];

export default function TonyMakSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col bg-[#f7f7f2] text-[#111111]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e5e5e0] bg-[#f7f7f2]/90 px-6 py-4 backdrop-blur">
        <span className="text-xs font-semibold uppercase tracking-[0.25em]">
          Tony Mak
        </span>
        <div className="hidden gap-6 text-[10px] uppercase tracking-[0.2em] text-[#111111]/40 sm:flex">
          <span>Work</span>
          <span>About</span>
          <span>Contact</span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[50vh] w-full max-w-[900px] flex-col items-center justify-center px-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#111111]/40">
          Tony Mak — Style Sample
        </p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
          Creative at the
          <br />
          Speed of Next
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm text-[#111111]/55">
          {locale === "ko"
            ? "레퍼런스처럼 스크롤에 따라 배경 3D가 scrub되고, 히어로 타이포가 위로 올라가며 교체됩니다. Work 구간에서는 프로젝트 리스트 hover로 뒤쪽 3D 프리뷰가 바뀝니다."
            : "Like the reference, the background 3D scrubs with scroll while the hero typography rises and swaps. In the Work section, hovering the project list swaps the 3D preview behind it."}
        </p>
        <ul className="mx-auto mt-8 max-w-lg space-y-2 text-left text-xs text-[#111111]/40">
          {FLOW.map((line) => (
            <li key={line.en}>· {line[locale]}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-[#111111]/35">↓ scroll — pinned journey</div>
      </section>

      <TonyMakTransition />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#111111]/40">
          System tags
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {SYSTEM_TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#111111]/15 px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-[#111111]/60"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[900px] px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <TonyMakGridVector />
          <TonyMakWipeVector />
          <TonyMakCursorVector />
        </div>
      </section>

      <footer className="border-t border-[#e5e5e0] px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs uppercase tracking-[0.2em] text-[#111111]/40">
            tonymak.co ↗
          </span>
          <p className="text-[10px] text-[#111111]/30">
            R3F scroll-scrub + DOM typography + project hover
          </p>
        </div>
      </footer>
    </div>
  );
}
