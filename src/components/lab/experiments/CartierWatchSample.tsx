"use client";

import CartierWatchZoom from "./CartierWatchZoom";
import {
  CartierAlcoveVector,
  CartierDialVector,
  CartierMovementVector,
} from "./LabVectors";
import { useLocale } from "@/i18n/LocaleProvider";

const UNIVERSES = [
  "Tank Louis — burgundy alcove",
  "Santos — steel horizon",
  "Panthère — golden sands",
  "Ballon Bleu — mirrored depths",
  "Crash — twilight chamber",
  "Baignoire — dawn oval",
];

export default function CartierWatchSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col bg-[#0a0808] text-[#f5f0e8]">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#2a1818] bg-[#0a0808]/90 px-6 py-5 backdrop-blur">
        <span className="font-serif text-sm uppercase tracking-[0.35em] text-[#c9a227]">
          Cartier
        </span>
        <div className="hidden gap-6 text-[10px] uppercase tracking-[0.2em] text-[#f5f0e8]/35 sm:flex">
          <span>Universes</span>
          <span>Collection</span>
          <span>Experience</span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[55vh] w-full max-w-[900px] flex-col items-center justify-center px-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#c9a227]/80">
          Watches &amp; Wonders — Style Sample
        </p>
        <h1 className="mt-6 font-serif text-5xl font-light tracking-wide sm:text-6xl">
          Refined
          <br />
          universes
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-[#f5f0e8]/50">
          {locale === "ko"
            ? "카메라는 원통형 무대 중앙에 고정됩니다. 스크롤하면 배경만 180°씩 회전하고, 중앙 시계는 반대 방향으로 회전해 화면에 고정됩니다. 배경이 바뀌는 시점에 시계 모델이 교체됩니다."
            : "The camera stays pinned at the center of a cylindrical stage. As you scroll, only the backdrop rotates 180° at a time while the central watch counter-rotates to stay fixed on screen. The watch model swaps at each backdrop transition."}
        </p>
        <div className="mt-10 text-xs text-[#f5f0e8]/30">↓ scroll — cylindrical stage rotation</div>
      </section>

      <CartierWatchZoom />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#c9a227]/70">
          Scrolling universes
        </p>
        <ul className="mt-8 space-y-4">
          {UNIVERSES.map((line) => (
            <li
              key={line}
              className="border-t border-[#2a1818] pt-4 font-serif text-lg text-[#f5f0e8]/75"
            >
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-[900px] px-6 pb-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <CartierAlcoveVector />
          <CartierDialVector />
          <CartierMovementVector />
        </div>
      </section>

      <footer className="border-t border-[#2a1818] px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-[#f5f0e8]/35">cartier.com/watchesandwonders ↗</span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#f5f0e8]/25">
            R3F / PBR / GSAP ScrollTrigger
          </p>
        </div>
      </footer>
    </div>
  );
}
