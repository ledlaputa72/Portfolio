"use client";

import ProduxSplitText from "./ProduxSplitText";
import { ProduxRevealVector, ProduxSplitVector } from "./LabVectors";

const PRINCIPLES = [
  "Typography is the message.",
  "Split to emphasize — reform to resolve.",
  "Scroll is the editor.",
];

export default function ProduxSample() {
  return (
    <div className="flex flex-col bg-[#f4f2ed] text-[#111111]">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e0ddd4] bg-[#f4f2ed]/90 px-6 py-4 backdrop-blur">
        <span className="text-sm font-bold uppercase tracking-[0.2em]">PRODUX</span>
        <div className="hidden gap-6 text-[10px] uppercase tracking-[0.2em] text-[#111111]/40 sm:flex">
          <span>Work</span>
          <span>Studio</span>
          <span>Contact</span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[50vh] w-full max-w-[900px] flex-col justify-center px-6 py-16">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#111111]/40">
          PRODUX — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-black uppercase leading-tight tracking-tight sm:text-6xl">
          Design
          <br />
          that speaks.
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#111111]/55">
          헤드라인이 스크롤에 맞춰 단어 단위로 분해·재조합됩니다. 3개 구문이
          Together → Split → Reform 사이클로 전환됩니다.
        </p>
        <div className="mt-8 text-xs text-[#111111]/35">↓ scroll — pinned type animation</div>
      </section>

      <ProduxSplitText />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <ul className="space-y-6">
          {PRINCIPLES.map((line) => (
            <li
              key={line}
              className="border-t border-[#e0ddd4] pt-6 text-xl font-semibold text-[#111111]/80"
            >
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-[900px] px-6 pb-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ProduxSplitVector />
          <ProduxRevealVector />
        </div>
      </section>

      <footer className="border-t border-[#e0ddd4] px-6 py-12">
        <div className="mx-auto flex max-w-[900px] justify-center">
          <span className="text-xs text-[#111111]/40">produx.design ↗</span>
        </div>
      </footer>
    </div>
  );
}
