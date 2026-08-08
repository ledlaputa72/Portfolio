"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const PHRASES = [
  { words: ["DESIGN", "THAT", "SPEAKS"], sub: "Design that Speaks" },
  { words: ["VOICE", "SHAPES", "BRAND"], sub: "Voice shapes brand" },
  { words: ["FORM", "FOLLOWS", "MESSAGE"], sub: "Form follows message" },
] as const;

type Phase = "together" | "split" | "reform";

function getPhase(p: number): Phase {
  const local = (p * 3) % 1;
  if (local < 0.28) return "together";
  if (local < 0.55) return "split";
  return "reform";
}

function getPhraseIndex(p: number) {
  return Math.min(2, Math.floor(p * 3));
}

export default function ProduxSplitText() {
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("together");
  const [spread, setSpread] = useState(0);

  useEffect(() => {
    wordRefs.current.forEach((el) => {
      if (el) gsap.set(el, { x: 0, y: 0, rotation: 0, opacity: 1, scale: 1 });
    });
  }, [phraseIndex]);

  const handleProgress = (p: number) => {
    const idx = getPhraseIndex(p);
    const ph = getPhase(p);
    const local = (p * 3) % 1;

    let amount = 0;
    if (ph === "split") {
      amount = (local - 0.28) / 0.27;
    } else if (ph === "reform") {
      amount = 1 - (local - 0.55) / 0.45;
    }

    amount = gsap.utils.clamp(0, 1, amount);
    setPhraseIndex(idx);
    setPhase(ph);
    setSpread(Math.round(amount * 100));

    const words = PHRASES[idx].words;
    words.forEach((_, i) => {
      const el = wordRefs.current[i];
      if (!el) return;

      const center = (words.length - 1) / 2;
      const baseX = (i - center) * 160;
      const explodeX = baseX * (1 + amount * 1.8);
      const explodeY = Math.sin(i * 1.4) * 90 * amount;
      const rot = (i - center) * 18 * amount;

      gsap.set(el, {
        x: explodeX,
        y: explodeY,
        rotation: rot,
        opacity: 1 - amount * 0.2,
        scale: 1 + amount * 0.06,
      });
    });
  };

  const current = PHRASES[phraseIndex];
  const { locale } = useLocale();

  return (
    <LabStickyScroll
      onProgress={handleProgress}
      scrollHeightVh={400}
      stickyClassName="bg-[#f4f2ed] text-[#111111]"
      hint={locale === "ko" ? "↓ 스크롤 — 화면 고정, 헤드라인이 분해·재조합됩니다" : "↓ Scroll — view pins, headline splits and reassembles"}
      progressLabel="Type Progress"
    >
      <div className="flex h-full flex-col items-center justify-center px-6">
        <p className="mb-8 text-[10px] uppercase tracking-[0.4em] text-[#111111]/40">
          {current.sub}
        </p>

        <div className="relative flex items-center justify-center">
          <h2 className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-5xl font-black uppercase tracking-tight sm:text-7xl md:text-8xl">
            {current.words.map((word, i) => (
              <span
                key={`${phraseIndex}-${word}`}
                ref={(el) => {
                  wordRefs.current[i] = el;
                }}
                className="inline-block will-change-transform"
              >
                {word}
              </span>
            ))}
          </h2>
        </div>

        <div className="mt-14 flex gap-8 font-mono text-[10px] uppercase tracking-widest text-[#111111]/45">
          <span className={phase === "together" ? "text-[#111111]" : ""}>Together</span>
          <span className={phase === "split" ? "text-[#111111]" : ""}>Split</span>
          <span className={phase === "reform" ? "text-[#111111]" : ""}>Reform</span>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-24 left-6 z-10">
        <p className="text-[10px] uppercase tracking-widest text-[#111111]/40">Spread</p>
        <p className="text-2xl font-bold tabular-nums">{spread}%</p>
      </div>

      <div className="pointer-events-none absolute bottom-24 right-24 z-10 text-right font-mono text-[10px] text-[#111111]/35">
        PHRASE {phraseIndex + 1} / {PHRASES.length}
      </div>
    </LabStickyScroll>
  );
}
