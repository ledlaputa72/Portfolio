"use client";

import NorthGardenParticles from "./NorthGardenParticles";
import {
  NorthGardenLogoVector,
  NorthGardenParticleVector,
  NorthGardenWindVector,
} from "./LabVectors";

const NAV = ["Work", "Services", "Start a Project"];

const CAPABILITIES = [
  "Digital products",
  "Websites & platforms",
  "Interactive experiences",
  "Creative technology",
  "Design systems",
  "3D & WebGL",
];

export default function NorthGardenSample() {
  return (
    <div className="flex flex-col text-white" style={{ background: "#ebe6dc" }}>
      <header className="fixed top-0 right-0 left-0 z-30 flex justify-center px-4 pt-5">
        <nav className="flex min-w-[280px] items-center justify-between gap-8 rounded-sm bg-white/15 px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-white/90 backdrop-blur-3xl">
          <span className="font-semibold tracking-tight normal-case text-white">
            NorthGarden
          </span>
          <div className="hidden gap-5 sm:flex">
            {NAV.map((item) => (
              <span key={item} className="text-white/50">
                {item}
              </span>
            ))}
          </div>
        </nav>
      </header>

      <section className="mx-auto flex min-h-[55vh] w-full max-w-[900px] flex-col justify-center px-6 pb-16 pt-28">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#1a1814]/45">
          NorthGarden — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-[#1a1814] sm:text-6xl">
          Where ideas grow,
          <br />
          designs breathe.
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#1a1814]/60">
          레퍼런스처럼 WebGL 파티클 필드가 바람에 흔들리듯 부유하고, 캔버스 색상이
          페이지 배경·theme-color에 동기화됩니다. B&amp;W 미니멀 UI와 글래스 내비게이션을
          재현합니다.
        </p>
        <ul className="mt-8 space-y-2 text-xs text-[#1a1814]/45">
          {CAPABILITIES.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-[#1a1814]/35">↓ scroll — wind particle field</div>
      </section>

      <NorthGardenParticles />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <NorthGardenParticleVector />
          <NorthGardenWindVector />
          <NorthGardenLogoVector />
        </div>
      </section>

      <footer className="border-t border-[#1a1814]/10 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-[#1a1814]/40">northgarden.com ↗</span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1a1814]/30">
            R3F particles · wind field · readPixels bg sync
          </p>
        </div>
      </footer>
    </div>
  );
}
