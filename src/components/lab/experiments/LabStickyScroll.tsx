"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type LabStickyScrollHandle = {
  scrollToProgress: (progress: number, duration?: number) => gsap.core.Tween | null;
  getProgress: () => number;
};

export type LabStickyScrollProps = {
  children: ReactNode;
  /** Total scroll track height in viewport units */
  scrollHeightVh?: number;
  /** Mutable ref filled with scrub progress 0–1 */
  progressRef?: React.RefObject<number>;
  onProgress?: (progress: number) => void;
  className?: string;
  stickyClassName?: string;
  hint?: string;
  showProgress?: boolean;
  progressLabel?: string;
};

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

const LabStickyScroll = forwardRef<LabStickyScrollHandle, LabStickyScrollProps>(
  function LabStickyScroll(
    {
      children,
      scrollHeightVh = 300,
      progressRef: externalProgressRef,
      onProgress,
      className = "",
      stickyClassName = "",
      hint,
      showProgress = true,
      progressLabel = "Scroll Progress",
    },
    ref,
  ) {
    const triggerRef = useRef<HTMLDivElement>(null);
    const stRef = useRef<ScrollTrigger | null>(null);
    const internalProgressRef = useRef(0);
    const progressRef = externalProgressRef ?? internalProgressRef;
    const [percent, setPercent] = useState(0);

    useImperativeHandle(ref, () => ({
      getProgress: () => progressRef.current,
      scrollToProgress(progress: number, duration = 0) {
        const st = stRef.current;
        if (!st) return null;

        const target = st.start + (st.end - st.start) * clamp01(progress);
        const startY = window.scrollY;

        if (duration <= 0) {
          st.scroll(target);
          return null;
        }

        const proxy = { y: startY };
        return gsap.to(proxy, {
          y: target,
          duration,
          ease: "power4.inOut",
          onUpdate: () => {
            st.scroll(proxy.y);
          },
        });
      },
    }));

    useEffect(() => {
      const el = triggerRef.current;
      if (!el) return;

      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          onProgress?.(self.progress);
          if (showProgress) setPercent(Math.round(self.progress * 100));
        },
      });
      stRef.current = st;

      return () => {
        st.kill();
        stRef.current = null;
      };
    }, [onProgress, progressRef, showProgress]);

    return (
      <div
        ref={triggerRef}
        className={`relative ${className}`}
        style={{ height: `${scrollHeightVh}vh` }}
      >
        <div
          className={`sticky top-0 h-screen w-full overflow-hidden ${stickyClassName}`}
        >
          {children}

          {hint ? (
            <div className="pointer-events-none absolute left-6 top-6 z-20 text-xs opacity-50">
              {hint}
            </div>
          ) : null}

          {showProgress ? (
            <div className="pointer-events-none absolute bottom-6 right-6 z-20 text-right">
              <p className="text-[10px] uppercase tracking-widest opacity-50">
                {progressLabel}
              </p>
              <p className="text-3xl font-bold tabular-nums">{percent}%</p>
            </div>
          ) : null}
        </div>
      </div>
    );
  },
);

export default LabStickyScroll;
