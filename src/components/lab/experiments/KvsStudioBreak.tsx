"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const PHRASE = "CLICK TO BREAK";
const REVEAL_LINES = [
  "Product Design",
  "Creative Development",
  "Premium Design Partner",
];

function splitChars(text: string) {
  return text.split("").map((char, index) => ({
    id: `${char}-${index}`,
    char: char === " " ? "\u00A0" : char,
  }));
}

const CHARS = splitChars(PHRASE);

export default function KvsStudioBreak() {
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const revealRef = useRef<HTMLDivElement>(null);
  const scatterTlRef = useRef<gsap.core.Timeline | null>(null);

  const [broken, setBroken] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [scatterCount, setScatterCount] = useState(0);

  const scatterLetter = useCallback((el: HTMLSpanElement, intensity: number) => {
    gsap.to(el, {
      x: (Math.random() - 0.5) * 280 * intensity,
      y: (Math.random() - 0.5) * 160 * intensity,
      rotation: (Math.random() - 0.5) * 80 * intensity,
      opacity: 1 - intensity * 0.55 + Math.random() * 0.2,
      scale: 1 - intensity * 0.35 + Math.random() * 0.2,
      duration: 0.45,
      ease: "power3.out",
      overwrite: "auto",
    });
  }, []);

  const handleProgress = useCallback(
    (p: number) => {
      const letters = letterRefs.current.filter(Boolean) as HTMLSpanElement[];
      let scattered = 0;

      letters.forEach((el, i) => {
        const threshold = (i + 0.5) / letters.length;
        const local = gsap.utils.clamp(0, 1, (p - (threshold - 0.08)) / 0.12);
        if (local > 0) {
          scattered += 1;
          scatterLetter(el, local);
        } else {
          gsap.set(el, { x: 0, y: 0, rotation: 0, opacity: 1, scale: 1 });
        }
      });

      setScatterCount(scattered);
      const isBroken = p > 0.92;
      setBroken(isBroken);

      if (revealRef.current) {
        gsap.set(revealRef.current, {
          opacity: isBroken ? 1 : p * 0.8,
          y: isBroken ? 0 : 24 * (1 - p),
        });
      }
    },
    [scatterLetter],
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleClickBreak = () => {
    scatterTlRef.current?.kill();
    const letters = letterRefs.current.filter(Boolean) as HTMLSpanElement[];
    const tl = gsap.timeline();
    scatterTlRef.current = tl;

    letters.forEach((el, i) => {
      tl.add(() => scatterLetter(el, 1), i * 0.02);
    });

    tl.to(revealRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
    setBroken(true);
    setScatterCount(letters.length);
  };

  const reset = () => {
    scatterTlRef.current?.kill();
    setBroken(false);
    setScatterCount(0);
    const letters = letterRefs.current.filter(Boolean) as HTMLSpanElement[];
    gsap.set(letters, { x: 0, y: 0, rotation: 0, opacity: 1, scale: 1, skewX: 0 });
    gsap.set(revealRef.current, { opacity: 0, y: 24 });
  };

  const { locale } = useLocale();

  return (
    <LabStickyScroll
      onProgress={handleProgress}
      scrollHeightVh={350}
      stickyClassName="bg-[#0a0a0a] text-[#f0f0f0]"
      hint={locale === "ko" ? "↓ 스크롤로 글자 분해 · 클릭으로 즉시 BREAK" : "↓ Scroll to scatter letters · click for instant BREAK"}
      progressLabel="Break Progress"
    >
      <div
        className="relative h-full w-full cursor-crosshair"
        onPointerMove={handlePointerMove}
        onClick={handleClickBreak}
        role="presentation"
      >
        <div className="pointer-events-none absolute right-6 top-14 z-20 font-mono text-[10px] leading-relaxed text-[#00ff9c]/80">
          <p>KVS.HUD</p>
          <p>
            X <span className="text-[#f0f0f0]">{coords.x.toFixed(0).padStart(4, "0")}</span>
          </p>
          <p>
            Y <span className="text-[#f0f0f0]">{coords.y.toFixed(0).padStart(4, "0")}</span>
          </p>
          <p>
            BRK <span className="text-[#f0f0f0]">{String(scatterCount).padStart(2, "0")}</span>
          </p>
        </div>

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="absolute inset-0 flex items-center justify-center px-6">
          <h2
            className="text-center text-4xl font-black uppercase tracking-tight sm:text-6xl md:text-7xl"
            style={{ textShadow: "2px 0 #ff00aa, -2px 0 #00ff9c" }}
          >
            {CHARS.map((item, index) => (
              <span
                key={item.id}
                ref={(el) => {
                  letterRefs.current[index] = el;
                }}
                className="inline-block will-change-transform"
              >
                {item.char}
              </span>
            ))}
          </h2>
        </div>

        <div
          ref={revealRef}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center opacity-0"
          style={{ transform: "translateY(24px)" }}
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#00ff9c]">
            Showcase Unlocked
          </p>
          <ul className="mt-6 space-y-2 text-center">
            {REVEAL_LINES.map((line) => (
              <li key={line} className="text-lg font-semibold sm:text-2xl">
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute bottom-24 left-6 font-mono text-[10px] text-[#f0f0f0]/30">
          {broken ? "BREAK.STATE = true" : "BREAK.STATE = scrolling"}
        </div>

        {broken ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              reset();
            }}
            className="absolute bottom-24 right-6 z-10 rounded border border-[#00ff9c]/40 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#00ff9c]"
          >
            Reset
          </button>
        ) : null}
      </div>
    </LabStickyScroll>
  );
}
