"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import HydroflowFill from "./HydroflowFill";
import {
  HydroBottleVector,
  HydroFluidVector,
  HydroTokenVector,
} from "./LabVectors";

const INGREDIENTS = [
  "Caffeine",
  "Natural Flavor",
  "Magnesium Citrate",
  "Sodium Citrate",
  "Stevia Extract",
];

export default function HydroflowSample() {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col text-white" style={{ background: "#050d1a" }}>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#050d1a]/90 px-6 py-4 backdrop-blur">
        <span className="text-xs font-bold uppercase tracking-[0.35em] text-[#4de8ff]">
          Hydroflow
        </span>
        <div className="hidden gap-5 text-[10px] uppercase tracking-[0.15em] text-white/35 sm:flex">
          <span>Product</span>
          <span>Token</span>
          <span>FAQ</span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[50vh] w-full max-w-[900px] flex-col justify-center px-6 py-16">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#00d4ff]">
          Hydroflow — Style Sample
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-6xl">
          Tokenizing
          <br />
          <span className="text-[#4de8ff]">hydration.</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-white/55">
          {locale === "ko"
            ? "스크롤에 맞춰 병 안 액체가 차오르고, 유체 셰이더 배경이 함께 상승합니다. 마우스로 병을 회전시킬 수 있습니다."
            : "As you scroll, liquid fills the bottle while the fluid shader background rises with it. You can rotate the bottle with the mouse."}
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {INGREDIENTS.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#00d4ff]/25 px-3 py-1 text-[10px] uppercase tracking-wider text-white/45"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="mt-10 text-xs text-white/30">↓ scroll — liquid fill</div>
      </section>

      <HydroflowFill />

      <section className="mx-auto w-full max-w-[900px] px-6 py-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <HydroBottleVector />
          <HydroFluidVector />
          <HydroTokenVector />
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-12">
        <div className="mx-auto flex max-w-[900px] flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-xs text-white/35">hydroflowdrink.com ↗</span>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            R3F liquid fill · fluid GLSL · scroll scrub
          </p>
        </div>
      </footer>
    </div>
  );
}
