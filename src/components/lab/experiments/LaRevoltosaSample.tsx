"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import LaRevoltosaGradient from "./LaRevoltosaGradient";
import {
  RevoltosaBubbleVector,
  RevoltosaDrinkVector,
  RevoltosaGradientVector,
} from "./LabVectors";

const VIBES = [
  "Sobremesas en bares",
  "Picoteo",
  "Buena compañía",
  "Algo para brindar",
  "Muuuucho gas",
];

export default function LaRevoltosaSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col text-white" style={{ background: "#ff4d6d" }}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/15 bg-[#ff4d6d]/85 px-6 py-4 backdrop-blur">
        <span className="text-sm font-black uppercase tracking-[0.2em]">
          La Revoltosa
        </span>
        <div className="hidden gap-5 text-[10px] uppercase tracking-[0.15em] text-white/50 sm:flex">
          <span>Bebidas</span>
          <span>Historia</span>
          <span>Contacto</span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[50vh] w-full max-w-[900px] flex-col justify-center px-6 py-16">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/70">
          La Revoltosa — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
          La burbuja
          <br />
          <span className="text-[#ffe135]">Ibérica.</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/75">
          {locale === "ko"
            ? "스크롤마다 강렬한 컬러 그라디언트가 배경을 빠르게 전환합니다. 3D 버블과 음료 카드가 라틴 정서의 다이내믹한 비주얼을 완성합니다."
            : "With each scroll, vivid color gradients sweep rapidly across the background. 3D bubbles and drink cards complete a dynamic, Latin-spirited visual."}
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {VIBES.map((item) => (
            <span
              key={item}
              className="rounded-full border border-white/30 px-3 py-1 text-[10px] uppercase tracking-wider text-white/60"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="mt-10 text-xs text-white/40">↓ scroll — gradient sweep</div>
      </section>

      <LaRevoltosaGradient />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <RevoltosaBubbleVector />
          <RevoltosaGradientVector />
          <RevoltosaDrinkVector />
        </div>
      </section>

      <footer className="border-t border-white/15 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-white/45">larevoltosa.es ↗</span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            GLSL gradient · R3F bubbles · scroll rhythm
          </p>
        </div>
      </footer>
    </div>
  );
}
