"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import PpNeueMontrealType from "./PpNeueMontrealType";
import {
  PpMonoGridVector,
  PpWeightAxisVector,
  PpWidthAxisVector,
} from "./LabVectors";

const WEIGHTS = [
  "Hairline",
  "Extralight",
  "Thin",
  "Light",
  "Book",
  "Regular",
  "Medium",
  "Semibold",
  "Bold",
  "Extrabold",
  "Black",
];

export default function PpNeueMontrealSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col bg-black text-white">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-black/90 px-6 py-5 backdrop-blur">
        <span className="text-xs uppercase tracking-[0.35em] text-white/70">
          PP Neue Montreal
        </span>
        <div className="hidden gap-6 text-[10px] uppercase tracking-[0.2em] text-white/35 sm:flex">
          <span>Specimens</span>
          <span>Weights</span>
          <span>Buy</span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[50vh] w-full max-w-[900px] flex-col justify-center px-6 py-16">
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
          Pangram Pangram Foundry
        </p>
        <h1 className="mt-4 text-4xl font-light leading-tight tracking-tight sm:text-6xl">
          A timeless,
          <br />
          classic grotesk.
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/50">
          {locale === "ko"
            ? "타이포그래피가 주인공. 마우스에 가까울수록 글자 weight·width가 실시간 보간되고, 스크롤하면 specimen이 전환됩니다."
            : "Typography takes the lead. The closer the mouse, the more the letter weight and width interpolate in real time; as you scroll, the specimen switches."}
        </p>
        <div className="mt-8 text-xs text-white/30">↓ scroll — pinned variable type</div>
      </section>

      <PpNeueMontrealType />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/35">
          Weights chart
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {WEIGHTS.map((w) => (
            <span
              key={w}
              className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/50"
            >
              {w}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[900px] px-6 pb-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <PpWeightAxisVector />
          <PpWidthAxisVector />
          <PpMonoGridVector />
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-white/35">neuemontreal.com ↗</span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            Variable font / DOM / GSAP ScrollTrigger
          </p>
        </div>
      </footer>
    </div>
  );
}
