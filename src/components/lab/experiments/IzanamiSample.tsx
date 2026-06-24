"use client";

import IzanamiFogReveal from "./IzanamiFogReveal";
import {
  IzanamiCraftVector,
  IzanamiEnsoVector,
  IzanamiRetreatVector,
} from "./LabVectors";

const PHILOSOPHY =
  "Harmony is not something to be created. It is something to be remembered. Guided by the ancient spirit of 和 Wa, Izanami opens a quiet path back to oneself.";

export default function IzanamiSample() {
  return (
    <div className="flex flex-col bg-[#ebe6dc] text-[#1c1917]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#d8d2c8] bg-[#ebe6dc]/90 px-6 py-5 backdrop-blur">
        <span className="text-sm uppercase tracking-[0.35em] text-[#1c1917]/70">
          Izanami
        </span>
        <div className="hidden gap-6 font-serif text-[10px] uppercase tracking-[0.2em] text-[#1c1917]/35 sm:flex">
          <span>Philosophy</span>
          <span>Projects</span>
          <span>Company</span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[55vh] w-full max-w-[900px] flex-col items-center justify-center px-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.45em] text-[#8b7355]">
          Sharing the Japanese Spirit of Harmony
        </p>
        <h1 className="mt-6 font-serif text-5xl font-light tracking-tight sm:text-7xl">
          Remember
          <br />
          who you are
        </h1>
        <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-[#1c1917]/50">
          스크롤하면 안개가 서서히 걷히며 School · Craft · Retreat practice가
          드러납니다. 절제된 일본 미학과 느린 패럴럭스.
        </p>
        <div className="mt-10 text-xs text-[#1c1917]/30">↓ scroll — pinned fog reveal</div>
      </section>

      <IzanamiFogReveal />

      <section className="mx-auto w-full max-w-[800px] px-6 py-24 text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#8b7355]">Philosophy</p>
        <p className="mt-8 font-serif text-xl leading-relaxed text-[#1c1917]/75 sm:text-2xl">
          {PHILOSOPHY}
        </p>
      </section>

      <section className="mx-auto w-full max-w-[900px] px-6 pb-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <IzanamiEnsoVector />
          <IzanamiCraftVector />
          <IzanamiRetreatVector />
        </div>
      </section>

      <footer className="border-t border-[#d8d2c8] px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="font-serif text-xs text-[#1c1917]/40">izanami-official.com ↗</span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c1917]/25">
            R3F / GLSL mist / GSAP ScrollTrigger
          </p>
        </div>
      </footer>
    </div>
  );
}
