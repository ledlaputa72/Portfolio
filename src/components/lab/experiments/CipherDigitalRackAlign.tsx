"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import LabStickyScroll from "./LabStickyScroll";
import { useLocale } from "@/i18n/LocaleProvider";

const BG = "#141618";
const BG_DARK = "#0d0e10";
const LINE = "#5a636a";
const HEADING = "#eff0f1";
const MUTED = "#939ca2";
const HYPER = "#abd233";

/** Scroll phase breakpoints (0–1) */
const PHASE = {
  heroEnd: 0.17,
  horizStart: 0.14,
  horizEnd: 0.7,
  cardsStart: 0.66,
} as const;

const HORIZ_SLIDES = [
  {
    id: "expertise",
    aspect: "578 / 325",
    maxW: "min(72%, 640px)",
    label: "Hyperscale campus",
    gradient: "linear-gradient(145deg, #1a1f24 0%, #2a3438 45%, #141618 100%)",
  },
  {
    id: "infra",
    aspect: "342 / 428",
    maxW: "min(48%, 380px)",
    label: "Compute floor",
    gradient: "linear-gradient(180deg, #0f1418 0%, #232b30 50%, #1a2228 100%)",
  },
  {
    id: "scale",
    aspect: "16 / 9",
    maxW: "min(78%, 820px)",
    label: "Industrial scale",
    gradient: "linear-gradient(120deg, #141618 0%, #2d3830 40%, #1a2420 100%)",
  },
] as const;

const COPY_PANELS = [
  {
    id: "p0",
    kicker: "Our Expertise",
    title: "End-to-end hyperscale delivery",
    body: "Power sourcing, real estate, construction, and operations — integrated for next-generation compute workloads.",
    align: "left" as const,
  },
  {
    id: "p1",
    kicker: "Our Infrastructure",
    title: "Engineered for HPC",
    body: "Rapidly scaling data center infrastructure today, to power the potential of tomorrow.",
    align: "left" as const,
  },
  {
    id: "p2",
    kicker: "Capacity at scale",
    title: "Built for Hyperscale partners",
    body: "Contracted, pipeline, and operating capacity aligned with Google, AWS, and Fluidstack.",
    align: "center" as const,
    cta: "Explore infrastructure",
  },
] as const;

const EXPERTISE_CARDS = [
  {
    id: "power",
    at: 0.7,
    step: "01",
    title: "Power sourcing",
    body: "Grid-scale procurement and on-site generation for industrial compute loads.",
  },
  {
    id: "build",
    at: 0.78,
    step: "02",
    title: "Construction & engineering",
    body: "HPC-purpose-built facilities from shell to commissioning.",
  },
  {
    id: "ops",
    at: 0.86,
    step: "03",
    title: "Operations",
    body: "24/7 hyperscale operations with hypergreen reliability targets.",
  },
  {
    id: "capacity",
    at: 0.94,
    step: "04",
    title: "Capacity pipeline",
    body: "600MW contracted · 3.2GW pipeline · 327MW operating.",
  },
] as const;

const PARTNERS = ["Google", "AWS", "Fluidstack"];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function phaseFade(p: number, start: number, end: number, fade = 0.06) {
  if (p < start - fade || p > end + fade) return 0;
  if (p < start) return smoothstep((p - (start - fade)) / fade);
  if (p > end) return smoothstep((end + fade - p) / fade);
  return 1;
}

function panelOpacity(horizP: number, index: number, total: number) {
  const center = (index + 0.5) / total;
  const dist = Math.abs(horizP - center) * total;
  return Math.max(0, 1 - dist * 1.35);
}

function cardReveal(p: number, at: number) {
  const t = smoothstep(Math.max(0, Math.min(1, (p - at) / 0.08)));
  return { opacity: t, y: (1 - t) * 24, scale: 0.96 + t * 0.04 };
}

type TensionTargets = {
  titleRule: HTMLSpanElement | null;
  mainBar: HTMLSpanElement | null;
  shell: HTMLDivElement | null;
};

function FrameDiagonal() {
  return (
    <svg
      className="cipher-frame-diagonal-svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="0.35" />
      <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.35" opacity="0.35" />
    </svg>
  );
}

function FramedMedia({
  slide,
  parallax = 0,
  scale = 1,
}: {
  slide: (typeof HORIZ_SLIDES)[number];
  parallax?: number;
  scale?: number;
}) {
  return (
    <div
      className="cipher-frame"
      style={{
        maxWidth: slide.maxW,
        transform: `translateX(${parallax * 12}px) scale(${scale})`,
      }}
    >
      <div className="cipher-frame-magnetic">
        <div className="cipher-frame-diagonal">
          <FrameDiagonal />
        </div>
        <span className="cipher-media-line cipher-media-line--left" />
        <span className="cipher-media-line cipher-media-line--right" />
        <span className="cipher-media-line cipher-media-line--top" />
        <span className="cipher-media-line cipher-media-line--bottom" />
        <span className="cipher-media-circle cipher-media-circle--tl" />
        <span className="cipher-media-circle cipher-media-circle--tr" />
        <span className="cipher-media-circle cipher-media-circle--bl" />
        <span className="cipher-media-circle cipher-media-circle--br" />
        <figure className="cipher-figure" style={{ aspectRatio: slide.aspect }}>
          <div className="cipher-figure-stack">
            <div
              className="cipher-figure-layer cipher-figure-layer--1"
              style={{ background: slide.gradient }}
            />
            <div className="cipher-figure-placeholder">
              <span className="cipher-figure-label">{slide.label}</span>
            </div>
          </div>
        </figure>
      </div>
    </div>
  );
}

export default function CipherDigitalRackAlign() {
  const { locale } = useLocale();
  const shellRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const tensionRef = useRef<TensionTargets>({
    titleRule: null,
    mainBar: null,
    shell: null,
  });
  const quickRef = useRef<{
    lineA?: gsap.QuickToFunc;
    lineB?: gsap.QuickToFunc;
    titleRule?: gsap.QuickToFunc;
    mainBar?: gsap.QuickToFunc;
    dotScale?: gsap.QuickToFunc;
  }>({});

  const [progress, setProgress] = useState(0);
  const [linesEntered, setLinesEntered] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setLinesEntered(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    quickRef.current.lineA = gsap.quickTo(shell, "--cipher-line-a", { duration: 0.9, ease: "power3.out" });
    quickRef.current.lineB = gsap.quickTo(shell, "--cipher-line-b", { duration: 0.95, ease: "power3.out" });

    const titleRuleEl = shell.querySelector<HTMLSpanElement>(".cipher-title-rule");
    const mainBarEl = shell.querySelector<HTMLSpanElement>(".cipher-main-line-bar");
    tensionRef.current = { titleRule: titleRuleEl, mainBar: mainBarEl, shell };

    if (titleRuleEl) {
      quickRef.current.titleRule = gsap.quickTo(titleRuleEl, "scaleY", {
        duration: 0.75,
        ease: "elastic.out(1, 0.55)",
      });
    }
    if (mainBarEl) {
      quickRef.current.mainBar = gsap.quickTo(mainBarEl, "scaleX", { duration: 0.7, ease: "power2.out" });
    }
    quickRef.current.dotScale = gsap.quickTo(shell, "--cipher-dot-scale", {
      duration: 0.55,
      ease: "back.out(2)",
    });
  }, [linesEntered]);

  const handleProgress = useCallback((p: number) => {
    setProgress(Math.round(p * 100));

    const shell = shellRef.current;
    const title = titleRef.current;
    if (!shell) return;

    const heroP = Math.min(1, p / PHASE.heroEnd);
    const spacerVh = lerp(25, 4, heroP);
    shell.style.setProperty("--cipher-spacer", `${spacerVh}vh`);

    if (title) {
      const titleFade = Math.max(0, 1 - heroP * 1.1);
      title.style.opacity = String(titleFade);
      title.style.filter = `blur(${lerp(0, 10, heroP)}px)`;
    }

    const tension = Math.sin(p * Math.PI) * 0.04;
    shell.style.setProperty("--cipher-grid-tension", String(1 + tension));
  }, []);

  const handlePointer = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const shell = shellRef.current;
    if (!shell) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const pull = Math.abs(nx) * 0.035;

    quickRef.current.lineA?.(lerp(25, 25 + nx * 5, 1 - pull * 0.3));
    quickRef.current.lineB?.(lerp(50, 50 + nx * 4, 1 - pull * 0.2));
    quickRef.current.titleRule?.(1 + Math.abs(ny) * 0.06);
    quickRef.current.mainBar?.(1 - Math.abs(ny) * 0.03);
    quickRef.current.dotScale?.(1 + Math.hypot(nx, ny) * 0.18);

    shell.style.setProperty("--cipher-pointer-x", String(nx));
    shell.style.setProperty("--cipher-pointer-y", String(ny));
  }, []);

  const handlePointerLeave = useCallback(() => {
    quickRef.current.lineA?.(25);
    quickRef.current.lineB?.(50);
    quickRef.current.titleRule?.(1);
    quickRef.current.mainBar?.(1);
    quickRef.current.dotScale?.(1);
    shellRef.current?.style.setProperty("--cipher-pointer-x", "0");
    shellRef.current?.style.setProperty("--cipher-pointer-y", "0");
  }, []);

  const p = progress / 100;
  const heroOpacity = phaseFade(p, 0, PHASE.heroEnd, 0.08);
  const horizOpacity = phaseFade(p, PHASE.horizStart, PHASE.horizEnd, 0.07);
  const cardsOpacity = phaseFade(p, PHASE.cardsStart, 1, 0.08);

  const horizP =
    p < PHASE.horizStart
      ? 0
      : p > PHASE.horizEnd
        ? 1
        : (p - PHASE.horizStart) / (PHASE.horizEnd - PHASE.horizStart);

  const trackX = horizP * (HORIZ_SLIDES.length - 1) * 100;
  const activePanel = Math.min(COPY_PANELS.length - 1, Math.floor(horizP * COPY_PANELS.length));

  const phaseLabel =
    p < PHASE.heroEnd ? "hero" : p < PHASE.horizEnd ? `horiz · ${activePanel + 1}/3` : "expertise";

  return (
    <LabStickyScroll
      onProgress={handleProgress}
      scrollHeightVh={780}
      stickyClassName="text-[#eff0f1]"
      hint={locale === "ko" ? "↓ 스크롤 — hero grid → 액자 이미지 → expertise 카드" : "↓ Scroll — hero grid → framed image → expertise cards"}
      showProgress={false}
    >
      <div
        className="cipher-stage relative h-full w-full overflow-hidden"
        style={
          {
            background: BG,
            "--cipher-line": LINE,
            "--cipher-heading": HEADING,
            "--cipher-spacer": "25vh",
            "--cipher-line-a": 25,
            "--cipher-line-b": 50,
            "--cipher-dot-opacity": linesEntered ? 1 : 0,
            "--cipher-dot-scale": linesEntered ? 1 : 0.35,
            "--cipher-grid-tension": 1,
            "--cipher-pointer-x": 0,
            "--cipher-pointer-y": 0,
          } as React.CSSProperties
        }
        onPointerMove={handlePointer}
        onPointerLeave={handlePointerLeave}
      >
        <style>{`
          .cipher-stage {
            --cipher-line-width: 0.5px;
            --cipher-gutter: clamp(16px, 3vw, 24px);
          }
          .cipher-layer {
            position: absolute;
            inset: 0;
            transition: opacity 0.35s ease;
          }
          .cipher-container-lines {
            pointer-events: none;
            position: absolute;
            inset: 0;
            z-index: 5;
            box-shadow:
              inset var(--cipher-line-width) 0 0 0 var(--cipher-line),
              inset calc(-1 * var(--cipher-line-width)) 0 0 0 var(--cipher-line);
          }
          .cipher-container-lines::before,
          .cipher-container-lines::after {
            content: "";
            position: absolute;
            top: 0;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--cipher-line);
            opacity: var(--cipher-dot-opacity);
            transition: opacity 0.42s ease, transform 0.8s ease;
            transition-delay: 1.08s;
          }
          .cipher-container-lines::before { left: var(--cipher-gutter); transform: translateX(-50%) scale(var(--cipher-dot-scale)); }
          .cipher-container-lines::after { right: var(--cipher-gutter); transform: translateX(50%) scale(var(--cipher-dot-scale)); }

          .cipher-shell {
            display: grid;
            grid-template-rows: minmax(0, 1fr) var(--cipher-spacer) auto;
            height: 100%;
            max-width: min(100%, 1200px);
            margin-inline: auto;
            padding-inline: var(--cipher-gutter);
            position: relative;
            z-index: 2;
            will-change: grid-template-rows;
          }
          .cipher-main { display: flex; flex-direction: column; min-height: 0; }
          .cipher-main-inner {
            flex: 1 1 auto;
            display: grid;
            grid-template-columns: repeat(12, minmax(0, 1fr));
            min-height: 0;
          }
          .cipher-main-spacer { grid-column: 1 / span 4; }
          .cipher-title-wrap {
            grid-column: 3 / span 8;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding-bottom: calc(var(--cipher-line-width) + 24px);
            padding-left: calc(var(--cipher-line-width) + 24px);
          }
          .cipher-title-rule {
            position: absolute; left: 0; top: 0; bottom: 0;
            width: var(--cipher-line-width); background: var(--cipher-line); opacity: 0.9;
            transform: scaleY(0); transform-origin: top center;
            transition: transform 0.8s ease 0.35s;
          }
          .cipher-shell.is-lines-entered .cipher-title-rule {
            transform: scaleY(var(--cipher-grid-tension));
          }
          .cipher-title {
            margin: 0;
            font-size: clamp(2rem, 4.5vw, 3.6rem);
            line-height: 1.05;
            font-weight: 400;
            letter-spacing: -0.01em;
            color: var(--cipher-heading);
            opacity: 0;
            transition: opacity 0.65s ease 0.5s;
          }
          .cipher-shell.is-lines-entered .cipher-title { opacity: 1; }
          .cipher-main-line { position: relative; height: var(--cipher-line-width); width: 100%; }
          .cipher-main-line-bar {
            position: absolute; inset: 0; background: var(--cipher-line); opacity: 0.9;
            transform: scaleX(0); transform-origin: center;
            transition: transform 0.8s ease 0.58s;
          }
          .cipher-shell.is-lines-entered .cipher-main-line-bar { transform: scaleX(1); }
          .cipher-spacer { position: relative; width: 100%; min-height: 0; }
          .cipher-spacer-lines { position: absolute; inset: 0; }
          .cipher-spacer-line {
            position: absolute; top: 0; bottom: 0;
            width: var(--cipher-line-width); background: var(--cipher-line); opacity: 0.9;
            transform: scaleY(0); transform-origin: top center;
            transition: transform 0.8s ease;
          }
          .cipher-spacer-line--a { left: calc(var(--cipher-line-a, 25) * 1%); transition-delay: 0.35s; }
          .cipher-spacer-line--b { left: calc(var(--cipher-line-b, 50) * 1%); transition-delay: 0.45s; }
          .cipher-shell.is-lines-entered .cipher-spacer-line {
            transform: scaleY(calc(var(--cipher-grid-tension) + var(--cipher-pointer-y) * 0.04));
          }
          .cipher-logos { opacity: 0; transition: opacity 0.65s ease 0.82s; padding-block: 20px; }
          .cipher-shell.is-lines-entered .cipher-logos { opacity: 1; }
          .cipher-logos-bar {
            position: relative; display: flex; align-items: center; gap: 16px;
            padding-top: calc(var(--cipher-line-width) + 12px);
          }
          .cipher-logos-bar::before {
            content: ""; position: absolute; top: 0; left: 0; right: 0;
            height: var(--cipher-line-width); background: var(--cipher-line); opacity: 0.9;
            transform: scaleX(0); transition: transform 0.8s ease 0.68s;
          }
          .cipher-shell.is-lines-entered .cipher-logos-bar::before { transform: scaleX(1); }
          .cipher-logos-label {
            font-family: ui-monospace, monospace; font-size: 10px;
            letter-spacing: 0.2em; text-transform: uppercase; color: ${MUTED};
          }
          .cipher-logos-rail {
            display: flex; gap: 28px; overflow: hidden;
            mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          }
          .cipher-logos-item {
            font-family: ui-monospace, monospace; font-size: 11px;
            letter-spacing: 0.14em; text-transform: uppercase; color: ${MUTED};
          }

          /* ── Horizontal scroll (framed media) ── */
          .cipher-horiz {
            display: flex; flex-direction: column;
            height: 100%; overflow: hidden;
          }
          .cipher-horiz-viewport {
            flex: 1 1 auto; min-height: 0; overflow: hidden; position: relative;
          }
          .cipher-horiz-track {
            display: flex; height: 100%; will-change: transform;
          }
          .cipher-horiz-slide {
            flex: 0 0 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            padding-inline: var(--cipher-gutter);
            box-sizing: border-box;
          }
          .cipher-horiz-slide--center { align-items: center; }
          .cipher-horiz-grid {
            display: grid; grid-template-columns: repeat(12, 1fr);
            gap: 0; width: 100%; max-width: 1100px; align-items: center;
          }
          .cipher-horiz-media-cell {
            grid-column: 1 / span 7;
            display: flex; justify-content: flex-start;
          }
          .cipher-horiz-slide:nth-child(2) .cipher-horiz-media-cell {
            grid-column: 1 / span 5;
          }
          .cipher-horiz-slide:nth-child(3) .cipher-horiz-media-cell {
            grid-column: 1 / -1;
            justify-content: center;
          }

          .cipher-frame {
            position: relative; width: 100%;
            transform-origin: center center;
            transition: transform 0.4s ease;
          }
          .cipher-frame-magnetic { position: relative; width: 100%; }
          .cipher-frame-diagonal {
            position: absolute; inset: 0; color: var(--cipher-line);
            opacity: 0.85; pointer-events: none; z-index: 0;
          }
          .cipher-frame-diagonal-svg { display: block; width: 100%; height: 100%; }
          .cipher-media-line {
            position: absolute; background: var(--cipher-line);
            pointer-events: none; z-index: 6;
          }
          .cipher-media-line--left,
          .cipher-media-line--right {
            top: 50%; width: var(--cipher-line-width); height: 200vh;
            transform: translateY(-50%);
          }
          .cipher-media-line--left { left: 0; }
          .cipher-media-line--right { right: 0; }
          .cipher-media-line--top,
          .cipher-media-line--bottom {
            left: 50%; height: var(--cipher-line-width); width: 200vw;
          }
          .cipher-media-line--top { top: 0; transform: translate(-50%, calc(-1 * var(--cipher-line-width))); }
          .cipher-media-line--bottom { bottom: 0; transform: translate(-50%, var(--cipher-line-width)); }
          .cipher-media-circle {
            position: absolute; width: 10px; height: 10px;
            border-radius: 50%; background: var(--cipher-line); z-index: 6;
          }
          .cipher-media-circle--tl { left: 0; top: 0; transform: translate(-50%, -50%); }
          .cipher-media-circle--tr { right: 0; top: 0; transform: translate(50%, -50%); }
          .cipher-media-circle--bl { left: 0; bottom: 0; transform: translate(-50%, 50%); }
          .cipher-media-circle--br { right: 0; bottom: 0; transform: translate(50%, 50%); }
          .cipher-figure {
            position: relative; margin: 0; overflow: hidden; width: 100%; z-index: 1;
          }
          .cipher-figure-stack { position: relative; width: 100%; height: 100%; min-height: 120px; }
          .cipher-figure-layer { position: absolute; inset: 0; }
          .cipher-figure-placeholder {
            position: absolute; inset: 0; display: flex; align-items: flex-end;
            padding: 16px; z-index: 2;
          }
          .cipher-figure-label {
            font-family: ui-monospace, monospace; font-size: 9px;
            letter-spacing: 0.2em; text-transform: uppercase; color: ${MUTED};
          }

          .cipher-copy-float {
            position: absolute; inset: 0; z-index: 8;
            pointer-events: none;
            max-width: min(100%, 1100px);
            margin-inline: auto;
            padding-inline: var(--cipher-gutter);
          }
          .cipher-copy-panels { position: relative; height: 100%; width: 100%; }
          .cipher-copy-panel {
            position: absolute; inset: 0;
            display: flex; flex-direction: column; justify-content: center;
            gap: 20px; padding-left: 52%;
            box-sizing: border-box;
          }
          .cipher-copy-panel--center {
            padding-left: 0; align-items: center; text-align: center;
          }
          .cipher-copy-kicker {
            font-family: ui-monospace, monospace; font-size: 10px;
            letter-spacing: 0.28em; text-transform: uppercase; color: ${MUTED};
          }
          .cipher-copy-title {
            font-size: clamp(1.35rem, 2.8vw, 2rem);
            font-weight: 500; letter-spacing: -0.02em; color: ${HEADING};
            max-width: 22ch; line-height: 1.15;
          }
          .cipher-copy-panel--center .cipher-copy-title { max-width: 28ch; font-size: clamp(1.5rem, 3vw, 2.25rem); }
          .cipher-copy-body {
            font-size: 0.875rem; line-height: 1.6; color: #c4ccd1; max-width: 42ch;
          }
          .cipher-copy-cta {
            margin-top: 8px; align-self: flex-start;
            font-family: ui-monospace, monospace; font-size: 10px;
            letter-spacing: 0.18em; text-transform: uppercase;
            color: ${HYPER}; border-bottom: 1px solid ${HYPER}40;
            padding-bottom: 4px;
          }
          .cipher-copy-panel--center .cipher-copy-cta { align-self: center; }

          .cipher-gutter-dots span {
            position: absolute; width: 10px; height: 10px;
            border-radius: 50%; background: var(--cipher-line);
          }
          .cipher-gutter-dots .tl { left: var(--cipher-gutter); top: 18%; transform: translate(-50%, -50%); }
          .cipher-gutter-dots .tr { right: var(--cipher-gutter); top: 18%; transform: translate(50%, -50%); }
          .cipher-gutter-dots .bl { left: var(--cipher-gutter); bottom: 18%; transform: translate(-50%, 50%); }
          .cipher-gutter-dots .br { right: var(--cipher-gutter); bottom: 18%; transform: translate(50%, 50%); }

          /* ── Expertise cards phase ── */
          .cipher-cards-layer {
            display: grid; grid-template-columns: repeat(12, 1fr);
            gap: 0; height: 100%; padding-inline: var(--cipher-gutter);
            max-width: 1100px; margin-inline: auto; align-items: center;
          }
          .cipher-cards-stack {
            grid-column: 2 / span 10;
            display: flex; flex-direction: column; gap: 12px;
          }
          .cipher-expertise-card {
            border: var(--cipher-line-width) solid ${LINE}40;
            background: ${BG_DARK}e6;
            padding: 20px 24px;
            backdrop-filter: blur(8px);
          }
          .cipher-expertise-step {
            font-family: ui-monospace, monospace; font-size: 9px;
            letter-spacing: 0.22em; text-transform: uppercase; color: ${HYPER};
          }
          .cipher-expertise-title {
            margin-top: 8px; font-size: 1.05rem; font-weight: 500; color: ${HEADING};
          }
          .cipher-expertise-body {
            margin-top: 6px; font-size: 0.8rem; line-height: 1.55; color: #c4ccd1;
          }
          .cipher-metrics-row {
            grid-column: 2 / span 10;
            display: flex; flex-wrap: wrap; gap: 10px;
            margin-top: 8px;
          }
          .cipher-metric {
            border: 1px solid ${HYPER}30;
            padding: 10px 14px; min-width: 100px;
          }
          .cipher-metric-val {
            font-family: ui-monospace, monospace; font-size: 0.95rem;
            color: ${HYPER}; font-weight: 500;
          }
          .cipher-metric-lbl {
            font-family: ui-monospace, monospace; font-size: 8px;
            letter-spacing: 0.16em; text-transform: uppercase; color: ${MUTED};
            margin-top: 4px;
          }
        `}</style>

        {/* ── Phase 1: Hero grid ── */}
        <div className="cipher-layer" style={{ opacity: heroOpacity, zIndex: heroOpacity > 0.02 ? 3 : 0 }}>
          <div
            ref={shellRef}
            className={`cipher-shell ${linesEntered ? "is-lines-entered" : ""}`}
          >
            <div className="cipher-main">
              <div className="cipher-main-inner">
                <div className="cipher-main-spacer" aria-hidden />
                <div className="cipher-title-wrap">
                  <span className="cipher-title-rule" aria-hidden />
                  <h2 ref={titleRef} className="cipher-title">
                    Built for
                    <br />
                    Hyperscale.
                  </h2>
                </div>
              </div>
              <div className="cipher-main-line" aria-hidden>
                <span className="cipher-main-line-bar" />
              </div>
            </div>
            <div className="cipher-spacer" aria-hidden>
              <div className="cipher-spacer-lines">
                <span className="cipher-spacer-line cipher-spacer-line--a" />
                <span className="cipher-spacer-line cipher-spacer-line--b" />
              </div>
            </div>
            <div className="cipher-logos" aria-label="Partner logos">
              <div className="cipher-logos-bar">
                <p className="cipher-logos-label">Trusted by</p>
                <div className="cipher-logos-rail">
                  {[...PARTNERS, ...PARTNERS].map((name, i) => (
                    <span key={`${name}-${i}`} className="cipher-logos-item">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Phase 2: Horizontal framed media + copy swap ── */}
        <div
          className="cipher-layer cipher-horiz"
          style={{ opacity: horizOpacity, zIndex: horizOpacity > 0.02 ? 4 : 0 }}
        >
          <div className="cipher-gutter-dots pointer-events-none" aria-hidden>
            <span className="tl" />
            <span className="tr" />
            <span className="bl" />
            <span className="br" />
          </div>

          <div className="cipher-horiz-viewport">
            <div
              className="cipher-horiz-track"
              style={{ transform: `translate3d(-${trackX}%, 0, 0)` }}
            >
              {HORIZ_SLIDES.map((slide, i) => {
                const slideCenter = i / (HORIZ_SLIDES.length - 1);
                const dist = Math.abs(horizP - slideCenter);
                const localScale = 0.92 + Math.max(0, 1 - dist * 2.5) * 0.08;
                const parallax = (horizP - slideCenter) * 2;
                return (
                  <div
                    key={slide.id}
                    className={`cipher-horiz-slide ${i === 2 ? "cipher-horiz-slide--center" : ""}`}
                  >
                    <div className="cipher-horiz-grid">
                      <div className="cipher-horiz-media-cell">
                        <FramedMedia slide={slide} parallax={parallax} scale={localScale} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cipher-copy-float">
              <div className="cipher-copy-panels">
                {COPY_PANELS.map((panel, i) => {
                  const o = panelOpacity(horizP, i, COPY_PANELS.length);
                  return (
                    <div
                      key={panel.id}
                      className={`cipher-copy-panel ${panel.align === "center" ? "cipher-copy-panel--center" : ""}`}
                      style={{ opacity: o, pointerEvents: o > 0.5 ? "auto" : "none" }}
                    >
                      <p className="cipher-copy-kicker">{panel.kicker}</p>
                      <p className="cipher-copy-title">{panel.title}</p>
                      <p className="cipher-copy-body">{panel.body}</p>
                      {"cta" in panel && panel.cta ? (
                        <span className="cipher-copy-cta">{panel.cta}</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Phase 3: Expertise cards ── */}
        <div
          className="cipher-layer"
          style={{ opacity: cardsOpacity, zIndex: cardsOpacity > 0.02 ? 5 : 0 }}
        >
          <div className="cipher-cards-layer">
            <div className="cipher-cards-stack">
              {EXPERTISE_CARDS.map((card) => {
                const reveal = cardReveal(p, card.at);
                return (
                  <div
                    key={card.id}
                    className="cipher-expertise-card"
                    style={{
                      opacity: reveal.opacity,
                      transform: `translateY(${reveal.y}px) scale(${reveal.scale})`,
                    }}
                  >
                    <p className="cipher-expertise-step">{card.step}</p>
                    <p className="cipher-expertise-title">{card.title}</p>
                    <p className="cipher-expertise-body">{card.body}</p>
                  </div>
                );
              })}
            </div>
            {p > 0.92 ? (
              <div className="cipher-metrics-row">
                {[
                  { label: "Contracted", value: "600MW" },
                  { label: "Pipeline", value: "3.2GW" },
                  { label: "Operating", value: "327MW" },
                ].map((m) => (
                  <div key={m.label} className="cipher-metric">
                    <p className="cipher-metric-val">{m.value}</p>
                    <p className="cipher-metric-lbl">{m.label}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="cipher-container-lines" aria-hidden />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 py-6 sm:px-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#939ca2]">
            Cipher Digital
          </span>
          <span className="font-mono text-[10px] tabular-nums text-[#abd233]">
            {phaseLabel} · {progress}%
          </span>
        </div>
      </div>
    </LabStickyScroll>
  );
}
