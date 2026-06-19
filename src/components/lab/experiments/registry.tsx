import type { ComponentType } from "react";
import HirotoSatoTrack from "./HirotoSatoTrack";

export type LabExperiment = {
  Demo: ComponentType;
  /** Implementation notes shown below the live demo. */
  notes: {
    libraries: string[];
    points: string[];
    snippet: { label: string; code: string };
  };
};

export const labExperiments: Record<string, LabExperiment> = {
  "hiroto-sato": {
    Demo: HirotoSatoTrack,
    notes: {
      libraries: [
        "@react-three/fiber — Canvas, useFrame",
        "three — Group 타입, capsuleGeometry",
        "gsap + gsap/ScrollTrigger — scrub 기반 진행률 추출",
      ],
      points: [
        "ScrollTrigger의 scrub:true + onUpdate로 매 스크롤 이벤트마다 progress(0~1)를 ref에 저장 — React state는 오버레이 숫자 표시용으로만 최소 업데이트.",
        "useFrame 내부에서 ref 값을 읽어 러너 z 위치를 보간(lerp)하므로 60fps 애니메이션이 React 렌더 사이클과 분리됨.",
        "카메라는 러너를 그대로 따라가지 않고 lerp로 한 프레임 늦게 추적해 '관성' 느낌을 만듦.",
        "트랙은 sticky 컨테이너(h-screen) + 바깥 wrapper(300vh)로 스크롤 구간을 만들고, ScrollTrigger의 start/end를 그 wrapper에 바인딩.",
      ],
      snippet: {
        label: "스크롤 progress → 3D 위치 연동 핵심 구조",
        code: `const progressRef = useRef(0);

useEffect(() => {
  const st = ScrollTrigger.create({
    trigger: wrapperEl,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      progressRef.current = self.progress; // 0~1
    },
  });
  return () => st.kill();
}, []);

// R3F 컴포넌트 내부
useFrame(() => {
  const z = -progressRef.current * TRACK_LENGTH;
  runner.position.z += (z - runner.position.z) * 0.1; // lerp
});`,
      },
    },
  },
};
