"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import RsquadGeometryMorph from "./RsquadGeometryMorph";
import { RsquadMorphVector, RsquadWireVector } from "./LabVectors";

const PILLARS = [
  "Scroll scrubs polyhedron morph — tetra → cube → octa → icosa → dodeca",
  "4500-particle shell + cyan wireframe cage synced to morph",
  "Black/white Clarke narrative with glitch typography on chapter change",
  "Pointer parallax + slow rotation — rsquad.io geometry lab feel",
];

export default function RsquadSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col text-white" style={{ background: "#000000" }}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-black/90 px-6 py-4 backdrop-blur">
        <span className="text-sm font-semibold tracking-tight">RSquad</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">
          Blockchain Lab
        </span>
      </header>

      <section className="mx-auto flex min-h-[50vh] w-full max-w-[900px] flex-col justify-center px-6 py-16">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40">
          RSquad — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-light uppercase leading-tight tracking-tight sm:text-5xl">
          Advanced tech
          <br />
          <span className="text-[#b8fff0]">is indistinguishable from magic</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/55">
          {locale === "ko"
            ? "스크롤에 맞춰 와이어프레임 기하 구조가 다면체 형태로 모핑됩니다. 흑백 타이포와 글리치 전환으로 rsquad.io의 실험실 무드를 재현합니다."
            : "As you scroll, the wireframe geometry morphs through polyhedral forms. Black-and-white typography and glitch transitions recreate rsquad.io's laboratory mood."}
        </p>
        <ul className="mt-8 space-y-2 text-xs text-white/45">
          {PILLARS.map((line) => (
            <li key={line}>· {line}</li>
          ))}
        </ul>
        <div className="mt-10 text-xs text-white/35">↓ scroll — geometry morph</div>
      </section>

      <RsquadGeometryMorph />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <RsquadMorphVector />
          <RsquadWireVector />
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-white/40">rsquad.io ↗</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
            wireframe morph · glitch story · blockchain lab
          </p>
        </div>
      </footer>
    </div>
  );
}
