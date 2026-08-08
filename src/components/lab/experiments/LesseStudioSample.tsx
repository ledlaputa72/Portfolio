"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import LesseStudioGrid from "./LesseStudioGrid";
import LesseStudioFloatingObject from "./LesseStudioFloatingObject";
import { LesseGridVector, LesseManifestoVector } from "./LabVectors";
const PRINCIPLES = [
  "Clarity over decoration.",
  "Motion should feel inevitable, not ornamental.",
  "Every grid line earns its place.",
];

export default function LesseStudioSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col bg-[#f6f5f1] text-[#1a1a18]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e2e0da] bg-[#f6f5f1]/90 px-6 py-5 backdrop-blur">
        <span className="text-sm font-medium tracking-tight">Lesse Studio</span>
        <div className="hidden gap-6 text-[10px] uppercase tracking-[0.2em] text-[#1a1a18]/40 sm:flex">
          <span>Work</span>
          <span>Studio</span>
          <span>Contact</span>
        </div>
      </header>

      <section className="relative mx-auto flex min-h-[72vh] w-full max-w-[900px] flex-col justify-center overflow-hidden px-6 py-16">
        <LesseStudioFloatingObject className="pointer-events-auto absolute inset-x-0 top-[8%] h-[52vh] max-h-[480px]" />

        <div className="relative z-10 mt-[48vh] sm:mt-[42vh]">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#1a1a18]/40">
            Lesse Studio — Style Sample
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Design &amp; Technology with intentional craft.
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#1a1a18]/55">
            {locale === "ko"
              ? "시작 화면 중앙의 3D 오브젝트가 마우스에 미묘하게 반응합니다. 스크롤하면 화면이 고정되고 그리드 카드가 순차 reveal됩니다."
              : "A 3D object at the center of the opening screen responds subtly to the mouse. As you scroll, the view pins and grid cards reveal in sequence."}
          </p>
          <div className="mt-8 text-xs text-[#1a1a18]/35">↓ scroll — floating object → grid reveal</div>
        </div>
      </section>

      <LesseStudioGrid />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {PRINCIPLES.map((line) => (
            <p
              key={line}
              className="border-t border-[#e2e0da] pt-6 text-lg font-medium leading-snug text-[#1a1a18]/80"
            >
              {line}
            </p>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[900px] px-6 pb-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <LesseGridVector />
          <LesseManifestoVector />
        </div>
      </section>

      <footer className="border-t border-[#e2e0da] px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-[#1a1a18]/40">lessestudio.com ↗</span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1a1a18]/30">
            R3F float + GSAP grid reveal
          </p>
        </div>
      </footer>
    </div>
  );
}
