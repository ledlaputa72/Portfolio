"use client";

import SynapserStudioScroll from "./SynapserStudioScroll";
import { SynapserScrollVector, SynapserTorusVector } from "./LabVectors";

const CHAPTERS = [
  "Manifesto — cinematic opening",
  "Archive — project grid drift",
  "Journey — synapse node network",
];

export default function SynapserStudioSample() {
  return (
    <div className="flex flex-col bg-[#0f0c0a] text-[#f0ebe3]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#2a2520] bg-[#0f0c0a]/90 px-6 py-4 backdrop-blur">
        <span className="text-sm font-medium tracking-tight">Synapser Studio</span>
        <div className="hidden gap-6 text-[10px] uppercase tracking-[0.2em] text-[#f0ebe3]/35 sm:flex">
          <span>Work</span>
          <span>Studio</span>
          <span>Contact</span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[55vh] w-full max-w-[900px] flex-col justify-center px-6 py-16">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#c9a66b]/70">
          Synapser Studio — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Scroll-driven
          <br />
          3D world.
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#f0ebe3]/50">
          Lisbon digital atelier. 스크롤하면 화면이 고정되고 Manifesto → Archive →
          Journey 장면이 카메라 drift와 함께 전환됩니다.
        </p>
        <div className="mt-8 text-xs text-[#f0ebe3]/30">↓ scroll — pinned 3D scenes</div>
      </section>

      <SynapserStudioScroll />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#c9a66b]/60">
          Chapters
        </p>
        <ul className="mt-6 space-y-4">
          {CHAPTERS.map((line) => (
            <li
              key={line}
              className="border-t border-[#2a2520] pt-4 text-lg font-medium text-[#f0ebe3]/75"
            >
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-[900px] px-6 pb-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <SynapserTorusVector />
          <SynapserScrollVector />
        </div>
      </section>

      <footer className="border-t border-[#2a2520] px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-[#f0ebe3]/35">synapserstudio.com ↗</span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#f0ebe3]/25">
            R3F / Three.js / GSAP ScrollTrigger
          </p>
        </div>
      </footer>
    </div>
  );
}
