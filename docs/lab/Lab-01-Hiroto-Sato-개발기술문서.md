# Lab-01 — Hiroto Sato 개발기술문서

> **문서 유형:** 개발기술문서  
> **Lab 번호:** 01  
> **레퍼런스:** [Hiroto Sato — hirotos.com](https://hirotos.com)  
> **구현 URL:** `/lab/hiroto-sato`  
> **관련 Git 커밋:** `641747a`  
> **작성일:** 2026년 6월  
> **작성:** Steve Jung (with Claude Code / Cursor)  
> **대응 기획 문서:** `Lab-01-Hiroto-Sato-기획`

---

## 1. 문서 목적

본 문서는 Lab 섹션의 첫 번째 실험 **Hiroto Sato TRACK 스타일** 구현에 대한 **기술 아키텍처, 코드 구조, 핵심 패턴**을 정리합니다.

향후 Lab-02, Lab-03 … 등 모든 실험 페이지는 동일한 형식(`Lab-XX-[Name]-개발기술문서`)으로 작성합니다.

| 구분 | 기획 문서 | 개발기술문서 (본 문서) |
|------|-----------|------------------------|
| 내용 | 컨셉, UX 의도, 레퍼런스 분석 | 코드, 라이브러리, 구현 패턴, 파일 구조 |
| 대상 | 기획·디자인 참조 | 개발·유지보수·다음 Lab 추가 시 참조 |

---

## 2. 구현 개요

### 2.1 레퍼런스 시그니처

> 스크롤량에 정확히 비례해 달리는 선수의 위치가 진행되는 트랙 시뮬레이션.

원본 사이트(hirotos.com)의 **TRACK** 작품은 스크롤 거리를 육상 선수의 전진 거리로 변환합니다. 스크롤은 단순 페이지 이동이 아니라 **내러티브를 진행시키는 엔진**입니다.

### 2.2 우리 구현 범위 (Phase 1)

| 항목 | 구현 여부 | 설명 |
|------|-----------|------|
| 스크롤 → 3D 진행률 연동 | ✅ | GSAP ScrollTrigger + ref 패턴 |
| 러너(캡슐) 전진 애니메이션 | ✅ | z축 위치 + bob/stride |
| 카메라 추적 (관성 lerp) | ✅ | useFrame 내 보간 |
| 트랙/레인 마커 3D 환경 | ✅ | plane + marker mesh |
| Distance / Progress 오버레이 | ✅ | React state (UI 전용) |
| 원본 수준 GLB 캐릭터 | ❌ | Phase 2 |
| 별도 sample 라우트 | ❌ | Phase 2 (요청 시) |

### 2.3 기술 스택

| 라이브러리 | 버전 (프로젝트) | 역할 |
|------------|-----------------|------|
| Next.js | 16.x | App Router, `/lab/[slug]` 라우팅 |
| React | 19.x | UI, client component |
| @react-three/fiber | 9.x | Canvas, useFrame |
| three | 0.184.x | Geometry, Group, 카메라 |
| gsap | 3.x | ScrollTrigger scrub |
| Tailwind CSS | 4.x | 레이아웃, 오버레이 UI |

---

## 3. 파일 구조

```
src/
├── app/lab/
│   ├── page.tsx                    # Lab 32개 목록
│   └── [slug]/page.tsx             # 상세 — 레지스트리 연동
├── components/lab/experiments/
│   ├── HirotoSatoTrack.tsx         # ★ Lab-01 라이브 데모
│   └── registry.tsx                # slug → Demo + notes 매핑
└── data/
    └── lab-sites.ts                # 32개 사이트 메타데이터
```

### 3.1 역할 분리

| 파일 | 책임 |
|------|------|
| `lab-sites.ts` | slug, title, concept, techniques 등 **정적 메타** |
| `registry.tsx` | slug별 **Demo 컴포넌트 + 구현 노트** |
| `[slug]/page.tsx` | 메타 + 레지스트리 조합 → 페이지 렌더 |
| `HirotoSatoTrack.tsx` | **실제 3D + 스크롤 연동** 구현 |

> **확장 패턴:** Lab-02 추가 시 `DanzanXxx.tsx` 작성 → `registry.tsx`에 `"danzan"` 키 등록만 하면 상세 페이지 자동 연동.

---

## 4. 아키텍처 — 스크롤 ↔ 3D 연동

### 4.1 데이터 흐름

```
[사용자 스크롤]
      ↓
[300vh wrapper] ← ScrollTrigger trigger
      ↓
onUpdate → progressRef.current = 0~1   ← React 렌더 없음
      ↓
[useFrame @ 60fps] ← progressRef 읽기
      ↓
러너 position.z, 카메라 position, bob/stride
      ↓
[Canvas 렌더]

별도: progressRef → setDistance/setPercent (오버레이 UI만 React state)
```

### 4.2 핵심 설계 결정: ref + useFrame

**문제:** 스크롤마다 React state를 업데이트하면 3D 씬 전체가 리렌더되어 60fps를 유지하기 어렵습니다.

**해결:**

1. `progressRef` (mutable ref) — ScrollTrigger가 매 프레임 기록
2. `useFrame` — R3F 렌더 루프에서 ref 읽어 3D 객체 직접 조작
3. `useState` — Distance/Progress **숫자 표시**에만 사용 (최소 업데이트)

이 패턴은 **스크롤 기반 3D 포트폴리오**에서 표준적으로 사용합니다.

### 4.3 스크롤 구간 설계 (sticky pin)

```
┌─────────────────────────────┐  ← wrapper top (trigger start)
│  sticky h-screen Canvas     │  ← 화면에 고정
│  ┌─────────────────────┐    │
│  │   R3F 3D Scene      │    │
│  └─────────────────────┘    │
│                             │
│  (스크롤 계속…)              │
│                             │
└─────────────────────────────┘  ← wrapper bottom (trigger end)
         ↑ 300vh total height
```

| 설정 | 값 | 의미 |
|------|-----|------|
| wrapper height | `300vh` | 스크롤 가능 구간 (3화면) |
| inner container | `sticky top-0 h-screen` | Canvas 고정 |
| ScrollTrigger start | `"top top"` | wrapper 상단이 viewport 상단에 닿을 때 0% |
| ScrollTrigger end | `"bottom bottom"` | wrapper 하단이 viewport 하단에 닿을 때 100% |
| scrub | `true` | 스크롤 위치와 progress 1:1 동기 |

---

## 5. 컴포넌트 상세

### 5.1 `HirotoSatoTrack` (컨테이너)

**파일:** `src/components/lab/experiments/HirotoSatoTrack.tsx`

| ref / state | 타입 | 용도 |
|-------------|------|------|
| `triggerRef` | HTMLDivElement | ScrollTrigger trigger element |
| `progressRef` | number (0~1) | 3D useFrame 입력 |
| `distance` | state | UI: 0~400m 표시 |
| `percent` | state | UI: 0~100% 표시 |

**ScrollTrigger 설정:**

```typescript
ScrollTrigger.create({
  trigger: el,           // 300vh wrapper
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate: (self) => {
    progressRef.current = self.progress;
    setDistance(Math.round(self.progress * 400));
    setPercent(Math.round(self.progress * 100));
  },
});
```

**cleanup:** `return () => st.kill()` — 컴포넌트 unmount 시 ScrollTrigger 제거 (메모리 누수 방지)

### 5.2 `TrackScene` (R3F 씬)

**상수:**

| 상수 | 값 | 설명 |
|------|-----|------|
| `TRACK_LENGTH` | 60 | z축 트랙 길이 (Three.js 단위) |
| `MARKER_COUNT` | 12 | 레인 마커 개수 |

**useFrame 로직:**

```typescript
useFrame(({ camera, clock }) => {
  const progress = progressRef.current;
  const targetZ = -progress * TRACK_LENGTH;

  // 카메라: lerp 추적 (factor 0.1)
  cameraTargetZ.current += (targetZ - cameraTargetZ.current) * 0.1;

  // 러너: 즉시 z, bob/stride는 sin 파형
  runnerRef.current.position.z = targetZ;
  runnerRef.current.position.y = 0.5 + Math.abs(bob);
  runnerRef.current.rotation.x = stride * 0.3;

  // 카메라 위치 + lookAt
  camera.position.z = cameraTargetZ.current + 4;
  camera.position.y = 1.8;
  camera.lookAt(0, 0.6, cameraTargetZ.current - 2);
});
```

**lerp factor 0.1:** 카메라가 러너보다 한 프레임 늦게 따라가 **관성** 느낌을 만듭니다. 값을 높이면(0.3) 더 타이트하게, 낮추면(0.05) 더 느슨하게 추적합니다.

**bob / stride:** `Math.sin(clock.elapsedTime * 9)` — 시간 기반 달리기 모션. 스크롤과 무관하게 항상 재생됩니다.

### 5.3 3D 오브젝트 구성

| 오브젝트 | Geometry | Material | 위치/크기 |
|----------|----------|----------|-----------|
| 트랙 바닥 | plane 4 × 80 | `#1f2937` | y=0, z=-30 (중앙) |
| 레인 마커 ×12 | plane 0.15 × 1 | `#3b82f6` | x=±1.6, z 간격 5 |
| 러너 | capsule r=0.28, h=0.7 | `#f9fafb` | y=0.5, z=progress |
| ambientLight | — | intensity 0.7 | — |
| directionalLight | — | intensity 1.1 | [3, 6, 3] |

**Canvas 설정:** `camera={{ position: [0, 1.8, 4], fov: 50 }}`, `dpr={[1, 2]}`

---

## 6. 레지스트리 패턴 (`registry.tsx`)

### 6.1 타입 정의

```typescript
export type LabExperiment = {
  Demo: ComponentType;
  notes: {
    libraries: string[];
    points: string[];
    snippet: { label: string; code: string };
  };
};

export const labExperiments: Record<string, LabExperiment> = { ... };
```

### 6.2 상세 페이지 연동

`src/app/lab/[slug]/page.tsx`:

```typescript
const experiment = labExperiments[site.slug];

{experiment ? (
  <>
    <experiment.Demo />
    {/* notes.libraries, notes.points, notes.snippet */}
  </>
) : (
  /* 🚧 구현 예정 플레이스홀더 */
)}
```

### 6.3 다음 Lab 추가 체크리스트

1. `src/components/lab/experiments/[Name]Demo.tsx` 작성
2. `registry.tsx`에 slug 키 등록 (Demo + notes)
3. Google Drive `Three.js 참조` 폴더에 `Lab-XX-[Name]-개발기술문서` 작성
4. lint + build + `/lab/[slug]` smoke test
5. git commit → push

---

## 7. 상수·튜닝 가이드

| 파라미터 | 현재값 | 조정 효과 |
|----------|--------|-----------|
| wrapper height | 300vh | 스크롤 구간 길이 (길수록 천천히 진행) |
| TRACK_LENGTH | 60 | 3D 트랙 물리 길이 |
| camera lerp | 0.1 | 카메라 추적 타이트ness |
| bob amplitude | 0.06 | 수직 바운스 크기 |
| stride amplitude | 0.15 | 전후 기울기 (달리기) |
| sin frequency | 9 | bob/stride 속도 |
| distance scale | ×400 | UI 미터 표시 (progress × 400) |

---

## 8. 성능 고려사항

| 항목 | 처리 |
|------|------|
| React 리렌더 | 3D 위치는 ref + useFrame, state는 UI만 |
| ScrollTrigger cleanup | useEffect return에서 `st.kill()` |
| Canvas DPR | `[1, 2]` — retina 대응, 과도한 3 제한 |
| Geometry | 단순 primitive (plane, capsule) — GLB 없음 |
| SSR | `"use client"` — Canvas는 클라이언트 전용 |

---

## 9. 검증 결과

| 검사 | 결과 |
|------|------|
| `npm run lint` | ✅ 통과 |
| `npm run build` | ✅ 통과 |
| `/lab/hiroto-sato` HTTP 200 | ✅ |
| 라이브 데모 렌더 | ✅ |
| 구현 노트 섹션 | ✅ (플레이스홀더 대체) |
| 나머지 31 slug | 🚧 플레이스홀더 유지 |

---

## 10. Phase 2 후보 (미구현)

| 항목 | 설명 |
|------|------|
| GLB 캐릭터 | 원본에 가까운 3D 모델 로드 |
| `/lab/hiroto-sato/sample` | 독립 샘플 페이지 |
| Lenis + ScrollTrigger 통합 | 사이트 전역 smooth scroll과 연동 |
| 모바일 touch scroll | ScrollTrigger 모바일 튜닝 |
| prefers-reduced-motion | 접근성 — 정적 fallback |

---

## 11. 관련 링크

| 항목 | URL |
|------|-----|
| 레퍼런스 사이트 | https://hirotos.com |
| Lab 상세 페이지 | `/lab/hiroto-sato` |
| GitHub Repo | https://github.com/ledlaputa72/Portfolio.git |
| 브랜치 | `claude/gracious-wozniak-g7ld41` |
| Google Drive 프로젝트 | [2027년 이직 프로젝트 (with AI)](https://drive.google.com/drive/folders/1xno61id18Gvg8t87okwmF9JOAsTVbSH3) |

---

## 12. 변경 이력

| 날짜 | 버전 | 내용 |
|------|------|------|
| 2026-06-19 | v1.0 | Lab-01 Hiroto Sato Phase 1 구현 및 본 문서 작성 |
