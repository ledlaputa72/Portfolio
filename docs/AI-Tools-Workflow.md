# AI 도구 역할 정의서 — 포트폴리오 프로젝트

> **문서 버전:** v1.0  
> **작성일:** 2026년 6월  
> **작성자:** Steve Jung (with Claude / Cursor)  
> **프로젝트:** 2027년 이직 프로젝트 — B2B Hardware Marketing Manager 포트폴리오 사이트  
> **관련 저장소:** https://github.com/ledlaputa72/Portfolio.git  
> **작업 브랜치:** `claude/gracious-wozniak-g7ld41`  
> **로컬 경로:** `D:\New Steve\AI Portfolio`  
> **Google Drive:** [2027년 이직 프로젝트 (with AI)](https://drive.google.com/drive/folders/1xno61id18Gvg8t87okwmF9JOAsTVbSH3)

---

## 문서 목적

이 문서는 포트폴리오 사이트 제작에 사용하는 AI 도구들의 **역할, 담당 범위, 협업 규칙**을 정의합니다.

**Claude (대화), Claude Code (웹), Cursor (로컬), Gemini** 등 모든 AI 세션에서 이 문서를 기준 문서로 참조하세요.  
작업 시작 시 Google Drive 링크 또는 이 파일을 첨부·공유하면, 도구 간 역할 충돌 없이 일관되게 작업을 이어갈 수 있습니다.

**함께 참조할 문서**

| 문서 | 용도 |
|------|------|
| `Portfolio_Site_PlanBook_v1.0` | 사이트 IA, 디자인 시스템, 콘텐츠, 로드맵 (마스터 기획서) |
| `web-build-research-handoff.md` | Framer / Webflow / 직접 코딩 기술 조사 결과 |
| `AI-Tools-Workflow.md` (본 문서) | AI 도구 역할 분담 및 Git 협업 규칙 |
| `포트폴리오 사이트 자료 정리/` | 케이스 스터디 EN/KO 텍스트 (10개) |
| `레퍼런스 사이트/` | Three.js 및 디자인 레퍼런스 |

---

## 1. 핵심 원칙

### 1.1 단일 진실 소스 (Single Source of Truth)

```
Claude Code (웹)  ←→  GitHub Repo  ←→  Cursor (로컬)
     기획·구조·콘텐츠              코드·UI·로컬 검증
```

- **코드의 기준:** GitHub 저장소 `ledlaputa72/Portfolio`, 브랜치 `claude/gracious-wozniak-g7ld41`
- **기획의 기준:** Google Drive `Portfolio_Site_PlanBook_v1.0`
- **콘텐츠의 기준:** Google Drive `포트폴리오 사이트 자료 정리/` 폴더

### 1.2 기술 스택 (확정)

| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 3D | React Three Fiber + Three.js |
| 애니메이션 | GSAP |
| 스크롤 | Lenis |
| 스타일 | Tailwind CSS v4 |
| 배포 (예정) | Vercel |
| **사용하지 않음** | Framer (기획서 v1.0 1순위였으나 Next.js 직접 코딩으로 확정), **v0** |

> 기술 스택 상세 근거: `web-build-research-handoff.md` — Three.js가 Hero 중심 경험이므로 직접 코딩(Next.js + R3F)이 적합.

### 1.3 Git 협업 규칙 (필수)

| 시점 | 명령 |
|------|------|
| **작업 시작 전** | `git pull origin claude/gracious-wozniak-g7ld41` |
| **작업 완료 후** | `git add -A` → `git commit -m "작업 설명"` → `git push origin claude/gracious-wozniak-g7ld41` |
| **다른 도구로 넘길 때** | "○○에서 작업했으니 pull하고 [다음 작업] 이어서 진행해줘" |

---

## 2. AI 도구별 역할 정의

### 2.1 Claude Code (Anthropic — 웹/클라우드)

**정의:** GitHub 저장소에 연결된 클라우드 코딩 환경. 멀티파일 구현, 기획, 콘텐츠 작성, 배포 설정에 최적.

| 역할 | 구체적 작업 |
|------|------------|
| **전략·기획** | 페이지 구조, IA, 컴포넌트 설계, Phase별 우선순위 |
| **텍스트 콘텐츠** | Hero 카피, About 바이오, 케이스 스터디 교정·영문화 |
| **멀티파일 구현** | 새 페이지·라우트·섹션 단위 큰 덩어리 생성 |
| **아키텍처** | 스택, 폴더 구조, SEO 메타, 데이터 모델 |
| **문서·체크리스트** | 기획서 업데이트, 콘텐츠 준비 현황 |
| **배포·인프라** | Vercel 연결, 도메인, CI/CD, 환경 변수 |

**Claude Code에 맡기기 좋은 요청 예시**

- "케이스 스터디 5개 페이지 템플릿과 라우트를 한 번에 만들어줘"
- "Drive의 CaseStudy_01 EN 문서 기준으로 `/work/avycon-renewal` 페이지 작성"
- "About 섹션 바이오 초안 3안 작성"
- "Phase 3 로드맵 기준으로 다음 작업 목록 정리"
- "Vercel 배포 설정해줘"

**세션 시작 프롬프트**

> GitHub `claude/gracious-wozniak-g7ld41` pull하고, Drive 기획서(`Portfolio_Site_PlanBook_v1.0`)와 `AI-Tools-Workflow.md` 기준으로 [작업] 진행해줘.

**강점:** 넓은 맥락 유지, Google Drive·기획서 참조, 큰 단위 작업을 한 세션에서 처리, Repo 초기 구축 (현재 Repo는 Claude Code로 제작됨)

**약점:** 로컬 브라우저 실시간 확인 불가, 3D·애니메이션 픽셀 단위 튜닝에 한계

---

### 2.2 Cursor (로컬 IDE + AI)

**정의:** Windows 로컬 개발 환경 (`D:\New Steve\AI Portfolio`). 로컬 dev server, 브라우저 검증, UI 미세 조정, 디버깅에 최적.

| 역할 | 구체적 작업 |
|------|------------|
| **로컬 개발·검증** | `npm run dev`, http://localhost:3000 실시간 확인 |
| **UI 미세 조정** | 간격, 색상, 타이포, 애니메이션 타이밍, 반응형 |
| **3D·인터랙션 디버깅** | R3F, GSAP, Lenis 동작 확인 및 수정 |
| **버그 수정** | 콘솔 에러, 빌드 실패, TypeScript/ESLint |
| **성능·품질** | Lighthouse, 모바일, `prefers-reduced-motion` |
| **Git 실무** | pull → 작업 → commit → push |

**Cursor에 맡기기 좋은 요청 예시**

- "Hero 3D 씬이 모바일에서 깨져 — 수정해줘"
- "Impact Numbers 카운트업 애니메이션 추가"
- "케이스 스터디 카드 hover를 기획서 스펙대로 적용"
- "빌드 에러 수정하고 lint 통과시켜줘"
- "375px 모바일에서 네비게이션 확인하고 수정"

**세션 시작 프롬프트**

> `git pull origin claude/gracious-wozniak-g7ld41` 하고, `AI-Tools-Workflow.md`와 기획서 기준으로 [로컬 검증·수정 작업] 진행해줘.

**강점:** 로컬 서버·실기기 확인, 픽셀·애니메이션 단위 수정, 빠른 시행착오

**약점:** 대규모 콘텐츠 작성·기획 문서 작성은 Claude Code가 더 효율적

---

### 2.3 Claude (Anthropic — 대화 / Artifacts)

**정의:** claude.ai 웹 대화. Claude Code와 별개로, 기획 논의, 텍스트 작성, HTML/React 프로토타입(Artifacts), 문서 작성에 사용.

| 역할 | 구체적 작업 |
|------|------------|
| **전략 기획** | 포지셔닝, 메시지, 타겟 회사 분석 |
| **텍스트 콘텐츠** | Hero 카피, About 바이오, LinkedIn 헤드라인 |
| **코드 프로토타입** | Artifacts로 섹션별 HTML/React 빠른 시각화 |
| **문서 작성** | 기획서, 체크리스트, AI 워크플로 문서 (본 문서 포함) |
| **케이스 스터디 교정** | EN/KO 텍스트 톤·문법·임팩트 강화 |

**Claude (대화)에 맡기기 좋은 요청 예시**

- "Hero 카피 3안 작성해줘 — B2B Hardware Marketing Manager 포지셔닝"
- "CaseStudy_03 EN 문서를 채용담당자 관점에서 더 임팩트 있게 다듬어줘"
- "About 바이오 영문 300자 작성"
- "다크 테마 Hero 섹션 React Artifacts로 프로토타입 만들어줘"

**Claude Code와의 구분**

| | Claude (대화) | Claude Code |
|---|--------------|-------------|
| Repo 직접 수정 | ❌ (Artifacts·복붙) | ✅ |
| 대규모 멀티파일 | ❌ | ✅ |
| 기획·텍스트·프로토타입 | ✅ 주 | △ 보조 |
| Git push | ❌ | ✅ |

---

### 2.4 Gemini (Google)

**정의:** Google Workspace·Drive 연동, 이미지 분석, 대용량 문서 처리에 강점. **보조 도구**로 사용.

| 역할 | 구체적 작업 |
|------|------------|
| **Google Drive 연동** | Drive에 저장된 기획서·케이스 스터디 직접 읽기 |
| **이미지 분석** | 작업물 스크린샷 업로드 → Framer/섹션용 카피 생성 |
| **대용량 문서** | 긴 PDF·다중 파일 한 번에 분석 |
| **한국어·영문 혼용** | 바이링구얼 콘텐츠 검토 |

**Gemini에 맡기기 좋은 요청 예시**

- "Drive의 CaseStudy 폴더 전체 읽고 Hero Impact 수치 추천해줘"
- "이 AVYCON 스크린샷 보고 케이스 스터디 Results 섹션 카피 작성"
- "기획서와 케이스 스터디 간 불일치 찾아줘"

**역할:** Claude / Claude Code / Cursor의 **보조**. 코드 구현·Git 작업은 Gemini가 아닌 Claude Code 또는 Cursor 담당.

---

### 2.5 사용하지 않는 도구

| 도구 | 상태 | 이유 |
|------|------|------|
| **v0 (Vercel)** | ❌ 사용 안 함 | Cursor + Claude Code로 UI 컴포넌트 생성 대체 |
| **Framer** | ❌ 사용 안 함 | Next.js 직접 코딩으로 확정 (`web-build-research-handoff.md`) |
| **Webflow** | ❌ 사용 안 함 | 동일 |

---

## 3. 작업 유형별 담당 매트릭스

| 작업 유형 | Claude Code | Cursor | Claude (대화) | Gemini |
|----------|:-----------:|:------:|:-------------:|:------:|
| 새 페이지/섹션 **골격** | ✅ 주 | △ | △ | — |
| Hero·3D·스크롤 **미세 튜닝** | △ | ✅ 주 | — | — |
| 케이스 스터디 **텍스트** | ✅ | △ | ✅ 주 | △ |
| 케이스 스터디 **레이아웃·이미지** | △ | ✅ 주 | — | △ |
| **버그·빌드·lint** | △ | ✅ 주 | — | — |
| **기획·로드맵·문서** | ✅ | △ | ✅ 주 | △ |
| **배포·Vercel·도메인** | ✅ 주 | △ | — | — |
| Drive **이미지 → 카피** | — | — | △ | ✅ 주 |
| **SEO 메타·sitemap** | ✅ 주 | △ | — | — |

**범례:** ✅ 주 = 주 담당 · △ = 보조 · — = 해당 없음

---

## 4. 권장 워크플로 패턴

### 패턴 A — Claude Code 선행 (구조·콘텐츠)

1. **Claude Code:** "Work 섹션 + Case 01 페이지 구현" → push  
2. **Cursor:** `git pull` → 로컬 확인·UI 다듬기 → push  
3. **Claude Code:** "pull 후 Case 02~05 동일 패턴" → push  

**적합:** 새 페이지 추가, 케이스 스터디 템플릿, About/Contact 골격

### 패턴 B — Cursor 선행 (UI·디버깅)

1. **Cursor:** Hero 애니메이션·반응형 수정 → push  
2. **Claude Code:** "Cursor에서 Hero 수정했으니 pull 후 About 이어서" → push  

**적합:** 3D 씬, GSAP, 모바일, 성능 최적화

### 패턴 C — 병렬 (충돌 최소화)

| Claude Code | Cursor |
|-------------|--------|
| About 텍스트·Contact 폼 | Gallery 필터·3D Hero |
| Case 03~05 페이지 | Case 01~02 UI 튜닝 |
| Vercel 배포 | Lighthouse·모바일 QA |

**주의:** 같은 파일 동시 수정 금지. 작업 전 항상 `git pull`.

---

## 5. 세션 시작 체크리스트

모든 AI 도구 세션 시작 시:

- [ ] `git pull origin claude/gracious-wozniak-g7ld41` (코드 작업 시)
- [ ] `Portfolio_Site_PlanBook_v1.0` 기획서 참조 확인
- [ ] `AI-Tools-Workflow.md` (본 문서) 역할 확인
- [ ] 이번 세션 담당 도구·작업 범위 명확히 (다른 도구와 겹치지 않게)
- [ ] 작업 완료 시 commit + push

---

## 6. 핸드오프 문구 (복사용)

**Claude Code로 넘길 때 (Cursor에서 작업 후)**

> Cursor에서 [작업 내용] 수정 후 push했어. pull하고 [다음 작업] 이어서 진행해줘. `AI-Tools-Workflow.md`와 기획서 참조.

**Cursor로 넘길 때 (Claude Code에서 작업 후)**

> Claude Code에서 [작업 내용] push했어. `D:\New Steve\AI Portfolio`에서 pull하고 로컬 dev server로 확인한 뒤 [UI/3D/버그] 작업해줘.

**Claude (대화)에서 텍스트만 받을 때**

> 아래 텍스트를 CaseStudy_02 EN에 반영해서 Claude Code 또는 Cursor에 전달할 수 있게 정리해줘. [텍스트]

---

## 7. 프로젝트 현황 스냅샷 (2026-06)

| 항목 | 상태 |
|------|------|
| Next.js + R3F + GSAP + Lenis | ✅ 구현됨 |
| 디자인 시스템 (컬러·타이포) | ✅ `globals.css` 반영 |
| Home Hero + Impact Numbers | ✅ 기본 구현 |
| 케이스 스터디 5페이지 | ⏳ 미구현 |
| About / Gallery / Contact | ⏳ 미구현 |
| 케이스 스터디 텍스트 (EN/KO) | ✅ Drive 저장 |
| Hero 카피·About 바이오 | ⏳ 미완 |
| 이미지·프로필 사진 | ⏳ 수집 필요 |

---

## 8. 문서 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026-06 | 최초 작성 — Claude Code + Cursor 병행, v0 제외 |

---

*이 문서를 Claude · Claude Code · Cursor · Gemini 작업 시 마스터 기준으로 참조하세요.*
