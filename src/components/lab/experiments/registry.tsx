import type { ComponentType } from "react";
import HirotoSatoSignage from "./HirotoSatoSignage";
import RazorpaySprintTrack from "./RazorpaySprintTrack";
import RazorpaySprintSample from "./RazorpaySprintSample";

export type LabExperiment = {
  Demo: ComponentType;
  /** Implementation notes shown below the live demo. */
  notes: {
    libraries: string[];
    points: string[];
    snippet: { label: string; code: string };
  };
  /** Optional full-page sample mimicking the reference site's overall flow. */
  Sample?: ComponentType;
};

export const labExperiments: Record<string, LabExperiment> = {
  "hiroto-sato": {
    Demo: HirotoSatoSignage,
    Sample: undefined,
    notes: {
      libraries: [
        "@react-three/fiber — Canvas, useFrame, useThree",
        "@react-three/drei — Float (오브젝트별 독립 부유 애니메이션), Text (쇼릴/사인 텍스트)",
        "gsap + gsap/ScrollTrigger — scrub 기반의 미세한 회전 속도/카메라 줌 보정",
      ],
      points: [
        "메인 인터랙션은 스크롤이 아니라 포인터: useThree의 pointer(정규화된 -1~1) 값을 매 프레임 목표 회전값으로 사용하고, 클러스터 그룹의 현재 회전을 그 목표로 lerp 하여 부드러운 패럴럭스를 만듦.",
        "거울 디스크, 태그형 사인, 화살표형 표지판을 각각 다른 Float speed/floatIntensity로 감싸 서로 다른 리듬의 부유감을 줌 — 단일 Float로 묶지 않는 것이 핵심.",
        "거울은 실제 반사 렌더 타깃 대신 반투명 metal 디스크 뒤에 텍스트가 적힌 '쇼릴 화면' 평면을 배치해 화면-속-화면 느낌을 가볍게 흉내냄.",
        "스크롤은 보조 장치로만 사용: 섹션을 지나는 동안 ScrollTrigger scrub으로 자동 회전 속도와 카메라 z 위치를 아주 약하게만 증가시켜, 핀 고정된 긴 트랙이 아니라 일반 높이의 히어로 섹션을 유지.",
      ],
      snippet: {
        label: "포인터 패럴럭스 → 클러스터 회전 lerp",
        code: `const { pointer } = useThree();
const target = useRef({ x: 0, y: 0 });

useFrame((_, delta) => {
  target.current.x = pointer.y * 0.25;
  target.current.y = pointer.x * 0.35;

  cluster.rotation.x += (target.current.x - cluster.rotation.x) * 0.05;
  cluster.rotation.y += (target.current.y - cluster.rotation.y) * 0.05;
  cluster.rotation.y += rotationSpeedRef.current * delta; // scroll로 미세 가속
});`,
      },
    },
  },
  "razorpay-sprint-26": {
    Demo: RazorpaySprintTrack,
    Sample: RazorpaySprintSample,
    notes: {
      libraries: [
        "@react-three/fiber — Canvas, useFrame",
        "three — Group 타입, capsuleGeometry",
        "gsap + gsap/ScrollTrigger — scrub 기반 진행률 추출",
      ],
      points: [
        "ScrollTrigger의 scrub:true + onUpdate로 매 스크롤 이벤트마다 progress(0~1)를 ref에 저장 — React state는 트리거 카운터 표시용으로만 최소 업데이트.",
        "useFrame 내부에서 ref 값을 읽어 오브제(러너로 형상화)의 z 위치를 보간(lerp)하므로 60fps 애니메이션이 React 렌더 사이클과 분리됨.",
        "카메라는 오브제를 그대로 따라가지 않고 lerp로 한 프레임 늦게 추적해 100+ 트리거가 순차 발화되는 와중에도 '관성' 느낌을 만듦.",
        "씬은 sticky 컨테이너(h-screen) + 바깥 wrapper(300vh)로 스크롤 구간을 만들고, ScrollTrigger의 start/end를 그 wrapper에 바인딩 — 2색 팔레트(#0039FF/#151515)만 사용해 고밀도 트리거에도 시각적 노이즈를 줄임.",
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
  object.position.z += (z - object.position.z) * 0.1; // lerp
});`,
      },
    },
  },
};
