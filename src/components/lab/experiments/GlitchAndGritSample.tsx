"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import GlitchAndGritBurst from "./GlitchAndGritBurst";
import {
  GritNoiseVector,
  GritProjectCardVector,
  GritRgbShiftVector,
} from "./LabVectors";

const SERVICES = [
  "Content & Marketing",
  "Web & Digital",
  "Brand & Identity",
  "Film & Documentary",
];

const PROJECTS = [
  "Living Creative Docuseries",
  "United Talent Agency",
  "Planet Paradise",
  "Skechers Running",
];

export default function GlitchAndGritSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col bg-[#edeae4] text-[#0a0a0a]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#d8d4cc] bg-[#edeae4]/90 px-6 py-5 backdrop-blur">
        <span className="text-sm font-semibold tracking-tight">Glitch&amp;Grit</span>
        <div className="hidden gap-6 text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/40 sm:flex">
          <span>Work</span>
          <span>Info</span>
          <span>Contact</span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[50vh] w-full max-w-[1000px] flex-col justify-center px-6 py-16">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#0a0a0a]/40">
          Glitch&amp;Grit — Style Sample
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[0.95] tracking-tight sm:text-6xl">
          Thoughtful creative,
          <br />
          built to scale.
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#0a0a0a]/55">
          {locale === "ko"
            ? "글리치 미학과 grit 질감. 스크롤하면 화면이 고정되고 섹션 전환마다 RGB 시프트·노이즈 버스트가 화면 전체를 통과합니다."
            : "Glitch aesthetics with grit texture. As you scroll, the view pins and every section change drives an RGB shift and noise burst across the full screen."}
        </p>
        <div className="mt-8 text-xs text-[#0a0a0a]/35">↓ scroll — pinned glitch transitions</div>
      </section>

      <GlitchAndGritBurst />

      <section className="mx-auto w-full max-w-[1000px] px-6 py-24">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#0a0a0a]/40">
          Services
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {SERVICES.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#0a0a0a]/15 px-4 py-2 text-[10px] uppercase tracking-[0.12em] text-[#0a0a0a]/55"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1000px] px-6 pb-12">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#0a0a0a]/40">
          Selected work
        </p>
        <ul className="mt-6 space-y-3">
          {PROJECTS.map((name) => (
            <li
              key={name}
              className="border-t border-[#d8d4cc] pt-4 text-lg font-medium text-[#0a0a0a]/75"
            >
              {name}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-[1000px] px-6 pb-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <GritRgbShiftVector />
          <GritNoiseVector />
          <GritProjectCardVector />
        </div>
      </section>

      <footer className="border-t border-[#d8d4cc] px-6 py-12">
        <div className="mx-auto flex max-w-[1000px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-[#0a0a0a]/40">glitchandgrit.com ↗</span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#0a0a0a]/30">
            GLSL / R3F / GSAP ScrollTrigger
          </p>
        </div>
      </footer>
    </div>
  );
}
