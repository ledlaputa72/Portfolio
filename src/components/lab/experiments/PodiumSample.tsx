"use client";

import PodiumVideoScrub from "./PodiumVideoScrub";

const PILLARS = [
  "0→100% load · hero blob-mask runner scrub on white (Codrops / San Rita)",
  "3D podium monolith — appears mid-scroll, hides, reappears at footer (3 beats)",
  "WebGL mosaic cluster at Work chapter — tilted campaign planes in 3D space",
  "Services · clients · athletes · CTA + film scrub NLE viewport",
];

export default function PodiumSample() {
  return (
    <div className="flex flex-col bg-white text-[#0a0a0a]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/8 bg-white/90 px-6 py-4 backdrop-blur">
        <span className="text-sm font-semibold tracking-tight">Podium</span>
        <nav className="flex gap-6 font-mono text-[10px] uppercase tracking-[0.15em] text-black/40">
          <span>Work</span>
          <span>About</span>
          <span>Contact</span>
        </nav>
      </header>

      <section className="mx-auto flex min-h-[40vh] w-full max-w-[900px] flex-col justify-center px-6 py-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-black/35">
          Podium — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-light leading-tight tracking-tight sm:text-5xl">
          Creative direction
          <br />
          <span className="text-black/55">for athleticism</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-black/50">
          스크롤이 영상 타임라인을 스크럽하고, 챕터가 연속 시퀀스로 전환됩니다.
          podium.global의 블롭 히어로·다크 워크 모자이크·미니멀 내비를 재현합니다.
        </p>
        <ul className="mt-8 space-y-2 text-xs text-black/40">
          {PILLARS.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-black/30">↓ scroll — film scrub · chapters</div>
      </section>

      <PodiumVideoScrub />

      <footer className="border-t border-black/8 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-black/40">podium.global ↗</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/25">
            scroll video scrub · mosaic work · Montreal
          </p>
        </div>
      </footer>
    </div>
  );
}
