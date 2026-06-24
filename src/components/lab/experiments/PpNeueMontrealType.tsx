"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import LabStickyScroll from "./LabStickyScroll";

const SPECIMENS = [
  {
    line: "NEUE MONTREAL",
    sub: "Neo-grotesque sans-serif — display at scale",
  },
  {
    line: "GROTESQUE",
    sub: "Mouse proximity drives weight & width axes",
  },
  {
    line: "HAIRLINE BLACK",
    sub: "Full variable range — scroll thickens the baseline",
  },
] as const;

const FONT_FAMILY = '"Roboto Flex", "Inter", system-ui, sans-serif';

function splitLetters(text: string) {
  return text.split("").map((char, i) => ({
    id: `${char}-${i}`,
    char: char === " " ? "\u00A0" : char,
  }));
}

export default function PpNeueMontrealType() {
  const progressRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [specimenIndex, setSpecimenIndex] = useState(0);
  const [axisLabel, setAxisLabel] = useState({ wght: 400, wdth: 100 });

  const specimen = SPECIMENS[specimenIndex];
  const letters = splitLetters(specimen.line);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Roboto+Flex:wdth,wght@25..151,100..1000&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    letterRefs.current = [];
  }, [specimenIndex]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const progress = progressRef.current;
      const baseWght = 280 + progress * 220;
      let sumW = 0;
      let sumWd = 0;
      let count = 0;

      letterRefs.current.forEach((el) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
        const t = Math.min(1, dist / 200);
        const wght = Math.round(920 - t * (920 - baseWght));
        const wdth = Math.round(140 - t * 85);
        el.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}`;
        sumW += wght;
        sumWd += wdth;
        count += 1;
      });

      if (count > 0) {
        setAxisLabel({
          wght: Math.round(sumW / count),
          wdth: Math.round(sumWd / count),
        });
      }
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [specimenIndex]);

  const handleProgress = (p: number) => {
    progressRef.current = p;
    const idx = Math.min(SPECIMENS.length - 1, Math.floor(p * SPECIMENS.length));
    setSpecimenIndex(idx);

    const local = (p * SPECIMENS.length) % 1;
    const fadeEdge =
      local < 0.12 ? local / 0.12 : local > 0.88 ? (1 - local) / 0.12 : 1;

    if (containerRef.current) {
      gsap.set(containerRef.current, {
        opacity: fadeEdge,
        y: (1 - fadeEdge) * 24,
      });
    }
  };

  return (
    <LabStickyScroll
      progressRef={progressRef}
      onProgress={handleProgress}
      scrollHeightVh={360}
      stickyClassName="bg-black text-white"
      hint="↓ 스크롤 — specimen 전환 · 마우스로 weight/width 보간"
      progressLabel="Specimen"
    >
      <div
        ref={containerRef}
        className="flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <p className="mb-6 text-[10px] uppercase tracking-[0.45em] text-white/35">
          Pangram Pangram — PP Neue Montreal
        </p>

        <div
          className="flex flex-wrap justify-center leading-[0.85] tracking-tight"
          style={{ fontFamily: FONT_FAMILY }}
        >
          {letters.map((item, i) => (
            <span
              key={`${specimenIndex}-${item.id}`}
              ref={(el) => {
                letterRefs.current[i] = el;
              }}
              className="inline-block select-none text-[11vw] sm:text-[9vw]"
              style={{ fontVariationSettings: "'wght' 400, 'wdth' 100" }}
            >
              {item.char}
            </span>
          ))}
        </div>

        <p className="mt-8 max-w-md text-sm text-white/45">{specimen.sub}</p>

        <div className="mt-12 flex gap-8 font-mono text-[10px] uppercase tracking-widest text-white/30">
          <span>
            wght <span className="text-white/70">{axisLabel.wght}</span>
          </span>
          <span>
            wdth <span className="text-white/70">{axisLabel.wdth}</span>
          </span>
          <span>
            specimen <span className="text-white/70">{specimenIndex + 1}/3</span>
          </span>
        </div>
      </div>
    </LabStickyScroll>
  );
}
