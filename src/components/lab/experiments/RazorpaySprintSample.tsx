"use client";

import RazorpaySprintTrack from "./RazorpaySprintTrack";
import {
  RazorpayCounterVector,
  RazorpayFlowVector,
  RazorpayLogoVector,
  RazorpayProductVector,
  RazorpayRunnerVector,
} from "./LabVectors";

const SPRINT_QUOTES = [
  "“결제는 더 이상 마지막 단계가 아니라, 쇼퍼의 여정 그 자체다.”",
  "“두 가지 색으로도 100개의 순간을 설계할 수 있다.”",
  "“클릭 한 번, 트리거 하나, 그리고 다음 장면.”",
];

export default function RazorpaySprintSample() {
  return (
    <div className="flex flex-col bg-[#151515] text-white">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#2a2a2a] bg-[#151515]/90 px-6 py-4 backdrop-blur">
        <RazorpayLogoVector />
        <div className="hidden gap-6 text-[10px] uppercase tracking-[0.2em] text-white/40 sm:flex">
          <span>Product</span>
          <span>Developers</span>
          <span className="text-[#0039FF]">Sprint 26</span>
        </div>
      </header>

      <section className="mx-auto flex min-h-[80vh] w-full max-w-[1100px] flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[#0039FF]">
          Razorpay — Style Sample
        </p>
        <h1 className="mt-4 text-5xl font-extrabold tracking-tight sm:text-7xl">
          SPRINT 26
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm text-white/55">
          단 2색 팔레트(#0039FF / #151515)와 100개 이상의 스크롤/클릭
          마이크로 인터랙션으로 쇼퍼의 결제 여정을 거대한 오브제 중심으로
          풀어낸 B2B 결제 캠페인.
        </p>
        <div className="mt-10 text-xs text-white/35">↓ scroll to advance</div>
      </section>

      <RazorpaySprintTrack />

      <section className="mx-auto w-full max-w-[1100px] px-6 py-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <RazorpayProductVector />
          <RazorpayCounterVector />
          <RazorpayFlowVector />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[800px] px-6 py-24 text-center">
        <div className="space-y-12">
          {SPRINT_QUOTES.map((quote) => (
            <p
              key={quote}
              className="text-2xl font-semibold text-white/90 sm:text-3xl"
            >
              {quote}
            </p>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1100px] px-6 py-24">
        <RazorpayRunnerVector className="h-[50vh] w-full" />
      </section>

      <footer className="border-t border-[#2a2a2a] px-6 py-12">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 sm:flex-row">
          <RazorpayLogoVector />
          <div className="flex gap-4 text-[10px] uppercase tracking-widest text-white/30">
            <span>IG</span>
            <span>X</span>
            <span>Mail</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
